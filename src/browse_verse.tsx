import React from 'react';

const BrowseVerse = (props) => {
  const [result, setResult] = React.useState({});
  const verseQueryTemplate =
    '{' +
    '  docSet(id:"%docSetId%") {' +
    '    document(bookCode: "%bookCode%") {' +
    '      title: header(id: "toc2")' +
    '      cv (chapter:"%chapter%" verses:["%verse%"]) { text }' +
    '      cvNavigation(chapter:"%chapter%" verse: "%verse%") {' +
    '        previousChapter' +
    '        previousVerse { chapter verse }' +
    '        nextVerse { chapter verse }' +
    '        nextChapter' +
    '      }' +
    '    }' +
    '  }' +
    '}';
  React.useEffect(() => {
    const doQuery = async () => {
      if (props.state.selectedDocument) {
        const browseQuery = verseQueryTemplate
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
        {result.data.docSet.document.title}
        {` ${props.state.selectedChapter.get}:${props.state.selectedVerse.get}`}
      </h3>
    );
    const scriptureText =
      'cv' in result.data.docSet.document ? (
        <p>{result.data.docSet.document.cv[0].text}</p>
      ) : (
        ''
      );
    return (
      <>
        {scriptureTitle}
        {scriptureText}
      </>
    );
  }
  return <div>No document selected</div>;
};

export default BrowseVerse;
