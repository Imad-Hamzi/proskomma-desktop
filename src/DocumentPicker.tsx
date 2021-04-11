import React from 'react';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

/*
props.state.selectedDocument.set(props.doc.id);
props.state.selectedBook.set(props.doc.bookCode);
props.state.selectedChapter.set('1');
props.state.selectedVerse.set('1');
 */

const DocumentPicker = (props) => {
  const changeSelectedDocument = (e) => {
    const newDocumentId = e.target.value;
    const newBookCode = props.docSet.documents.filter(d => d.id === newDocumentId)[0].bookCode;
    props.state.selectedDocument.set(newDocumentId);
    props.state.selectedBook.set(newBookCode);
    props.state.selectedChapter.set('1');
    props.state.selectedVerse.set('1');

  };

  return (
    <FormControl>
      <Select
        value={props.state.selectedDocument.get}
        onChange={changeSelectedDocument}
        inputProps={{
          name: 'Book',
          id: 'Book'
        }}
      >
        {props.docSet.documents.map((d) => (
          <MenuItem
            value={d.id}
            key={d.id}
          >
            {d.title}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DocumentPicker;
