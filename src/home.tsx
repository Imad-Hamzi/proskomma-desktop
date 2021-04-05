import React from 'react';
import DocumentLink from './document_link';

const Home = (props) => {
  const [result, setResult] = React.useState({});
  const homeQuery =
    '{' +
    '  processor packageVersion nDocSets nDocuments' +
    '  docSets {' +
    '    id selectors { key value }' +
    '    documents {' +
    '      id' +
    '      bookCode: header(id: "bookCode" )' +
    '      title: header(id: "toc2")' +
    '    }' +
    '  }' +
    '}';
  React.useEffect(() => {
    const doQuery = async () => {
      const res = await props.pk.gqlQuery(homeQuery);
      setResult(res);
      // console.log(res);
    };
    doQuery();
  }, []);
  const selectorByName = (selectors, selectorName) =>
    selectors.filter((s) => s.key === selectorName)[0].value;
  return (
    <div className="content">
      <div>
        <i>
          Click in Window, then F12, to Toggle Dev Tools (Scary Output to the
          Right)!
        </i>
      </div>
      <h3>Status</h3>
      <div>
        Using &apos;{result.data ? result.data.processor : ''}&apos;
        {' Version '}
        {result.data ? result.data.packageVersion : ''}.
      </div>
      <div>
        {result.data ? result.data.nDocSets : ''}
        {' docSet(s)'}
        {' containing '}
        {result.data ? result.data.nDocuments : ''}
        {' document(s) loaded from Proskomma JSON in '}
        {props.timeToLoad}
        {' msec'}
        {!result.data
          ? ''
          : result.data.docSets.map((ds) => (
              <div key={ds.id}>
                <h4>{`DocSet ${selectorByName(
                  ds.selectors,
                  'abbr'
                )} (language ${selectorByName(ds.selectors, 'lang')})`}</h4>
                {ds.documents.map((d) => (
                  <DocumentLink
                    key={d.id}
                    docSet={ds}
                    doc={d}
                    setTabIndex={props.setTabIndex}
                  />
                ))}
              </div>
            ))}
      </div>
    </div>
  );
};

export default Home;
