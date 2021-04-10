import React from 'react';

import { renderVersesItems } from './render_utils';

const BrowseBlocks = (props) => {
  const [result, setResult] = React.useState({});
  const blocksQueryTemplate =
    '{' +
    '  docSet(id:"%docSetId%") {' +
    '    document(bookCode: "%bookCode%") {' +
    '      title: header(id: "toc2")' +
    '      mainSequence {' +
    '        blocks(withScriptureCV:"%chapter%:%verse%") {' +
    '          items { type subType payload }' +
    '        }' +
    '      }' +
    '    }' +
    '  }' +
    '}';

  React.useEffect(() => {
    const doQuery = async () => {
      if (props.state.selectedDocument) {
        const browseQuery = blocksQueryTemplate
          .replace(/%docSetId%/g, props.state.selectedDocSet.get)
          .replace(/%bookCode%/g, props.state.selectedBook.get)
          .replace(/%chapter%/g, props.state.selectedChapter.get)
          .replace(/%verse%/g, props.state.selectedVerse.get);
        const res = await props.pk.gqlQuery(browseQuery);
        setResult(res);
      }
    };
    doQuery();
  }, [
    props.state.selectedDocSet.get,
    props.state.selectedBook.get,
    props.renderMode,
  ]);
  if (result.data && result.data.docSet) {
    const scriptureTitle = (
      <h3>
        {`Block(s) containing ${result.data.docSet.document.title}`}
        {` ${props.state.selectedChapter.get}:${props.state.selectedVerse.get}`}
      </h3>
    );
    const scriptureText =
      'mainSequence' in result.data.docSet.document
        ? [
            ...result.data.docSet.document.mainSequence.blocks.entries(),
          ].map((b) => <p key={b[0]}>{renderVersesItems(b[1].items, props.state.selectedVerse.set, props.setRenderMode)}</p>)
        : '';
    return (
      <>
        {scriptureTitle}
        {scriptureText}
      </>
    );
  }
  return <div>No docSet selected</div>;
};

export default BrowseBlocks;
