import React from 'react';

import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import styles from '../styles';

const simpleSearchQueryTemplate =
  '{' +
  '  docSet(id:"%docSetId%") {' +
  '    documents {' +
  '       id' +
  '       bookCode: header(id: "bookCode")' +
  '       title: header(id: "toc2")' +
  '       mainSequence {' +
  '         blocks(' +
  '           withMatchingChars: [%searchTerms%]' +
  '           allChars:%allChars%' +
  '         ) {' +
  '           scopeLabels tokens { payload }' +
  '         }' +
  '       }' +
  '    }' +
  '    matches: enumRegexIndexesForString (enumType:"wordLike" searchRegex:"%searchTermsRegex%") { matched }' +
  '  }' +
  '}';

const Search = withStyles(styles)((props) => {
  const {classes} = props;
  const [result, setResult] = React.useState({});
  const [query, setQuery] = React.useState('');
  const [searchTerms, setSearchTerms] = React.useState('');
  const [searchString, setSearchString] = React.useState('');
  const [allChars, setAllChars] = React.useState(false);
  const [from, setFrom] = React.useState(0);

  // Build new query when searchTerms change
  React.useEffect(() => {
    if (props.state.selectedDocSet) {
      const searchTermsArray = searchTerms.split(/ +/).map((st) => st.trim());
      setQuery(
        simpleSearchQueryTemplate
          .replace(/%docSetId%/g, props.state.selectedDocSet.get)
          .replace(
            /%searchTerms%/g,
            searchTermsArray.map((st) => `"${st}"`).join(', ')
          )
          .replace(
            /%searchTermsRegex%/g,
            searchTermsArray.map((st) => `(${st})`).join('|')
          )
          .replace(
            /%allChars%/g,
            allChars ? "true" : "false"
          )
      );
    }
  }, [searchTerms, allChars]);

  // Run query when query or docSet changes
  React.useEffect(() => {
    const doQuery = async () => {
      setFrom(0);
      const res = await props.pk.gqlQuery(query);
      setResult(res);
    };
    if (searchTerms.trim().length > 0) {
      doQuery();
    }
  }, [props.state.selectedDocSet.get, query]);

  const handleButtonClick = () => {
    setSearchTerms(searchString);
  };

  const handleInput = (ev) => {
    setSearchString(ev.target.value);
  };

  const matchRecords = [];
  let count = 0;
  if (result && result.data && result.data.docSet) {
    const matchableTerms = result.data.docSet.matches.map((m) => m.matched);
    for (const matchingDocument of result.data.docSet.documents.filter(
      (d) => d.mainSequence.blocks.length > 0
    )) {
      for (const matchingBlock of matchingDocument.mainSequence.blocks) {
        if (count < from) {
          count++;
          continue;
        }
        if (count > (from + 20)) {
          count++;
          continue;
        }
        matchRecords.push([
          matchingDocument.id,
          matchingDocument.bookCode,
          matchingDocument.title,
          matchingBlock.scopeLabels
            .filter((sl) => sl.startsWith('chapter'))
            .map((sl) => sl.split('/')[1]),
          matchingBlock.scopeLabels
            .filter((sl) => sl.startsWith('verse/'))
            .map((sl) => sl.split('/')[1])
            .map((v) => parseInt(v)),
          [...matchingBlock.tokens.map((t) => t.payload).entries()].map((t) => (
            <Typography
              key={t[0]}
              variant="inherit"
              display="inline"
              className={
                matchableTerms.includes(t[1]) ? classes.boldPara : classes.para
              }
            >
              {t[1]}
            </Typography>
          )),
        ]);
        count++;
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
        <FormControlLabel
          control={
            <Switch
              checked={allChars}
              label="All Terms"
              onChange={(ev) => setAllChars(ev.target.checked)}
            />}
          label="Require All Terms"
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
      {matchRecords && matchRecords.length > 0 && (
        <>
          <IconButton
            disabled={from === 0}
            onClick={() => {
              setFrom(Math.max(from - 20, 0))
           }}
          >
            <ArrowBackIcon/>
          </IconButton>
          <Typography variant="h5" display="inline">{`Showing ${from} to ${Math.min(from + 19, count)} of ${count}`}</Typography>
          <IconButton
            disabled={(from + 20) > count}
            onClick={() => {
              setFrom(Math.min(from + 20, count))
            }}
          >
            <ArrowForwardIcon/>
          </IconButton>
          <List>
          {[...matchRecords.entries()].map((mr) => (
            <ListItem
              key={mr[0]}
              button
              dense
              onClick={() => {
                props.state.selectedDocument.set(mr[1][0]);
                props.state.selectedBook.set(mr[1][1]);
                props.state.selectedChapter.set(mr[1][3][0]);
                props.state.selectedVerse.set(`${Math.min(...mr[1][4])}`);
                props.state.tabN.set(1);
                props.state.renderMode.set('blocks');
              }}
            >
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    className={classes.boldItalicPara}
                  >
                    {`${mr[1][2]} ${mr[1][3].join(', ')}:${Math.min(
                      ...mr[1][4]
                    )}${
                      mr[1][4].length > 1 ? `-${Math.max(...mr[1][4])}` : ''
                    }`}
                  </Typography>
                }
                secondary={<Typography variant="body2">{mr[1][5]}</Typography>}
              />
            </ListItem>
          ))}
        </List>
        </>
      )}
      {matchRecords && matchRecords.length === 0 && (
        <Typography variant="body2">
          No matches - type search terms above, then click 'Search'
        </Typography>
      )}
      {!props.state.selectedDocSet.get && (
        <Typography variant="body2">Please select a docSet</Typography>
      )}
    </div>
  );
});

export default Search;
