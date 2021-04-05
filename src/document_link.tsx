import React from 'react';

const DocumentLink = (props) => {
  return (
    <>
      <span
        onClick={() => {
          props.state.selectedDocument.set(props.doc.id);
          props.state.tabIndex.set(1);
        }}
      >
        {props.doc.title}
      </span>
    </>
  );
};

export default DocumentLink;
