import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import styles from '../styles';

const BrowseVerseNavigation = withStyles(styles) (
  (props) => {
  return (
    <IconButton
      aria-label={props.direction}
      disabled={!props.destination}
      onClick={() => {
        props.state.selectedChapter.set(props.destination.chapter);
        props.state.selectedVerse.set(props.destination.verse);
      }}
    >
      {props.direction === 'previous' ? <ArrowBackIcon/> : <ArrowForwardIcon/>}
    </IconButton>
  );
});

export default BrowseVerseNavigation;
