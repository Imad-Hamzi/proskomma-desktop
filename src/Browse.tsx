import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import styles from './styles';
import BrowseVerse from './BrowseVerse';
import BrowseChapter from './BrowseChapter';
import BrowseBlocks from './BrowseBlocks';
import DocumentPicker from './DocumentPicker';

const Browse = withStyles(styles)((props) => {
  const { classes } = props;
  const [result, setResult] = React.useState({});
  const browseQueryTemplate =
    '{' +
    '  docSet(id:"%docSetId%") {' +
    '    selectors { key value }' +
    '    documents {' +
    '      id' +
    '      bookCode: header(id: "bookCode" )' +
    '      title: header(id: "toc2")' +
    '    }' +
    '  }' +
    '}';
  React.useEffect(() => {
    const doQuery = async () => {
      const browseQuery = browseQueryTemplate.replace(
        /%docSetId%/g,
        props.state.selectedDocSet.get || ''
      );
      const res = await props.pk.gqlQuery(browseQuery);
      setResult(res);
    };
    doQuery();
  }, [props.state.selectedDocSet.get, props.state.selectedDocument.get]);
  const selectorByName = (selectors, selectorName) =>
    selectors.filter((s) => s.key === selectorName)[0].value;
  const ds = !result.data || !result.data.docSet ? {} : result.data.docSet;
  let browseView;
  switch (props.state.renderMode.get) {
    case 'verse':
      browseView = (
        <BrowseVerse
          pk={props.pk}
          state={props.state}
        />
      );
      break;
    case 'chapter':
      browseView = (
        <BrowseChapter
          pk={props.pk}
          state={props.state}
        />
      );
      break;
    case 'blocks':
      browseView = (
        <BrowseBlocks
          pk={props.pk}
          state={props.state}
git st        />
      );
      break;
    default:
      throw new Error(`Unknown renderMode '${props.state.renderMode}'`);
  }
  return (
    <div className={classes.root}>
      {!props.state.selectedDocSet.get || !ds || !ds.selectors ? (
        ''
      ) : (
        <div>
          <Typography variant="h5">
          {`${selectorByName(ds.selectors, 'abbr')} (${selectorByName(
            ds.selectors,
            'lang'
          )})`}
          </Typography>
          <DocumentPicker docSet={ds} state={props.state} />
        </div>
      )}
      {browseView}
    </div>
  );
});

export default Browse;
