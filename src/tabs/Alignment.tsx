import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import styles from '../styles';
import BrowseChapterNavigation from '../components/BrowseChapterNavigation';
import BrowseVerseNavigation from '../components/BrowseVerseNavigation';
import DocumentPicker from '../components/DocumentPicker';
import InspectQuery from '../components/InspectQuery';
import AlignedToken from '../components/AlignedToken';

const Alignment = withStyles(styles)((props) => {
  const { classes } = props;
  const [query, setQuery] = React.useState('');
  const [result, setResult] = React.useState({});
  const [lemma, setLemma] = React.useState('');

  const renderTokens = tokens => tokens.map(
    t => <AlignedToken token={t} lemma={lemma} setLemma={setLemma}/>
  );

  const alignmentQueryTemplate = `{
  ust: docSet(id: "unfoldingWord/en_ust") {
    document(bookCode:"%bookCode%") {
      cv(
        chapter:"%chapter%"
        verses:"%verse%"
        includeContext: true
        ) {
        tokens {payload scopes}
      }
      nav: cvNavigation(
        chapter: "%chapter%"
        verse: "%verse%"
        ) {
        previousChapter
        previousVerse { chapter verse }
        nextVerse { chapter verse }
        nextChapter
      }
    }
    documents {
      id
      bookCode: header(id: "bookCode")
      title: header(id: "toc2")
    }
  }
  ult: docSet(id:"unfoldingWord/en_ult") {
    document(bookCode:"%bookCode%") {
      cv(
        chapter:"%chapter%"
        verses:"%verse%"
        includeContext: true
        ) {
        tokens {payload scopes}
      }
    }
  }
  uhb: docSet(id:"unfoldingWord/hbo_uhb") {
    document(bookCode:"%bookCode%") {
      cv(
        chapter:"%chapter%"
        verses:"%verse%"
        includeContext: true
        ) {
        tokens {payload scopes}
      }
    }
  }
}`;
  React.useEffect(() => {
    const doQuery = async () => {
      const alignmentQuery = alignmentQueryTemplate
        .replace(/%bookCode%/g, props.state.selectedBook.get || '')
        .replace(/%chapter%/g, props.state.selectedChapter.get)
        .replace(/%verse%/g, props.state.selectedVerse.get);
      const res = await props.pk.gqlQuery(alignmentQuery);
      setQuery(alignmentQuery); // For InspectQuery
      setResult(res);
      console.log(res);
      if (res.data) {
        props.state.selectedDocSet.set('unfoldingWord/en_ust');
        if (!props.state.selectedDocument.get) {
          props.state.selectedDocument.set(res.data.ust.documents[0].id);
          props.state.selectedBook.set(res.data.ust.documents[0].bookCode);
        }
      }
    };
    doQuery();
  }, [
    props.state.selectedBook.get,
    props.state.selectedChapter.get,
    props.state.selectedVerse.get,
    props.state.mutationCount.get,
  ]);
  return result.data && result.data.ust && result.data.ust.document ? (
    <div className={classes.tabContent}>
      <DocumentPicker docSet={result.data.ust} state={props.state} />
      <InspectQuery state={props.state} query={query} />
      <div>
        <BrowseChapterNavigation
          state={props.state}
          direction="previous"
          destination={result.data.ust.document.nav.previousChapter}
        />
        <Typography variant="body1" display="inline">
          ch {props.state.selectedChapter.get}
        </Typography>
        <BrowseChapterNavigation
          state={props.state}
          direction="next"
          destination={result.data.ust.document.nav.nextChapter}
        />
        <BrowseVerseNavigation
          state={props.state}
          direction="previous"
          destination={result.data.ust.document.nav.previousVerse}
        />
        <Typography variant="body1" display="inline">
          v {props.state.selectedVerse.get}
        </Typography>
        <BrowseVerseNavigation
          state={props.state}
          direction="next"
          destination={result.data.ust.document.nav.nextVerse}
        />
      </div>
      <Grid container spacing={4} className={classes.grid}>
        <Grid item xs="4" className={classes.gridItem}>
          <Typography variant="h6">ULT</Typography>
        </Grid>
        <Grid item xs="4" className={classes.gridItem}>
          <Typography variant="h6">UHB</Typography>
        </Grid>
        <Grid item xs="4" className={classes.gridItem}>
          <Typography variant="h6">UST</Typography>
        </Grid>
      <Grid item xs="4" className={classes.gridItem}>
        <Typography variant="body1">
          {result.data.ult.document.cv.length > 0
            ? renderTokens(result.data.ult.document.cv[0].tokens)
            : 'No text found'}
        </Typography>
      </Grid>
      <Grid item xs="4" className={classes.gridItem}>
        <Typography variant="body1">
          {result.data.uhb.document.cv.length > 0
            ? renderTokens(result.data.uhb.document.cv[0].tokens)
            : 'No text found'}
        </Typography>
      </Grid>
        <Grid item xs="4" className={classes.gridItem}>
          <Typography variant="body1">
            {result.data.ust.document.cv.length > 0
              ? renderTokens(result.data.ust.document.cv[0].tokens)
              : 'No text found'}
          </Typography>
        </Grid>
      </Grid>
    </div>
  ) : (
    `${JSON.stringify(result.data)}`
  );
});

export default Alignment;
