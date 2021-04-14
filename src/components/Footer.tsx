import React from 'react';
import { shell } from "electron";

import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import {withStyles} from '@material-ui/core/styles';

import styles from '../styles';

const Footer = (props) => {
  const { classes } = props;
  return (
    <AppBar position="static" color="secondary" className={classes.footer}>
      <Typography variant="body2">
        {'Chaliki is part of the '}
        <Link
          href="#"
          color="inherit"
          onClick={() => shell.openExternal('http://doc.proskomma.bible')}
        >
          Proskomma
        </Link>
        {' open-source project, curated by '}
        <Link
          href="#"
          color="inherit"
          onClick={() => shell.openExternal('http://mvh.bible')}
        >
          MVH Solutions
        </Link>
        .
      </Typography>
    </AppBar>
  );
};

export default withStyles(styles) (Footer);
