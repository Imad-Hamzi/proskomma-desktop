import React from 'react';

const DocSetButton = (props) => {
  return (
    <span
      onClick={() => {
        props.state.selectedDocSet.set(props.docSet.id);
        props.state.selectedDocument.set('');
      }}
    >
      {props.docSet.id}
    </span>
  );
};

export default DocSetButton;
