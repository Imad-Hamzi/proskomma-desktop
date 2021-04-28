import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import InspectQuery from './InspectQuery';
import styles from '../styles';
import { renderVersesItems } from "../render_utils";
import { string2aghast, aghast2items } from 'proskomma-utils';

const EditBlock = withStyles(styles)((props) => {
  const {classes} = props;
  const [result, setResult] = React.useState({});
  const [query, setQuery] = React.useState('');
  const [blockNo, setBlockNo] = React.useState(0);
  const [nBlocks, setNBlocks] = React.useState(0);
  const [blockContent, setBlockContent] = React.useState('');
  const [displayMode, setDisplayMode] = React.useState('read');
  const [changeNo, setChangeNo] = React.useState(0);
  const [mainSequenceId, setMainSequenceId] = React.useState('');
  const blocksQueryTemplate =
    '{\n' +
    '  docSet(id:"%docSetId%") {\n' +
    '    document(bookCode: "%bookCode%") {\n' +
    '      title: header(id: "toc2")\n' +
    '      mainSequence {\n' +
    '        id' +
    '        nBlocks' +
    '        blocks(positions: [%blockNo%]) { aghast }\n' +
    '      }\n' +
    '    }\n' +
    '  }\n' +
    '}';

  const handleTextChange = (ev) => {
    if (ev) {
      setBlockContent(ev.target.value);
    }
  };

  const handleDisplayChange = async ev => {
    if (ev) {
      if (displayMode === 'read') {
        setDisplayMode('write');
      } else {
        console.log('write changes!');
        let query = `mutation { updateItems(` +
          `docSetId: "${props.state.selectedDocSet.get}"` +
          ` documentId: "${props.state.selectedDocument.get}"` +
          ` sequenceId: "${mainSequenceId}"` +
          ` blockPosition: ${blockNo}` +
          ` aghast: """${blockContent}""") }`;
        const res = await props.pk.gqlQuery(query);
        console.log(res);
        setDisplayMode('read');
        setChangeNo(changeNo + 1);
      }
    }
  };

  React.useEffect(() => {
    const doQuery = async () => {
      if (props.state.selectedDocument) {
        const editQuery = blocksQueryTemplate
          .replace(/%docSetId%/g, props.state.selectedDocSet.get)
          .replace(/%bookCode%/g, props.state.selectedBook.get || 'MAT')
          .replace(/%blockNo%/g, blockNo.toString());
        setQuery(editQuery);
        const res = await props.pk.gqlQuery(editQuery);
        setResult(res);
        setBlockContent(res.data.docSet.document.mainSequence.blocks[0].aghast);
        setNBlocks(res.data.docSet.document.mainSequence.nBlocks);
        setMainSequenceId(res.data.docSet.document.mainSequence.id);
      }
    };
    doQuery();
  }, [
    props.state.selectedDocSet.get,
    props.state.selectedBook.get,
    blockNo,
    changeNo,
  ]);
  if (result.data && result.data.docSet) {
    const title = (
      <div>
        <IconButton
          disabled={blockNo === 0}
          onClick={() => setBlockNo(blockNo - 1)}
        >
          <ArrowBackIcon/>
        </IconButton>
        <Typography variant="body1" display="inline" className={classes.browseNavigationText}>
          {`Paragraph ${blockNo + 1} of ${nBlocks}`}
          <InspectQuery state={props.state} query={query}/>
        </Typography>
        <IconButton
          disabled={blockNo == nBlocks - 1}
          onClick={() => setBlockNo(blockNo + 1)}
        >
          <ArrowForwardIcon/>
        </IconButton>
      </div>
    );
    const content = displayMode === 'write' ?
        <TextareaAutosize
          className={classes.pkQueryTextarea}
          rowsMin="5"
          rowsMax="25"
          display="block"
          onChange={async (event) => handleTextChange(event)}
          onDoubleClick={handleDisplayChange}
          value={blockContent}
        /> :
        <Typography
          variant="body1"
          className={classes.browseBlocksScriptureText}
          onDoubleClick={handleDisplayChange}
        >
          {renderVersesItems(
            blockContent ? aghast2items(string2aghast(blockContent)): [],
            props.state.selectedVerse.set,
            props.state.renderMode.set
          )}
        </Typography>;
    return (
      <>
        {title}
        {content}
      </>
    );
  }
  return <Typography variant="body1">No docSet selected</Typography>;
});

export default EditBlock;
