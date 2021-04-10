import React from 'react';

const BrowseChapter = (props) => {
  const [result, setResult] = React.useState({});
  const chapterQueryTemplate =
    '{' +
    '  docSet(id:"%docSetId%") {' +
    '    document(bookCode: "%bookCode%") {' +
    '      title: header(id: "toc2")' +
    '      cv (chapter:"%chapter%") { text }' +
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
    props.renderMode,
  ]);
  if (result.data && result.data.docSet) {
    const scriptureTitle = (
      <h3>
        {result.data.docSet.document.title} {props.state.selectedChapter.get}
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

export default BrowseChapter;
