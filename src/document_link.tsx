import React from 'react';

const DocumentLink = (props) => {
  return (
    <div
      onClick={(ev) => {
        console.log(props.docSet.id, props.doc.bookCode);
        props.setTabIndex(1);
      }}
    >
      {props.doc.title}
    </div>
  );
};

export default DocumentLink;
