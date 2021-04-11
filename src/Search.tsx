import React from 'react';

const simpleSearchQueryTemplate =
  '{' +
  '  docSet(id:"%docSetId%") {' +
  '    documents {' +
  '       bookCode: header(id: "bookCode")' +
  '       title: header(id: "toc2")' +
  '       mainSequence {' +
  '         blocks(withMatchingChars: ["%searchTerms%"]) {' +
  '           scopeLabels tokens { payload }' +
  '         }' +
  '       }' +
  '    }' +
  '    matches: enumRegexIndexesForString (enumType:"wordLike" searchRegex:"%searchTerms%") { matched }' +
  '  }' +
  '}';

const handleChange = (ev, setSearchTerms) => {
  if (ev) {
    setSearchTerms(ev.target.value);
  }
};

const Search = (props) => {
  const [result, setResult] = React.useState({});
  const [query, setQuery] = React.useState(simpleSearchQueryTemplate);
  const [searchTerms, setSearchTerms] = React.useState("mother")

  React.useEffect(() => {
    const doQuery = async () => {
      if (props.state.selectedDocSet) {
        const searchQuery = query.replace(
          /%docSetId%/g,
          props.state.selectedDocSet.get
        ).replace(/%searchTerms%/g, searchTerms);
        const res = await props.pk.gqlQuery(searchQuery);
        setResult(res);

        // console.log(searchQuery, JSON.stringify(res));
        console.log('Here is the searchQuery: ')
        console.log(JSON.stringify(searchQuery))
      }
    };
    doQuery();
  }, [props.state.selectedDocSet, searchTerms]);

  if (result.data && result.data.docSet && result.data.docSet.documents) {
    const matches = result.data.docSet.matches.map(m => m.matched);

    return (
      <>
        <textarea
          className="searchBox"
          cols="50"
          rows="3"
          value={searchTerms}
          onChange={async (event) => handleChange(event, setSearchTerms)}
        >
        </textarea>
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
                          .filter((sl) => ['chapter', 'verse'].includes(sl.split('/')[0])
                          )
                          .join(', ')}
                      </div>
                      <div>
                        {b.tokens.map(t => matches.includes(t.payload) ? <b>{t.payload}</b> : t.payload)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          <div>{'' || JSON.stringify(result, null, 2)}</div>
        </div>
      </>
    );
  }

  return <textarea
            className="searchBox"
            cols="50"
            rows="3"
            value={searchTerms}
            onChange={async (event) => handleChange(event, setSearchTerms)}
          >
          </textarea>
};

export default Search;
