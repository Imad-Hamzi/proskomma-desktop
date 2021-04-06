import React from 'react';

const DocumentLink = (props) => {
  return (
    <>
      <button
        onClick={() => {
          props.state.selectedDocument.set(props.doc.id);
          props.state.selectedBook.set(props.doc.bookCode);
          props.state.tabIndex.set(1);
        }}
      >
        {props.doc.title}
      </button>
    </>
  );
};

export default DocumentLink;
