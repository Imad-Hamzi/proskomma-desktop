import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import styles from '../styles';
import { renderVersesItems } from '../render_utils';
import BrowseChapterNavigation from "./BrowseChapterNavigation";
import InspectQuery from "./InspectQuery";

const BrowseChapter = withStyles(styles) (
  (props) => {
  const { classes } = props;
  const [result, setResult] = React.useState({});
  const [query, setQuery] = React.useState('');
  const chapterQueryTemplate =
    '{\n' +
    '  docSet(id:"%docSetId%") {\n' +
    '    document(bookCode: "%bookCode%") {\n' +
    '      title: header(id: "toc2")\n' +
    '      mainSequence {\n' +
    '         blocks(withScriptureCV: "%chapter%") {\n' +
    '            bs { payload }\n' +
    '            items { type subType payload }\n' +
    '         }\n' +
    '      }\n' +
    '      nav: cvNavigation(chapter:"%chapter%" verse: "1") {\n' +
    '        previousChapter\n' +
    '        nextChapter\n' +
    '      }\n' +
    '    }\n' +
    '  }\n' +
    '}';

  React.useEffect(() => {
    const doQuery = async () => {
      if (props.state.selectedDocument) {
        const browseQuery = chapterQueryTemplate
          .replace(/%docSetId%/g, props.state.selectedDocSet.get)
          .replace(/%bookCode%/g, props.state.selectedBook.get)
          .replace(/%chapter%/g, props.state.selectedChapter.get);
        setQuery(browseQuery);
        const res = await props.pk.gqlQuery(browseQuery);
        console.log(res);
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
  if (result.data && result.data.docSet) {
    const scriptureTitle = `Ch ${props.state.selectedChapter.get}`;
    const scriptureText =
      'docSet' in result.data && 'document' in result.data.docSet && 'mainSequence' in result.data.docSet.document ?
        <>
          {[...result.data.docSet.document.mainSequence.blocks.entries()].map(
          b => <Typography key={b[0]} variant="body1" className={classes[`usfm_${b[1].bs.payload.split('/')[1]}`]}>
            {
              renderVersesItems(
                b[1].items,
                props.state.selectedVerse.set,
                props.state.renderMode.set
              )
            }
        </Typography>
          )}
        </>
       : (
        ''
      );
    return (
      <>
        <div>
          <BrowseChapterNavigation
            state={props.state}
            direction="previous"
            destination={result.data.docSet.document.nav.previousChapter}
          />
          <Typography variant="body1" display="inline" className={classes.browseNavigationText}>
            {scriptureTitle}
          </Typography>
          <BrowseChapterNavigation
            state={props.state}
            direction="next"
            destination={result.data.docSet.document.nav.nextChapter}
          />
          {' (click on verse number to select verse)'}
          <InspectQuery
            state={props.state}
            query={query}
          />
        </div>
        {scriptureText}
      </>
    );
  }
  return <div>No docSet selected</div>;
});

export default BrowseChapter;
