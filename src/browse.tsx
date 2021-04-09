import React from 'react';

import BrowseModeSwitcher from './browse_mode_switcher';

const verseQueryTemplate =
  '{' +
  '  docSet(id:"%docSetId%") {' +
  '    document(bookCode: "%bookCode%") {' +
  '      title: header(id: "toc2")' +
  '      cv (chapter:"%chapter%" verses:["%verse%"]) { text }' +
  '    }' +
  '  }' +
  '}';

const chapterQueryTemplate =
  '{' +
  '  docSet(id:"%docSetId%") {' +
  '    document(bookCode: "%bookCode%") {' +
  '      title: header(id: "toc2")' +
  '      cv (chapter:"%chapter%") { text }' +
  '    }' +
  '  }' +
  '}';

const blocksQueryTemplate =
  '{' +
  '  docSet(id:"%docSetId%") {' +
  '    document(bookCode: "%bookCode%") {' +
  '      title: header(id: "toc2")' +
  '      mainSequence {' +
  '        blocks(withScriptureCV:"%chapter%:%verse%") { text }' +
  '      }' +
  '    }' +
  '  }' +
  '}';

const Browse = (props) => {
  const [result, setResult] = React.useState({});
  const [renderMode, setRenderMode] = React.useState('verse');
  React.useEffect(() => {
    const doQuery = async () => {
      if (props.state.selectedDocument) {
        let browseQuery;
        switch (renderMode) {
          case 'verse':
            browseQuery = verseQueryTemplate
              .replace(/%docSetId%/g, props.state.selectedDocSet.get)
              .replace(/%bookCode%/g, props.state.selectedBook.get)
              .replace(/%chapter%/g, props.state.selectedChapter.get)
              .replace(/%verse%/g, props.state.selectedVerse.get);
            break;
          case 'chapter':
            browseQuery = chapterQueryTemplate
              .replace(/%docSetId%/g, props.state.selectedDocSet.get)
              .replace(/%bookCode%/g, props.state.selectedBook.get)
              .replace(/%chapter%/g, props.state.selectedChapter.get);
            break;
          case 'blocks':
            browseQuery = blocksQueryTemplate
              .replace(/%docSetId%/g, props.state.selectedDocSet.get)
              .replace(/%bookCode%/g, props.state.selectedBook.get)
              .replace(/%chapter%/g, props.state.selectedChapter.get)
              .replace(/%verse%/g, props.state.selectedVerse.get);
            break;
          default:
            throw new Error(`Unknown renderMode '${renderMode}'`);
        }
        const res = await props.pk.gqlQuery(browseQuery);
        setResult(res);
      }
    };
    doQuery();
  }, [props.state.selectedDocSet.get, props.state.selectedBook.get, renderMode]);
  if (result.data && result.data.docSet) {
    let scriptureTitle;
    let scriptureText;
    switch (renderMode) {
      case 'verse':
        scriptureTitle = (
          <h3>
            {result.data.docSet.document.title}
            {` ${props.state.selectedChapter.get}:${props.state.selectedVerse.get}`}
          </h3>
        );
        scriptureText =
          'cv' in result.data.docSet.document ? (
            <p>{result.data.docSet.document.cv[0].text}</p>
          ) : (
            ''
          );
        break;
      case 'chapter':
        scriptureTitle = (
          <h3>
            {result.data.docSet.document.title} {props.state.selectedChapter.get}
          </h3>
        );
        scriptureText =
          'cv' in result.data.docSet.document ? (
            <p>{result.data.docSet.document.cv[0].text}</p>
          ) : (
            ''
          );
        break;
      case 'blocks':
        scriptureTitle = (
          <h3>
            {`Block(s) containing ${result.data.docSet.document.title}`}
            {` ${props.state.selectedChapter.get}:${props.state.selectedVerse.get}`}
          </h3>
        );
        scriptureText =
          'mainSequence' in result.data.docSet.document
            ? [
                ...result.data.docSet.document.mainSequence.blocks.entries(),
              ].map((b) => <p key={b[0]}>{b[1].text}</p>)
            : '';
        break;
    }
    return (
      <div className="content scrollableTabPanel">
        <div>
          <BrowseModeSwitcher
            renderMode={renderMode}
            setRenderMode={setRenderMode}
          />
        </div>
        {scriptureTitle}
        {scriptureText}
      </div>
    );
  }
  return <div>No document selected</div>;
};

export default Browse;
