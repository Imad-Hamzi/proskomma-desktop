import React from 'react';

const DocSetButton = (props) => {
  return (
    <button
      onClick={() => {
        props.state.selectedDocSet.set(props.docSet.id);
        props.state.selectedDocument.set('');
      }}
    >
      {props.docSet.id}
    </button>
  );
};

export default DocSetButton;
