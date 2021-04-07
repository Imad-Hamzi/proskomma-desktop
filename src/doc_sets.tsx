import React from 'react';
import DocSetButton from './docset_button';
import DocumentLink from './document_link';

const DocSets = (props) => {
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
  const ds = !result.data
    ? ''
    : result.data.docSets.filter(
        (ds) => ds.id === props.state.selectedDocSet.get
      )[0];
  return (
    <div className="content scrollableTabPanel">
      <div>
        <i>
          Click in Window, then F12, to Toggle Dev Tools (Scary Output to the
          Right)!
        </i>
      </div>
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
      </div>
      <hr />
      <div>
        {!result.data ? (
          ''
        ) : (
          <>
            <h3>DocSets</h3>
            <div>
              {result.data.docSets.map((ds) => (
                <DocSetButton key={ds.id} state={props.state} docSet={ds} />
              ))}
            </div>
          </>
        )}
      </div>
      {props.state.selectedDocSet.get === '' || !ds ? (
        ''
      ) : (
        <div>
          <>
            <h3>
              {`${selectorByName(
                ds.selectors,
                'abbr'
              )} (${selectorByName(ds.selectors, 'lang')})`}
            </h3>
            <div>
              {ds.documents.map((d) => (
                <DocumentLink
                  key={d.id}
                  docSet={ds}
                  doc={d}
                  state={props.state}
                />
              ))}
            </div>
          </>
        </div>
      )}
    </div>
  );
};
export default DocSets;
