import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import styles from './styles';
import { renderVersesItems } from './render_utils';
import BrowseModeButton from './BrowseModeButton';

const BrowseBlocks = withStyles(styles)((props) => {
  const { classes } = props;
  const [result, setResult] = React.useState({});
  const blocksQueryTemplate =
    '{' +
    '  docSet(id:"%docSetId%") {' +
    '    document(bookCode: "%bookCode%") {' +
    '      title: header(id: "toc2")' +
    '      mainSequence {' +
    '        blocks(withScriptureCV:"%chapter%:%verse%") {' +
    '          items { type subType payload }' +
    '        }' +
    '      }' +
    '    }' +
    '  }' +
    '}';

  React.useEffect(() => {
    const doQuery = async () => {
      if (props.state.selectedDocument) {
        const browseQuery = blocksQueryTemplate
          .replace(/%docSetId%/g, props.state.selectedDocSet.get)
          .replace(/%bookCode%/g, props.state.selectedBook.get)
          .replace(/%chapter%/g, props.state.selectedChapter.get)
          .replace(/%verse%/g, props.state.selectedVerse.get);
        const res = await props.pk.gqlQuery(browseQuery);
        setResult(res);
      }
    };
    doQuery();
  }, [
    props.state.selectedDocSet.get,
    props.state.selectedBook.get,
    props.state.renderMode.get,
  ]);
  if (result.data && result.data.docSet) {
    const scriptureTitle = (
      <Typography variant="body1" className={classes.browseNavigationText}>
        {`Paragraph(s) containing ${props.state.selectedChapter.get}:${props.state.selectedVerse.get} `}
        <BrowseModeButton
          newMode="chapter"
          setRenderMode={props.state.renderMode.set}
          label="View Chapter"
        />
        <BrowseModeButton
          newMode="verse"
          setRenderMode={props.state.renderMode.set}
          label="View Verse"
        />
      </Typography>
    );
    const scriptureText =
      'mainSequence' in result.data.docSet.document
        ? [
            ...result.data.docSet.document.mainSequence.blocks.entries(),
          ].map((b) => (
            <Typography variant="body1" key={b[0]} className={classes.browseBlocksScriptureText}>
              {renderVersesItems(
                b[1].items,
                props.state.selectedVerse.set,
                props.state.renderMode.set
              )}
            </Typography>
          ))
        : '';
    return (
      <>
        {scriptureTitle}
        {scriptureText}
      </>
    );
  }
  return <Typography variant="body1">No docSet selected</Typography>;
});

export default BrowseBlocks;
