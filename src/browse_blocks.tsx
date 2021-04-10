import React from 'react';

const BrowseBlocks = (props) => {
  const [result, setResult] = React.useState({});
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
          ].map((b) => <p key={b[0]}>{b[1].text}</p>)
        : '';
    return (
      <>
        {scriptureTitle}
        {scriptureText}
      </>
    );
  }
  return <div>No document selected</div>;
};

export default BrowseBlocks;
