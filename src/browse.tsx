import React from 'react';

const Browse = (props) => {
  const [result, setResult] = React.useState({});
  const browseQueryTemplate =
    '{' +
    '  document(id:"%documentId%") {' +
    '    id' +
    '    bookCode: header(id: "bookCode" )' +
    '    title: header(id: "toc2")' +
    '    mainSequence { blocks { text } }' +
    '  }' +
    '}';
  React.useEffect(() => {
    const doQuery = async () => {
      if (props.state.selectedDocument) {
        const browseQuery = browseQueryTemplate.replace(/%documentId%/g, props.state.selectedDocument.get);
        const res = await props.pk.gqlQuery(browseQuery);
        setResult(res);
        console.log(browseQuery, res);
      }
    };
    doQuery();
  }, []);
  return (
    <div className="content">{
      !result.data ?
        <div>No document selected</div>
        :
        <>
          <h3>{result.data.document.title} 1</h3>
          <p>{result.data.document.mainSequence.blocks[0].text}</p>
        </>
    }</div>
  );
};

export default Browse;
