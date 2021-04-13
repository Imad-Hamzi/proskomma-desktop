import React from 'react';

import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
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
  const {classes} = props;
  const [result, setResult] = React.useState({});
  const [query, setQuery] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchString, setSearchString] = React.useState('mothers');

  // Build new query when searchTerms change
  React.useEffect(() => {
    if (props.state.selectedDocSet) {
      setQuery(
        simpleSearchQueryTemplate
          .replace(/%docSetId%/g, props.state.selectedDocSet.get)
          .replace(/%searchTerm%/g, `"${searchTerm}"`)
      );
    }
  }, [searchTerm]);

  // Run query when query or docSet changes
  React.useEffect(() => {
    const doQuery = async () => {
      const res = await props.pk.gqlQuery(query);
      setResult(res);
    };
    if (searchTerm.trim().length > 0) {
      doQuery();
    }
  }, [props.state.selectedDocSet.get, query]);

  const handleButtonClick = () => {
    setSearchTerm(searchString);
  };

  const handleInput = (ev) => {
    setSearchString(ev.target.value);
  };

  const matchRecords = [];
  if (result && result.data && result.data.docSet) {
    const matchableTerms = result.data.docSet.matches.map((m) => m.matched);
    for (const matchingDocument of result.data.docSet.documents.filter(
      (d) => d.mainSequence.blocks.length > 0
    )) {
      for (const matchingBlock of matchingDocument.mainSequence.blocks) {
        matchRecords.push([
          matchingDocument.title,
          matchingBlock.scopeLabels
            .filter((sl) => sl.startsWith('chapter'))
            .map((sl) => sl.split('/')[1]),
          matchingBlock.scopeLabels
            .filter((sl) => sl.startsWith('verse/'))
            .map((sl) => sl.split('/')[1])
            .map((v) => parseInt(v)),
          matchingBlock.tokens
            .map((t) => t.payload)
            .map((t) => (matchableTerms.includes(t) ?
              <Typography variant="inherit" display="inline" className={classes.boldPara}>{t}</Typography> : t)),
        ]);
      }
    }
  }

  return (
    <div className={classes.tabContent}>
      <div>
        <TextField
          className={classes.searchTerms}
          label="Search Terms"
          value={searchString}
          onChange={handleInput}
        />
        <Button
          className={classes.searchButton}
          variant="outlined"
          size="small"
          onClick={handleButtonClick}
        >
          Search
        </Button>
      </div>
      {matchRecords && (
        <List>
          {[...matchRecords.entries()].map((mr) => (
            <ListItem key={mr[0]} button dense>
              <ListItemText
                primary={<Typography variant="body1" className={classes.boldItalicPara}>
                  {`${mr[1][0]} ${mr[1][1].join(', ')}:${Math.min(
                    ...mr[1][2]
                  )}${
                    mr[1][2].length > 1 ? `-${Math.max(...mr[1][2])}` : ''
                  }`}
                </Typography>}
                secondary={<Typography variant="body2">{mr[1][3]}</Typography>}
              />
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
});

export default Search;
