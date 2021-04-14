import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import styles from '../styles';

const InspectQuery = withStyles(styles) (
  (props) => {
  const { classes } = props;
  return (
      <Button
        className={classes.inspectQuery}
        variant="contained"
        size="small"
        onClick={() => {
          props.state.savedQueries.set([props.query, ...props.state.savedQueries.get]);
          props.state.tabN.set(4);
        }}
      >
        Inspect Query
      </Button>
  );
});

export default InspectQuery;
