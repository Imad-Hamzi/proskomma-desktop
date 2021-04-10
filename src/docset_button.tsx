import React from 'react';

const DocSetButton = (props) => {
  return (
    <button
      onClick={() => {
        props.state.selectedDocSet.set(props.docSet.id);
        props.state.selectedDocument.set('');
      }}
    >
      {props.state.selectedDocSet.get === props.docSet.id ? <b>{props.docSet.id} </b> : props.docSet.id}
    </button>
  );
};

export default DocSetButton;
