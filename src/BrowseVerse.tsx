import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import styles from './styles';
import BrowseVerseNavigation from './BrowseVerseNavigation';
import BrowseModeButton from './BrowseModeButton';

const BrowseVerse = withStyles(styles)((props) => {
  const { classes } = props;
  const [result, setResult] = React.useState({});
  const verseQueryTemplate =
    '{' +
    '  docSet(id:"%docSetId%") {' +
    '    document(bookCode: "%bookCode%") {' +
    '      title: header(id: "toc2")' +
    '      cv (chapter:"%chapter%" verses:["%verse%"]) { text }' +
    '      nav: cvNavigation(chapter:"%chapter%" verse: "%verse%") {' +
    '        previousVerse { chapter verse }' +
    '        nextVerse { chapter verse }' +
    '      }' +
    '    }' +
    '  }' +
    '}';
  React.useEffect(() => {
    const doQuery = async () => {
      if (props.state.selectedDocument) {
        const browseQuery = verseQueryTemplate
          .replace(/%docSetId%/g, props.state.selectedDocSet.get)
          .replace(/%bookCode%/g, props.state.selectedBook.get)
          .replace(/%chapter%/g, props.state.selectedChapter.get)
          .replace(/%verse%/g, props.state.selectedVerse.get);
        const res = await props.pk.gqlQuery(browseQuery);
        setResult(res);
      }
    };
    doQuery();
  }, [
    props.state.selectedDocSet.get,
    props.state.selectedBook.get,
    props.state.selectedChapter.get,
    props.state.selectedVerse.get,
    props.state.renderMode.get,
  ]);
  if (result.data && result.data.docSet && result.data.docSet.document) {
    const scriptureTitle = `${props.state.selectedChapter.get}:${props.state.selectedVerse.get}`;
    const scriptureText =
      'cv' in result.data.docSet.document ? (
        <Typography variant="body1">
          {result.data.docSet.document.cv[0].text}
        </Typography>
      ) : (
        ''
      );
    return (
      <>
        <div>
          <BrowseVerseNavigation
            state={props.state}
            direction="previous"
            destination={result.data.docSet.document.nav.previousVerse}
          />
          <Typography variant="body1" display="inline" className={classes.browseNavigationText}>
            {scriptureTitle}
          </Typography>
          <BrowseVerseNavigation
            state={props.state}
            direction="next"
            destination={result.data.docSet.document.nav.nextVerse}
          />
          <BrowseModeButton
            newMode="blocks"
            setRenderMode={props.state.renderMode.set}
            label="View Paragraphs"
          />
          <BrowseModeButton
            newMode="chapter"
            setRenderMode={props.state.renderMode.set}
            label="View Whole Chapter"
          />
        </div>
        {scriptureText}
      </>
    );
  }
  return <div>No docSet selected</div>;
});

export default BrowseVerse;
