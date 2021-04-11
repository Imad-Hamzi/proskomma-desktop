import React from 'react';
import DocumentLink from './DocumentLink';

const DocumentPicker = (props) => {
  return (
    <div>
      {props.docSet.documents.map((d) => (
        <DocumentLink
          key={d.id}
          docSet={props.ds}
          doc={d}
          state={props.state}
        />
      ))}
    </div>
  );
}


export default DocumentPicker;
