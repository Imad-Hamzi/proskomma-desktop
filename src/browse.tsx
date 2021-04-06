import React from 'react';

import BrowseModeSwitcher from './browse_mode_switcher';

const verseQueryTemplate =
  '{' +
  '  documents(withBook: "%bookCode%") {' +
  '    title: header(id: "toc2")' +
  '    cv (chapter:"%chapter%" verses:["%verse%"]) { text }' +
  '  }' +
  '}';

const chapterQueryTemplate =
  '{' +
  '  documents(withBook: "%bookCode%") {' +
  '    title: header(id: "toc2")' +
  '    cv (chapter:"%chapter%") { text }' +
  '  }' +
  '}';

const blocksQueryTemplate =
  '{' +
  '  documents(withBook: "%bookCode%") {' +
  '    title: header(id: "toc2")' +
  '    mainSequence {' +
  '      blocks(withScriptureCV:"%chapter%:%verse%") { text }' +
  '    }' +
  '  }' +
  '}';

const Browse = (props) => {
  const [result, setResult] = React.useState({});
  const [renderMode, setRenderMode] = React.useState('verse');
  React.useEffect(() => {
    const doQuery = async () => {
      if (props.state.selectedDocument) {
        let browseQuery;
        switch (renderMode) {
          case 'verse':
            browseQuery = verseQueryTemplate
              .replace(/%bookCode%/g, props.state.selectedBook.get)
              .replace(/%chapter%/g, props.state.selectedChapter.get)
              .replace(/%verse%/g, props.state.selectedVerse.get);
            break;
          case 'chapter':
            browseQuery = chapterQueryTemplate
              .replace(/%bookCode%/g, props.state.selectedBook.get)
              .replace(/%chapter%/g, props.state.selectedChapter.get);
            break;
          case 'blocks':
            browseQuery = blocksQueryTemplate
              .replace(/%bookCode%/g, props.state.selectedBook.get)
              .replace(/%chapter%/g, props.state.selectedChapter.get)
              .replace(/%verse%/g, props.state.selectedVerse.get);
            break;
          default:
            throw new Error(`Unknown renderMode '${renderMode}'`);
        }
        const res = await props.pk.gqlQuery(browseQuery);
        setResult(res);
        // console.log(renderMode, browseQuery, JSON.stringify(res));
      }
    };
    doQuery();
  }, [props.state.selectedBook.get, renderMode]);
  if (result.data && result.data.documents) {
    let scriptureTitle;
    let scriptureText;
    switch (renderMode) {
      case 'verse':
        scriptureTitle = (
          <h3>
            {result.data.documents[0].title}
            {` ${props.state.selectedChapter.get}:${props.state.selectedVerse.get}`}
          </h3>
        );
        scriptureText =
          'cv' in result.data.documents[0] ?
            <p>{result.data.documents[0].cv[0].text}</p>
            : '';
        break;
      case 'chapter':
        scriptureTitle = (
          <h3>
            {result.data.documents[0].title} {props.state.selectedChapter.get}
          </h3>
        );
        scriptureText =
          'cv' in result.data.documents[0] ?
            <p>{result.data.documents[0].cv[0].text}</p>
            : '';
        break;
      case 'blocks':
        scriptureTitle = (
          <h3>
            {`Block(s) containing ${result.data.documents[0].title}`}
            {` ${props.state.selectedChapter.get}:${props.state.selectedVerse.get}`}
          </h3>
        );
        scriptureText =
          'mainSequence' in result.data.documents[0] ?
            result.data.documents[0].mainSequence.blocks.map(b => <p>{b.text}</p>)
            : '';
        break;
    }
    return (
      <div className="content">
        <div>
          <BrowseModeSwitcher
            renderMode={renderMode}
            setRenderMode={setRenderMode}
          />
        </div>
        {scriptureTitle}
        {scriptureText}
      </div>
    );
  }
  return <div>No document selected</div>;
};

export default Browse;
