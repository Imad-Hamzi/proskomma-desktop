import React from 'react';

import { renderVersesItems } from './render_utils';
import BrowseChapterNavigation from "./browse_chapter_navigation";

const BrowseChapter = (props) => {
  const [result, setResult] = React.useState({});
  const chapterQueryTemplate =
    '{' +
    '  docSet(id:"%docSetId%") {' +
    '    document(bookCode: "%bookCode%") {' +
    '      title: header(id: "toc2")' +
    '      cv (chapter:"%chapter%") {' +
    '        items { type subType payload }' +
    '      }' +
    '      nav: cvNavigation(chapter:"%chapter%" verse: "1") {' +
    '        previousChapter' +
    '        nextChapter' +
    '      }' +
    '    }' +
    '  }' +
    '}';

  React.useEffect(() => {
    const doQuery = async () => {
      if (props.state.selectedDocument) {
        const browseQuery = chapterQueryTemplate
          .replace(/%docSetId%/g, props.state.selectedDocSet.get)
          .replace(/%bookCode%/g, props.state.selectedBook.get)
          .replace(/%chapter%/g, props.state.selectedChapter.get);
        const res = await props.pk.gqlQuery(browseQuery);
        setResult(res);
      }
    };
    doQuery();
  }, [
    props.state.selectedDocSet.get,
    props.state.selectedBook.get,
    props.state.selectedChapter.get,
    props.state.selectedVerse.get,
    props.renderMode,
  ]);
  if (result.data && result.data.docSet) {
    const scriptureTitle = <>{result.data.docSet.document.title} {props.state.selectedChapter.get}</>;
    const scriptureText =
      'cv' in result.data.docSet.document ? (
        <p>{renderVersesItems(result.data.docSet.document.cv[0].items, props.state.selectedVerse.set, props.setRenderMode)}</p>
      ) : (
        ''
      );
    return (
      <>
        <h3>
          <BrowseChapterNavigation state={props.state} direction="previous" destination={result.data.docSet.document.nav.previousChapter} />
          {scriptureTitle}
          <BrowseChapterNavigation state={props.state} direction="next" destination={result.data.docSet.document.nav.nextChapter} />
          {' (click on verse number to select verse)'}
        </h3>
        {scriptureText}
      </>
    );
  }
  return <div>No docSet selected</div>;
};

export default BrowseChapter;
