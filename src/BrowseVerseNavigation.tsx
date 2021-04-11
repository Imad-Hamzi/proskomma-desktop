import React from 'react';

const BrowseVerseNavigation = (props) => {
  return (
    <button
      disabled={!props.destination}
      onClick={() => {
        props.state.selectedChapter.set(props.destination.chapter);
        props.state.selectedVerse.set(props.destination.verse);
      }}
    >
      {props.direction === 'previous' ? '<= ' : ' =>'}
    </button>
  );
};

export default BrowseVerseNavigation;
