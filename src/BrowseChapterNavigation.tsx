import React from 'react';

const BrowseChapterNavigation = (props) => {
  return (
    <button
      disabled={!props.destination}
      onClick={() => {
        props.state.selectedChapter.set(`${props.destination}`);
        props.state.selectedVerse.set('1');
      }}
    >
      {props.direction === 'previous' ? '<= ' : ' =>'}
    </button>
  );
};

export default BrowseChapterNavigation;
