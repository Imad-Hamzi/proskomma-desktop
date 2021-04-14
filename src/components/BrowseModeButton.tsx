import React from 'react';

import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

import styles from '../styles';

const BrowseModeButton = withStyles(styles)((props) => {
  const { classes } = props;
  return (
    <Button
      className={classes.browseModeButton}
      variant="outlined"
      size="small"
      onClick={() => {
        props.setRenderMode(props.newMode);
      }}
    >
      {props.label}
    </Button>
  );
});

export default BrowseModeButton;
