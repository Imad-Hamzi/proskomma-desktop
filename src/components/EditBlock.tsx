import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import {createEditor} from 'slate';
import {Editable, Slate, withReact} from 'slate-react';
import InspectQuery from './InspectQuery';
import styles from '../styles';
import Button from "@material-ui/core/Button";

const xre = require('xregexp');

const items2slate = (items) => {  // Ignoring grafts, spanWithAtts, milestones and attributes
  const ret = [[]];
  const spans = [];
  let atts = [];
  const closeCV = {
    chapter: null,
    verses: null,
  };
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
            closeCV[scopeBits[0]] = null;
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
            spans.unshift(scopeBits[1]);
          } else if (scopeBits[0] === 'spanWithAtts') {
            ret.unshift([]);
            spans.unshift(scopeBits[1]);
            atts = [];
          } else if (scopeBits[0] === 'attribute') {
            atts.push(scopeBits.slice(3));
          }
        } else {
          // end
          if (['chapter', 'verses'].includes(scopeBits[0])) {
            closeCV[scopeBits[0]] = scopeBits[1];
          } else if (scopeBits[0] === 'span') {
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
                    type: 'markup',
                    elementText: `${topTag}<`,
                    children: [
                      {
                        text: "",
                      },
                    ]
                  },
                  ...topStack,
                  {
                    text: '',
                  },
                ],
              },
              {
                type: 'markup',
                elementText: '>',
                children: [
                  {
                    text: '',
                  },
                ],
              }
            );
          } else if (scopeBits[0] === 'spanWithAtts') {
            const topStack = ret.shift();
            const topTag = spans.shift();
            ret[0].push(
              {
                text: '',
              },
              {
                type: `spanWithAtts/${topTag}`,
                children: [
                  {
                    type: 'markup',
                    elementText: `${topTag}[${atts.length}]<`,
                    atts: atts,
                    children: [
                      {
                        text: "",
                      },
                    ]
                  },
                  ...topStack,
                  {
                    text: '',
                  },
                ],
              },
              {
                type: 'markup',
                elementText: '>',
                children: [
                  {
                    text: '',
                  },
                ],
              }
            );
            atts = [];
          }
        }
        break;
      default:
        break;
    }
  }
  maybePushTokens();
  return [
    [
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
    ],
    closeCV
  ];
};

const slate2items = (slate, toClose) => {
  const ret = [];
  let verses = null;
  let chapter = null;
  const printableRegexes = [ // Missing some obscure options!
    ['wordLike', xre('([\\p{Letter}\\p{Number}\\p{Mark}\\u2060]{1,127})')],
    ['lineSpace', xre('([\\p{Separator}]{1,127})')],
    ['punctuation', xre('([\\p{Punctuation}+®])')],
  ];
  const allPrintableRegexes = xre.union(printableRegexes.map(rr => rr[1]));
  const isEmptyString = (ob) => ob.text && ob.text === '';
  const numbersFromVerseRange = vr => {
    if (vr.includes('-')) {
      const [fromV, toV] = vr.split('-').map(v => parseInt(v));
      return Array.from(Array((toV - fromV) + 1).keys()).map(v => v + fromV);
    } else {
      return [parseInt(vr)];
    }
  }
  const openChapter = (ret, ch) => {
    ret.push({
      type: 'scope',
      subType: 'start',
      payload: `chapter/${ch}`
    });
  }
  const closeChapter = (ret, ch) => {
    ret.push({
      type: 'scope',
      subType: 'end',
      payload: `chapter/${ch}`
    });
  }
  const openVerseRange = (ret, vr) => {
    numbersFromVerseRange(vr).forEach(
      v => ret.push({
        type: 'scope',
        subType: 'start',
        payload: `verse/${v}`
      }),
    );
    ret.push({
      type: 'scope',
      subType: 'start',
      payload: `verses/${vr}`
    });
  }
  const closeVerseRange = (ret, vr) => {
    ret.push({
      type: 'scope',
      subType: 'end',
      payload: `verses/${vr}`
    });
    numbersFromVerseRange(vr).reverse().forEach(
      v => ret.push({
        type: 'scope',
        subType: 'end',
        payload: `verse/${v}`
      }),
    );
  }
  const processTokens = child => {
    xre.forEach(
      child.text,
      allPrintableRegexes,
      tText => {
        for (const [tType, tRegex] of printableRegexes) {
          if (xre.match(tText, tRegex, 0, true)) {
            ret.push({
              type: 'token',
              subType: tType,
              payload: tText[0],
            });
            break;
          }
        }
      }
    );
  }
  const processChapter = child => { // To do this properly we need to look at open scopes
    openChapter(ret, child.elementText);
    chapter = child.elementText;
  }
  const processVerses = child => {
    if (verses) {
      closeVerseRange(ret, verses)
    }
    verses = child.elementText;
    openVerseRange(ret, verses);
  }
  const processSpan = child => {
    ret.push(
      {
        type: "scope",
        subType: "start",
        payload: child.type,
      }
    );
    slate2items1(child.children.filter(c => !isEmptyString(c)));
    ret.push(
      {
        type: "scope",
        subType: "end",
        payload: child.type,
      }
    );
  }
  const slate2items1 = children => {
    for (const child of children) {
      if ('text' in child) {
        processTokens(child);
      } else if (child.type === 'chapter') {
        processChapter(child);
      } else if (child.type === 'verses') {
        processVerses(child);
      } else if (child.type.startsWith('span')) {
        processSpan(child);
      }
    }
  }
  slate2items1(slate.[0].children.filter(c => !isEmptyString(c)));
  if (toClose.verses) {
    closeVerseRange(ret, toClose.verses);
  }
  if (toClose.chapter) {
    closeChapter(ret, toClose.chapter);
  }
  return ret;
}

