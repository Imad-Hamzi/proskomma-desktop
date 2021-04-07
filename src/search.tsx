import React from 'react';

const simpleSearchQueryTemplate =
  '{' +
  '  docSet(id:"%docSetId%") {' +
  '    documents {' +
  '       bookCode: header(id: "bookCode")' +
  '       title: header(id: "toc2")' +
  '       mainSequence {' +
  '         blocks(withChars: ["Judas"]) {' +
  '           scopeLabels tokens { payload } text' +
  '         }' +
  '       }' +
  '    }' +
  '  }' +
  '}';

const Search = (props) => {
  const [result, setResult] = React.useState({});
  React.useEffect(() => {
    const doQuery = async () => {
      if (props.state.selectedDocSet) {
        const browseQuery = simpleSearchQueryTemplate.replace(
          /%docSetId%/g,
          props.state.selectedDocSet.get
        );
        const res = await props.pk.gqlQuery(browseQuery);
        setResult(res);
        // console.log(browseQuery, JSON.stringify(res));
      }
    };
    doQuery();
  }, [props.state.selectedDocSet]);
  if (result.data && result.data.docSet && result.data.docSet.documents) {
    return (
      <div className="content scrollableTabPanel">
        {result.data.docSet.documents
          .filter((d) => d.mainSequence.blocks.length > 0)
          .map((d) => (
            <div key={d.id}>
              <h4>{`${d.title} (${d.mainSequence.blocks.length})`}</h4>
              <ul>
                {d.mainSequence.blocks.map((b) => (
                  <li>
                    <div>
                      {b.scopeLabels
                        .filter((sl) =>
                          ['chapter', 'verse'].includes(sl.split('/')[0])
                        )
                        .join(', ')}
                    </div>
                    <div>
                      {b.tokens.map((t) =>
                        t.payload === 'Judas' ? <b>{t.payload}</b> : t.payload
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        <div>{JSON.stringify(result, null, 2)}</div>
      </div>
    );
  }
  return '';
};

export default Search;
