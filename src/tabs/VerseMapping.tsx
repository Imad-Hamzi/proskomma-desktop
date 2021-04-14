import React from 'react';

import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import styles from '../styles';
import BrowseChapterNavigation from "../components/BrowseChapterNavigation";
import BrowseVerseNavigation from "../components/BrowseVerseNavigation";
import DocumentPicker from "../components/DocumentPicker";
import InspectQuery from "../components/InspectQuery";

const VerseMapping = withStyles(styles)((props) => {
  const {classes} = props;
  const [query, setQuery] = React.useState('');
  const [result, setResult] = React.useState({});
  const verseMappingQueryTemplate =
    `{
  unmapped: docSet(id: "dbl/en_drh") {
    document(bookCode:"%bookCode%") {
      drh: cv(
        chapter:"%chapter%"
        verses:"%verse%"
        ) {
        text
      }
    }
  }
  mapped: docSet(id:"ebible/en_web") {
    document(bookCode:"%bookCode%") {
      web: cv(
        chapter:"%chapter%"
        verses:"%verse%"
        ) {
        text
      }
      drh: mappedCv(
        mappedDocSetId:"dbl/en_drh"
        chapter:"%chapter%"
        verses:"%verse%"
        ) {
        text
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
}`;
  React.useEffect(() => {
    const doQuery = async () => {
      const verseMappingQuery =
        verseMappingQueryTemplate
          .replace(/%bookCode%/g, props.state.selectedBook.get || '')
          .replace(/%chapter%/g, props.state.selectedChapter.get)
          .replace(/%verse%/g, props.state.selectedVerse.get);
      const res = await props.pk.gqlQuery(verseMappingQuery);
      setQuery(verseMappingQuery); // For InspectQuery
      setResult(res);
      if (res.data) {
        props.state.selectedDocSet.set('ebible/en_web');
        if (!props.state.selectedDocument.get) {
          props.state.selectedDocument.set(res.data.mapped.documents[0].id);
          props.state.selectedBook.set(res.data.mapped.documents[0].bookCode);
        }
      }
    };
    doQuery();
  }, [props.state.selectedBook.get, props.state.selectedChapter.get, props.state.selectedVerse.get, props.state.mutationCount.get]);
  return (
    result.data && result.data.mapped && result.data.mapped.document ?
      <div className={classes.tabContent}>
        <DocumentPicker docSet={result.data.mapped} state={props.state}/>
        <InspectQuery
          state={props.state}
          query={query}
        />
        <div>
          <BrowseChapterNavigation
            state={props.state}
            direction="previous"
            destination={result.data.mapped.document.nav.previousChapter}
          />
          <Typography variant="body1" display="inline">
            ch {props.state.selectedChapter.get}
          </Typography>
          <BrowseChapterNavigation
            state={props.state}
            direction="next"
            destination={result.data.mapped.document.nav.nextChapter}
          />
          <BrowseVerseNavigation
            state={props.state}
            direction="previous"
            destination={result.data.mapped.document.nav.previousVerse}
          />
          <Typography variant="body1" display="inline">
            v {props.state.selectedVerse.get}
          </Typography>
          <BrowseVerseNavigation
            state={props.state}
            direction="next"
            destination={result.data.mapped.document.nav.nextVerse}
          />
        </div>
        <Grid container spacing={4} className={classes.grid}>
          <Grid item xs="4" className={classes.gridItem}>
            <Typography variant="h6">World English Bible</Typography>
          </Grid>
          <Grid item xs="4" className={classes.gridItem}>
            <Typography variant="h6">Douay Rheims, with Mapping</Typography>
          </Grid>
          <Grid item xs="4" className={classes.gridItem}>
            <Typography variant="h6">Douay Rheims, without Mapping</Typography>
          </Grid>
          <Grid item xs="4" className={classes.gridItem}>
            <Typography variant="body1">{
              result.data.mapped.document.web.length > 0 ?
                result.data.mapped.document.web[0].text :
                'No text found'
            }</Typography>
          </Grid>
          <Grid item xs="4" className={classes.gridItem}>
            <Typography variant="body1">{
              result.data.mapped.document.drh.length > 0 ?
                result.data.mapped.document.drh[0].text :
                'No text found'
            }</Typography>
          </Grid>
          <Grid item xs="4" className={classes.gridItem}>
            <Typography variant="body1">{
              result.data.unmapped.document.drh.length > 0 ?
                result.data.unmapped.document.drh[0].text :
                'No text found'
            }</Typography>
          </Grid>
        </Grid>
      </div> : ''
  );
});

export default VerseMapping;