const EditBlock = withStyles(styles)((props) => {
  const {classes} = props;
  const [result, setResult] = React.useState({});
  const [query, setQuery] = React.useState('');
  const [blockNo, setBlockNo] = React.useState(0);
  const [nBlocks, setNBlocks] = React.useState(0);
  const [editsUnsaved, setEditsUnsaved] = React.useState(false);
  const [toClose, setToClose] = React.useState({chapter: null, verses: null});
  const [editorContent, setEditorContent] = React.useState([
    {
      type: 'block',
      children: [{text: 'Loading...'}],
    },
  ]);
  const [changeNo, setChangeNo] = React.useState(0);
  const blocksQueryTemplate =
    '{\n' +
    '  docSet(id:"%docSetId%") {\n' +
    '    document(bookCode: "%bookCode%") {\n' +
    '      title: header(id: "toc2")\n' +
    '      mainSequence {\n' +
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
          {props.children}
      </span>
    );
  });

  const SpanWithAttsElement = withStyles(styles)((props) => {
    const tag = props.element.type.split('/')[1];
    return (
      <span
        {...props.attributes}
        className={classes[`spanWithAtts${tag.toUpperCase()}Element`]}
      >
          {props.children}
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
      <span {...props.attributes} className={classes[props.leaf.class || 'tokensLeaf']}>
        {props.children}
      </span>
    );
  });

  const renderElement = React.useCallback((props) => {
    if (props.element.type === 'block') {
      return <p {...props.attributes}>{props.children}</p>;
    }
    if (props.element.type === 'markup') {
      if (props.element.atts) {
        return <span
          {...props.attributes}
          className={classes.editorMarkup}
          data-atts={props.element.atts.map(att => att.join('/')).join(' ')}
          onClick={(e, t) => console.log(e.target.getAttribute('data-atts'))}
        >
        {props.element.elementText}{props.children}
      </span>
      } else {
        return <span
          {...props.attributes}
          className={classes.editorMarkup}
        >
        {props.element.elementText}{props.children}
      </span>
      };
    }
    if (props.element.type.startsWith('span/')) {
      return <SpanElement {...props} />;
    }
    if (props.element.type.startsWith('spanWithAtts/')) {
      return <SpanWithAttsElement {...props} />;
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
    ['chapter', 'verses', 'markup'].includes(element.type);

  React.useEffect(() => {
    const doQuery = async () => {
      if (props.state.selectedDocument) {
        const editQuery = blocksQueryTemplate
          .replace(/%docSetId%/g, props.state.selectedDocSet.get)
          .replace(/%bookCode%/g, props.state.selectedBook.get || 'GEN')
          .replace(/%blockNo%/g, blockNo.toString());
        setQuery(editQuery);
        const res = await props.pk.gqlQuery(editQuery);
        setResult(res);
        const [items, closeCV] = items2slate(res.data.docSet.document.mainSequence.blocks[0].items);
        setEditorContent(items);
        setToClose(closeCV);
        setNBlocks(res.data.docSet.document.mainSequence.nBlocks);
      }
    };
    doQuery();
  }, [
    props.state.selectedDocSet.get,
    props.state.selectedBook.get,
    blockNo,
    changeNo,
  ]);

  const submitBlock = async () => {
    const items = slate2items(editorContent, toClose);
    const object2Query = obs => '[' + obs.map(ob => `{type: "${ob.type}" subType: "${ob.subType}" payload: "${ob.payload}"}`).join(', ') + ']';
    let query = `mutation { updateItems(` +
      `docSetId: "${props.state.selectedDocSet.get}"` +
      ` documentId: "${props.state.selectedDocument.get}"` +
      ` blockPosition: ${blockNo}` +
      ` items: ${object2Query(items)}) }`;
    const res = await props.pk.gqlQuery(query);
    console.log(res);
    setChangeNo(changeNo + 1);
  }

  if (result.data && result.data.docSet && editorContent.length > 0) {
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
    return (
      <>
        {title}
        <Slate
          editor={slateEditor}
          value={editorContent}
          onChange={(newValue) => {
            setEditsUnsaved(true);
            // console.log(JSON.stringify(newValue, null, 2));
            setEditorContent(newValue);
          }}
        >
          <Editable renderElement={renderElement} renderLeaf={renderLeaf}/>
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
            onClick={submitBlock}
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
