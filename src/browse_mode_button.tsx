import React from 'react';

const BrowseModeButton = (props) => {
  return (
    <button onClick={() => {
      props.setRenderMode(props.newMode)
    }}>
      {props.label}
    </button>
  );
};

export default BrowseModeButton;
