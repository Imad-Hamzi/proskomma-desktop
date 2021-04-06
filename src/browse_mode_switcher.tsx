import React from 'react';

const BrowseModeSwitcher = (props) => {
  return (
    <>
      <button
        onClick={() => {
          switch (props.renderMode) {
            case 'verse':
              props.setRenderMode('chapter');
              break;
            case 'chapter':
              props.setRenderMode('blocks');
              break;
            case 'blocks':
              props.setRenderMode('verse');
              break;
          }
        }}
      >
        {props.renderMode} mode
      </button>
    </>
  );
};

export default BrowseModeSwitcher;
