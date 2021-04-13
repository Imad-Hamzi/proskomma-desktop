import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import styles from './styles';

const handleChange = (ev, setQuery) => {
  if (ev) {
    setQuery(ev.target.value);
  }
};

const PkQuery = withStyles(styles)((props) => {
  const { classes } = props;
  const [result, setResult] = React.useState({});
  const [query, setQuery] = React.useState(
    props.state.savedQueries.get[0]
  );
  const [queryTime, setQueryTime] = React.useState(-1);

  React.useEffect(() => {
    const doQuery = async () => {
      const now = Date.now();
      setQueryTime(-1);
      const res = await props.pk.gqlQuery(query);
      setResult(res);
      setQueryTime(Date.now() - now);
      // console.log(query, res);
    };
    doQuery();
  }, [query]);
  return (
    <div className={classes.tabContent}>
      {!result ? (
        <Typography variant="body1" className={classes.pre}>
          No Result
        </Typography>
      ) : (
        <>
          <TextareaAutosize
            className={classes.pkQueryTextarea}
            rowsMin="5"
            rowsMax="25"
            display="block"
            onChange={async (event) => handleChange(event, setQuery)}
            value={query}
          />
          <div>
            {queryTime >= 0 ? (
              <Typography variant="body2" display="inline">
                {`Query completed in ${queryTime} msec`}
              </Typography>
            ) : (
              ''
            )}
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                props.state.savedQueries.set(
                  Array.from(new Set([...props.state.savedQueries.get, query]))
                );
              }}
              className={classes.pkQueryButton}
            >
              Save
            </Button>
          </div>
          {props.state.savedQueries.get.length > 0 ? (
            <>
              <Typography variant="body2" className={classes.pkQueryPreviousQueriesTitle}>
                Saved Queries
              </Typography>
              <List>
                {[...props.state.savedQueries.get.entries()].map((sq) => (
                  <ListItem
                    button
                    dense
                    key={sq[0]}
                    onClick={() => {
                      setQuery(sq[1]);
                    }}
                    className={classes.pkQueryPreviousQueries}
                  >
                    <Typography variant="body2" display="inline">
                      {sq[1]}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </>
          ) : (
            ''
          )}
          <Typography variant="body2" className={classes.pre}>
            {JSON.stringify(result, null, 4)}
          </Typography>
        </>
      )}
    </div>
  );
});

export default PkQuery;
