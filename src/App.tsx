import React, { useEffect, useState } from 'react';

import fse from 'fs-extra';
import path from 'path';

import TitleBar from 'frameless-titlebar';
import { remote } from 'electron';

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Container from '@material-ui/core/Container';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { UWProskomma } from 'uw-proskomma';

import styles from './styles';
import Footer from './footer';
import DocSets from './doc_sets';
import Browse from './browse';
import Search from './search';
import PkQuery from './pk_query';
import icon from '../assets/icons/48x48.ico';

const currentWindow = remote.getCurrentWindow();

const pk = new UWProskomma();

export default function App() {
  // Electron boilerplate
  useEffect(() => {
    const onMaximized = () => setMaximized(true);
    const onRestore = () => setMaximized(false);
    currentWindow.on('maximize', onMaximized);
    currentWindow.on('unmaximize', onRestore);
    return () => {
      currentWindow.removeListener('maximize', onMaximized);
      currentWindow.removeListener('unmaximize', onRestore);
    };
  }, []);

  const handleMaximize = () => {
    if (maximized) {
      currentWindow.restore();
    } else {
      currentWindow.maximize();
    }
  };

  const [maximized, setMaximized] = useState(currentWindow.isMaximized());
  // Actual app code starts here
  const [tabN, setTabN] = useState(0);
  const [selectedDocSet, setSelectedDocSet] = useState('');
  const [selectedDocument, setSelectedDocument] = useState('');
  const [savedQueries, setSavedQueries] = React.useState([]);
  const [selectedBook, setSelectedBook] = React.useState('MRK');
  const [selectedChapter, setSelectedChapter] = React.useState('1');
  const [selectedVerse, setSelectedVerse] = React.useState('1');
  const [mutationCount, setMutationCount] = React.useState(0);
  const state = {
    tabN: {
      get: tabN,
      set: setTabN,
    },
    selectedDocSet: {
      get: selectedDocSet,
      set: setSelectedDocSet,
    },
    selectedDocument: {
      get: selectedDocument,
      set: setSelectedDocument,
    },
    savedQueries: {
      get: savedQueries,
      set: setSavedQueries,
    },
    selectedBook: {
      get: selectedBook,
      set: setSelectedBook,
    },
    selectedChapter: {
      get: selectedChapter,
      set: setSelectedChapter,
    },
    selectedVerse: {
      get: selectedVerse,
      set: setSelectedVerse,
    },
    mutationCount: {
      get: mutationCount,
      set: setMutationCount,
    },
  };
  const mappingQueries = [];
  const translationSources = [
    '../data/unfoldingWord_en_ult_pkserialized.json',
    '../data/unfoldingWord_en_ust_pkserialized.json',
    '../data/unfoldingWord_hbo_uhb_pkserialized.json',
    '../data/unfoldingWord_grc_ugnt_pkserialized.json',
    '../data/ebible_en_web_pkserialized.json',
    '../data/ebible_fr_lsg_pkserialized.json',
    '../data/dbl_en_drh_pkserialized.json',
  ].map((ts) => path.resolve(__dirname, ts));

  for (const [docSetId, vrsSource] of [
    ['ebible/en_web', '../data/web.vrs'],
    ['dbl/en_drh', '../data/drh.vrs'],
  ]) {
    const vrs = fse.readFileSync(path.resolve(__dirname, vrsSource)).toString();
    const mutationQuery = `mutation { setVerseMapping(docSetId: "${docSetId}" vrsSource: """${vrs}""")}`;
    mappingQueries.push(mutationQuery);
  }
  useEffect(() => {
    const loadTranslations = async () => {
      for (const translationSource of translationSources) {
        pk.loadSuccinctDocSet(fse.readJsonSync(translationSource));
      }
    };
    const loadMappings = async () => {
      for (const query of mappingQueries) {
        await pk.gqlQuery(query);
      }
    };
    loadTranslations().then(() =>
      loadMappings().then(() => {
        console.log('done');
        setMutationCount(1);
      })
    );
  }, []);

  const RootComponent = withStyles(styles)((props) => {
    const { classes } = props;
    const onTabChange = (e, v) => {
      setTabN(v);
    };
    return (
      <div className={classes.root}>
        <TitleBar
          title="Chaliki (powered by Proskomma)"
          iconSrc={icon}
          currentWindow={currentWindow}
          onMaximize={handleMaximize}
          onDoubleClick={handleMaximize}
          onMinimize={() => currentWindow.minimize()}
          onClose={() => currentWindow.close()}
          maximized={maximized}
        />
        <AppBar position="static">
          <Tabs value={tabN} onChange={onTabChange}>
            <Tab label="DocSets" />
            <Tab label="Browse" />
            <Tab label="Search" />
            <Tab label="Raw Query" />
          </Tabs>
        </AppBar>
        <Container className={classes.content}>
          {tabN === 0 && (
            <DocSets pk={pk} state={state} mutationCount={mutationCount} />
          )}
          {tabN === 1 && <Browse pk={pk} state={state} />}
          {tabN === 2 && <Search pk={pk} state={state} />}
          {tabN === 3 && <PkQuery pk={pk} state={state} />}
        </Container>
        <Footer />
      </div>
    );
  });
  return <RootComponent />;
}
