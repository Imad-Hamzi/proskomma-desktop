import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import {createEditor} from 'slate';
import {Editable, Slate, withReact} from 'slate-react';

import {aghast2items, string2aghast} from 'proskomma-utils';
import InspectQuery from './InspectQuery';
import styles from '../styles';
import {renderVersesItems} from '../render_utils';

const EditBlock = withStyles(styles)((props) => {
  const {classes} = props;
  const [result, setResult] = React.useState({});
  const [query, setQuery] = React.useState('');
  const [blockNo, setBlockNo] = React.useState(0);
  const [nBlocks, setNBlocks] = React.useState(0);
  const [blockContent, setBlockContent] = React.useState('');
  const [editorContent, setEditorContent] = React.useState([
    {
      type: 'block',
      children: [
        {
          type: 'tokens',
          text: "",
        },
        {
          type: 'chapter',
          children: [
            { type: 'tokens',
              text: '45',
            },
          ],
        },
        {
          type: 'tokens',
          text: "",
        },
        {
          type: 'verses',
          children: [
            { type: 'tokens',
              text: '23',
            },
          ],
        },
        {
          type: 'tokens',
          text: "Here is ",
        },
        {
          type: 'charTag/b',
          children: [
            {type: 'tokens', text: "some "},
            {
              type: 'charTag/i',
              children: [{type: 'tokens', text: "text"}],
            },
            ],
        },
        {
          type: 'tokens',
          text: " and here is some ",
        },
        {
          type: 'charTag/i',
          children: [{type: 'tokens', text: "more"}],
        },
        {
          type: 'tokens',
          text: " text",
        },
      ],
    }
  ]);
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

  const CharTagBElement = withStyles(styles)(
    (props) => {
      return <span {...props.attributes} className={classes.charTagBElement}>{props.children}</span>;
    });

  const CharTagIElement = withStyles(styles)(
    (props) => {
      return <span {...props.attributes} className={classes.charTagIElement}>{props.children}</span>;
    });

  const ChapterElement = withStyles(styles)(
    (props) => {
      return <span {...props.attributes} className={classes.chapterElement}>{props.children}</span>;
    });

  const VersesElement = withStyles(styles)(
    (props) => {
      return <span {...props.attributes} className={classes.versesElement}>{props.children}</span>;
    });

  const TokensLeaf = withStyles(styles)(
    (props) => {
      return <span {...props.attributes} className={classes.tokensLeaf}>{props.children}</span>;
    });

  const renderElement = React.useCallback((props) => {
    switch (props.element.type) {
      case 'block':
        return <p {...props.attributes}>{props.children}</p>;
      case 'charTag/b':
        return <CharTagBElement {...props} />;
      case 'charTag/i':
        return <CharTagIElement {...props} />;
      case 'chapter':
        return <ChapterElement {...props} />;
      case 'verses':
        return <VersesElement {...props} />;
    }
  }, []);

  const renderLeaf = React.useCallback((props) => {
    switch (props.leaf.type) {
      case 'tokens':
        return <TokensLeaf {...props} />;
      default:
        return `??? ${props.leaf.text} ???`
    }
  }, []);

  const slateEditor = React.useMemo(() => withReact(createEditor()), []);
  slateEditor.isInline = element => element.type !== 'block';

  const handleTextChange = (ev) => {
    if (ev) {
      setBlockContent(ev.target.value);
    }
  };

  const handleDisplayChange = async (ev) => {
    if (ev) {
      if (displayMode === 'read') {
        setDisplayMode('write');
      } else {
        console.log('write changes!');
        const query =
          `mutation { updateItems(` +
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
        <Typography
          variant="body1"
          display="inline"
          className={classes.browseNavigationText}
        >
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
    const content =
      displayMode === 'write' ? (
        /*
        <TextareaAutosize
          className={classes.pkQueryTextarea}
          rowsMin="5"
          rowsMax="25"
          display="block"
          onChange={async (event) => handleTextChange(event)}
          onDoubleClick={handleDisplayChange}
          value={blockContent}
        />
       */
        <Slate
          editor={slateEditor}
          value={editorContent}
          onChange={(newValue) => {
            console.log(newValue);
            setEditorContent(newValue)
          }}
        >
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
          />
        </Slate>
      ) : (
        <Typography
          variant="body1"
          className={classes.browseBlocksScriptureText}
          onDoubleClick={handleDisplayChange}
        >
          {renderVersesItems(
            blockContent ? aghast2items(string2aghast(blockContent)) : [],
            props.state.selectedVerse.set,
            props.state.renderMode.set
          )}
        </Typography>
      );
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
