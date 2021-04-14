import React from 'react';

import ListItemText from '@material-ui/core/ListItemText';

const DocSet = (props) => {
  return (
    <ListItemText
      primary={`${props.docSet.id}${props.docSet.id === props.state.selectedDocSet.get ? ' (selected)' : ''}`}
      secondary={`${props.docSet.documents.length} documents with${props.docSet.hasMapping ? '' : 'out'} verse mapping`}
      onClick={() => {
        props.state.selectedDocSet.set(props.docSet.id);
        props.state.selectedDocument.set(props.docSet.documents[0].id);
        props.state.selectedBook.set(props.docSet.documents[0].bookCode);
      }}
    />
  );
};

export default DocSet;
