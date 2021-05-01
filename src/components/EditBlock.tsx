import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import InspectQuery from './InspectQuery';
import styles from '../styles';
import Button from "@material-ui/core/Button";

const items2slate = (items) => {
  const ret = [[]];
  const spans = [];
  let tokenPayloads = [];
  const maybePushTokens = () => {
    if (tokenPayloads.length > 0) {
      ret[0].push({
        type: 'tokens',
        text: tokenPayloads.join('').replace(/\s+/g, ' '),
      });
      tokenPayloads = [];
    }
  };

  for (const item of items) {
    switch (item.type) {
      case 'token':
        tokenPayloads.push(item.payload);
        break;
      case 'scope':
        maybePushTokens();
        const scopeBits = item.payload.split('/');
        if (item.subType === 'start') {
          if (['chapter', 'verses'].includes(scopeBits[0])) {
            ret[0].push({
              type: scopeBits[0],
              elementText: scopeBits[1],
              children: [
                {
                  text: '',
                },
              ],
            });
          } else if (scopeBits[0] === 'span') {
            ret.unshift([]);
            spans.push(scopeBits[1]);
          }
        } else {
          // end
          if (scopeBits[0] === 'span') {
            const topStack = ret.shift();
            const topTag = spans.shift();
            ret[0].push(
              {
                text: '',
              },
              {
                type: `span/${topTag}`,
                children: [
                  {
                    text: '',
                  },
                  ...topStack,
                  {
                    text: '',
                  },
                ],
              },
              {
                text: '',
              }
            );
          }
        }
        break;
      default:
        break;
    }
  }
  maybePushTokens();
  console.log(JSON.stringify(ret[0], null, 2));
  return [
    {
      type: 'block',
      children: [
        {
          text: '',
        },
        ...ret[0],
        {
          text: '',
        },
      ],
    },
  ];
};

const EditBlock = withStyles(styles)((props) => {
  const { classes } = props;
  const [result, setResult] = React.useState({});
  const [query, setQuery] = React.useState('');
  const [blockNo, setBlockNo] = React.useState(45);
  const [nBlocks, setNBlocks] = React.useState(0);
  const [editsUnsaved, setEditsUnsaved] = React.useState(false);
  const [editorContent, setEditorContent] = React.useState([
    {
      type: 'block',
      children: [{ text: 'Loading...' }],
    },
  ]);
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
    '        blocks(positions: [%blockNo%]) { items { type subType payload } }\n' +
    '      }\n' +
    '    }\n' +
    '  }\n' +
    '}';

  const SpanElement = withStyles(styles)((props) => {
    const tag = props.element.type.split('/')[1];
    return (
      <span
        {...props.attributes}
        className={classes[`span${tag.toUpperCase()}Element`]}
      >
        <>
          <span className={classes.editorStartMarkup}>{`${tag}<`}</span>
          {props.children}
          <span className={classes.editorEndMarkup}>{`>`}</span>
        </>
      </span>
    );
  });

  const ChapterElement = withStyles(styles)((props) => {
    return (
      <span {...props.attributes} className={classes.chapterElement}>
        {'Ch '}
        {props.element.elementText}
        {props.children}
      </span>
    );
  });

  const VersesElement = withStyles(styles)((props) => {
    return (
      <span {...props.attributes} className={classes.versesElement}>
        {'vv '}
        {props.element.elementText}
        {props.children}
      </span>
    );
  });

  const TokensLeaf = withStyles(styles)((props) => {
    return (
      <span {...props.attributes} className={classes.tokensLeaf}>
        {props.children}
      </span>
    );
  });

  const renderElement = React.useCallback((props) => {
    if (props.element.type === 'block') {
      return <p {...props.attributes}>{props.children}</p>;
    }
    if (props.element.type.startsWith('span')) {
      return <SpanElement {...props} />;
    }
    if (props.element.type === 'chapter') {
      return <ChapterElement {...props} />;
    }
    if (props.element.type === 'verses') {
      return <VersesElement {...props} />;
    }
  }, []);

  const renderLeaf = React.useCallback(
    (props) => <TokensLeaf {...props} />,
    []
  );

  const slateEditor = React.useMemo(() => withReact(createEditor()), []);
  slateEditor.isInline = (element) => element.type !== 'block';
  slateEditor.isVoid = (element) =>
    ['chapter', 'verses'].includes(element.type);

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
        setEditorContent(
          items2slate(res.data.docSet.document.mainSequence.blocks[0].items)
        );
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
  if (result.data && result.data.docSet && editorContent.length > 0) {
    const title = (
      <div>
        <IconButton
          disabled={blockNo === 0}
          onClick={() => setBlockNo(blockNo - 1)}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="body1"
          display="inline"
          className={classes.browseNavigationText}
        >
          {`Paragraph ${blockNo + 1} of ${nBlocks}`}
          <InspectQuery state={props.state} query={query} />
        </Typography>
        <IconButton
          disabled={blockNo == nBlocks - 1}
          onClick={() => setBlockNo(blockNo + 1)}
        >
          <ArrowForwardIcon />
        </IconButton>
      </div>
    );
    return (
      <>
        {title}
        <Slate
          editor={slateEditor}
          value={editorContent}
          onChange={(newValue) => {
            setEditsUnsaved(true);
            console.log(JSON.stringify(newValue, null, 2));
            setEditorContent(newValue);
          }}
        >
          <Editable renderElement={renderElement} renderLeaf={renderLeaf} />
        </Slate>
        <div>
          <Button
            className={classes.cancelBlockEditButton}
            disabled={!editsUnsaved}
            variant="outlined"
            size="small"
            onClick={() => {
              setEditorContent(
                items2slate(result.data.docSet.document.mainSequence.blocks[0].items)
              );
              setEditsUnsaved(false);
            }}
          >
            Cancel
          </Button>
          <Button
            className={classes.submitBlockEditButton}
            disabled={!editsUnsaved}
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              console.log('Submit');
            }}
          >
            Submit
          </Button>
        </div>
      </>
    );
  }
  return <Typography variant="body1">No docSet selected</Typography>;
});

export default EditBlock;
