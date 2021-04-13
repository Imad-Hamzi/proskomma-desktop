import React from 'react';

import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import styles from './styles';
import BrowseChapterNavigation from "./BrowseChapterNavigation";
import BrowseVerseNavigation from "./BrowseVerseNavigation";
import DocumentPicker from "./DocumentPicker";

const VerseMapping = withStyles(styles)((props) => {
  const {classes} = props;
  const [result, setResult] = React.useState({});
  const browseQueryTemplate =
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
      const browseQuery = browseQueryTemplate
        .replace(/%bookCode%/g, props.state.selectedBook.get || '')
        .replace(/%chapter%/g, props.state.selectedChapter.get)
        .replace(/%verse%/g, props.state.selectedVerse.get);
      const res = await props.pk.gqlQuery(browseQuery);
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
      <DocumentPicker docSet={result.data.mapped} state={props.state} />
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
      <pre>
      {JSON.stringify(result.data, null, 2)}
    </pre>
    </div> : ''
  );
});

export default VerseMapping;
