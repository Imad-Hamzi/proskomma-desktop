import React from 'react';
import DocSetButton from './docset_button';
import path from "path";
import fse from "fs-extra";

const DocSets = (props) => {
  const [result, setResult] = React.useState({});
  const homeQuery =
    '{' +
    '  processor packageVersion nDocSets nDocuments' +
    '  docSets {' +
    '    id hasMapping' +
    '    documents { id }' +
    '  }' +
    '}';
  React.useEffect(() => {
    const doQuery = async () => {
      return await props.pk.gqlQuery(homeQuery);
    };
    doQuery().then((res) => {setResult(res)});
  }, [props.mutationCount]);
  return (
    <div className="content scrollableTabPanel">
      <p>
        <i>
          Click in Window, then F12, to Toggle Dev Tools (Scary Output to the
          Right)!
        </i>
      </p>
      <p>
        {`Using ${result.data ? result.data.processor : ''} Version ${
          result.data ? result.data.packageVersion : ''
        }.`}
      </p>
      <h2>
        {`${result.data ? result.data.nDocSets : '0'} docSet(s) containing ${
          result.data ? result.data.nDocuments : '0'
        } document(s)`}
      </h2>
      <div>
        {!result.data ? (
          ''
        ) : (
          <div>
            {result.data.docSets.map((ds) => (
              <DocSetButton
                key={ds.id}
                state={props.state}
                docSet={ds}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default DocSets;
