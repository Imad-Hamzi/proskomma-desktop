import React from 'react';

import {withStyles} from '@material-ui/core/styles';
import styles from './styles';

const simpleSearchQueryTemplate =
  '{' +
  '  docSet(id:"%docSetId%") {' +
  '    documents {' +
  '       bookCode: header(id: "bookCode")' +
  '       title: header(id: "toc2")' +
  '       mainSequence {' +
  '         blocks(withMatchingChars: [%searchTerm%]) {' +
  '           scopeLabels tokens { payload }' +
  '         }' +
  '       }' +
  '    }' +
  '    matches: enumRegexIndexesForString (enumType:"wordLike" searchRegex:%searchTerm%) { matched }' +
  '  }' +
  '}';

const Search = withStyles(styles)((props) => {
  const [result, setResult] = React.useState({});
  const [query, setQuery] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('mothers');

  // Build new query when searchTerms change
  React.useEffect(() => {
    if (props.state.selectedDocSet) {
      setQuery(
        simpleSearchQueryTemplate
          .replace(/%docSetId%/g, props.state.selectedDocSet.get)
          .replace(
            /%searchTerm%/g,
            `"${searchTerm}"`
          )
      );
    }
  }, [searchTerm]);

  // Run query when query or docSet changes
  React.useEffect(() => {
    const doQuery = async () => {
      const res = await props.pk.gqlQuery(query);
      setResult(res);
    };
    doQuery();
  }, [props.state.selectedDocSet.get, query]);

  const handleChange = (ev) => {
    if (ev) {
      setSearchTerm(ev.target.value);
    }
  };

  let matchRecords = [];
  if (result && result.data && result.data.docSet) {
    const matchableTerms = result.data.docSet.matches.map(m => m.matched);
    for (
      const matchingDocument of
      result.data.docSet.documents.filter(d => d.mainSequence.blocks.length > 0)
      ) {
      for (const matchingBlock of matchingDocument.mainSequence.blocks) {
        matchRecords.push([
          matchingDocument.title,
          matchingBlock.scopeLabels
            .filter(sl => sl.startsWith('chapter'))
            .map(sl => sl.split('/')[1]),
          matchingBlock.scopeLabels
            .filter(sl => sl.startsWith('verse/'))
            .map(sl => sl.split('/')[1])
            .map(v => parseInt(v)),
          matchingBlock.tokens
            .map(t => t.payload)
            .map(t => matchableTerms.includes(t) ? <b>{t}</b> : t)
        ]);
      }
    }
  }

  return (
    <div className="content scrollableTabPanel">
      <textarea
        className="searchBox"
        cols="50"
        rows="3"
        value={searchTerm}
        onChange={handleChange}
      />
      {
        matchRecords &&
        <div>
          {
            [...matchRecords.entries()]
              .map(
              mr =>
                <div key={mr[0]}>
                  <div>
                    <b><i>{`${mr[1][0]} ${mr[1][1].join(', ')}:${Math.min(...mr[1][2])}${mr[1][2].length > 1 ? `-${Math.max(...mr[1][2])}` : ''}`}</i></b>
                  </div>
                  <div>{mr[1][3]}</div>
                </div>
            )
          }
        </div>
      }
    </div>
  )
});

export default Search;
