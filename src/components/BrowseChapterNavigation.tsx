import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import styles from '../styles';

const BrowseChapterNavigation = withStyles(styles) (
  (props) => {
  return (
    <IconButton
      disabled={!props.destination}
      onClick={() => {
        props.state.selectedChapter.set(`${props.destination}`);
        props.state.selectedVerse.set('1');
      }}
    >
      {props.direction === 'previous' ? <ArrowBackIcon/> : <ArrowForwardIcon/>}
    </IconButton>
  );
});

export default BrowseChapterNavigation;
