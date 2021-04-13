import React from 'react';

import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import styles from './styles';
import DocSet from './DocSet';

const DocSets = withStyles(styles)((props) => {
  const {classes} = props;
  const [result, setResult] = React.useState({});
  const homeQuery =
    '{' +
    '  processor packageVersion nDocSets nDocuments' +
    '  docSets {' +
    '    id hasMapping' +
    '    documents { id bookCode: header(id:"bookCode")}' +
    '  }' +
    '}';
  React.useEffect(() => {
    const doQuery = async () => {
      return await props.pk.gqlQuery(homeQuery);
    };
    doQuery().then((res) => {
      setResult(res);
    });
  }, [props.mutationCount]);
  return (
    <div className={classes.tabContent}>
      <Typography variant="body2" className={classes.italicPara}>
        Click in Window, then F12, to Toggle Dev Tools.
      </Typography>
      {!result.data ? (
        <Typography variant="h2" className={classes.loading}>
          Loading...
        </Typography>
      ) : (
        <>
          <Typography variant="body1" className={classes.docSetsSection}>
            {`Using ${result.data ? result.data.processor : ''} Version ${
              result.data ? result.data.packageVersion : ''
            }.`}
          </Typography>
          <div className={classes.docSetsSection}>
            <Typography variant="body1">
              {`${
                result.data ? result.data.nDocSets : '0'
              } docSet(s) containing ${
                result.data ? result.data.nDocuments : '0'
              } document(s)${!props.state.selectedDocSet.get ? ' - click to select' : ''}`}
            </Typography>
            <List>
              {result.data.docSets.map((ds, index) => (
                <ListItem key={index} button dense>
                  <DocSet key={ds.id} state={props.state} docSet={ds}/>
                </ListItem>
              ))}
            </List>
          </div>
        </>
      )}
    </div>
  );
});

export default DocSets;
