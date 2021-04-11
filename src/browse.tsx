import React from 'react';

import BrowseVerse from './browse_verse';
import BrowseChapter from './browse_chapter';
import BrowseBlocks from './browse_blocks';
import DocumentPicker from './DocumentPicker';

const Browse = (props) => {
  const [renderMode, setRenderMode] = React.useState('verse');
  const [result, setResult] = React.useState({});
  const browseQueryTemplate =
    '{' +
    '  docSet(id:"%docSetId%") {' +
    '    selectors { key value }' +
    '    documents {' +
    '      id' +
    '      bookCode: header(id: "bookCode" )' +
    '      title: header(id: "toc2")' +
    '    }' +
    '  }' +
    '}';
  React.useEffect(() => {
    const doQuery = async () => {
      const browseQuery = browseQueryTemplate.replace(
        /%docSetId%/g,
        props.state.selectedDocSet.get || ''
      );
      const res = await props.pk.gqlQuery(browseQuery);
      setResult(res);
    };
    doQuery();
  }, [props.state.selectedDocSet.get, props.state.selectedDocument.get]);
  const selectorByName = (selectors, selectorName) =>
    selectors.filter((s) => s.key === selectorName)[0].value;
  const ds =
    !result.data || !result.data.docSet
      ? {}
      : result.data.docSet;
  let browseView;
  switch (renderMode) {
    case 'verse':
      browseView =
        <BrowseVerse pk={props.pk} state={props.state} renderMode={renderMode} setRenderMode={setRenderMode}/>;
      break;
    case 'chapter':
      browseView =
        <BrowseChapter pk={props.pk} state={props.state} renderMode={renderMode} setRenderMode={setRenderMode}/>;
      break;
    case 'blocks':
      browseView =
        <BrowseBlocks pk={props.pk} state={props.state} renderMode={renderMode} setRenderMode={setRenderMode}/>;
      break;
    default:
      throw new Error(`Unknown renderMode '${renderMode}'`);
  }
  return (
    <div className="content scrollableTabPanel">
      {!props.state.selectedDocSet.get || !ds || !ds.selectors ? (
        ''
      ) : (
        <div>
          <>
            <h2>
              {`${selectorByName(ds.selectors, 'abbr')} (${selectorByName(
                ds.selectors,
                'lang'
              )})`}
            </h2>
            <DocumentPicker
              docSet={ds}
              state={props.state}
            />
          </>
        </div>
      )}
      {browseView}
    </div>
  );
};

export default Browse;
