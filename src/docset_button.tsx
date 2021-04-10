import React from 'react';

const DocSetButton = (props) => {
  return (
    <>
      <div>
        <button
          onClick={() => {
            props.state.selectedDocSet.set(props.docSet.id);
            props.state.selectedDocument.set('MRK');
          }}
        >
          {props.state.selectedDocSet.get === props.docSet.id ? <b>{props.docSet.id} </b> : props.docSet.id}
        </button>
      </div>
      {
        props.state.selectedDocSet.get !== props.docSet.id ?
          '' :
          <div>
            {`${props.docSet.documents.length} documents with${props.docSet.hasMapping ? '' : 'out'} verse mapping`}
          </div>}
    </>
  );
};

export default DocSetButton;
