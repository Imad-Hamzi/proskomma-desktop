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
import Footer from './components/Footer';
import DocSets from './tabs/DocSets';
import Browse from './tabs/Browse';
import Search from './tabs/Search';
import EditBlock from './tabs/EditBlock';
import VerseMapping from './tabs/VerseMapping';
import PkQuery from './tabs/PkQuery';
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
  const [savedQueries, setSavedQueries] = React.useState([
    '{ processor packageVersion nDocSets nDocuments }',
    '{docSets { selectors { key value } documents { headers { key value } } } }',
    '{docSet(id:"unfoldingWord/en_ust") { document(bookCode:"MAT") { bookCode: header(id: "bookCode") mainSequence { blocks { text } } } } }',
    '{docSet(id:"unfoldingWord/en_ust") { document(bookCode:"MAT") { cv(chapter:"28" verses:"20") { text items { type subType payload } } } } }',
    '{docSet(id:"unfoldingWord/en_ust") { document(bookCode:"MAT") { cvNavigation(chapter:"28" verse:"20") { previousChapter previousVerse { chapter verse } nextVerse { chapter verse } nextChapter } } } }',
  ]);
  const [selectedBook, setSelectedBook] = React.useState('');
  const [selectedChapter, setSelectedChapter] = React.useState('1');
  const [selectedVerse, setSelectedVerse] = React.useState('1');
  const [mutationCount, setMutationCount] = React.useState(0);
  const [renderMode, setRenderMode] = React.useState('verse');
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
    renderMode: {
      get: renderMode,
      set: setRenderMode,
    },
  };
  const mappingQueries = [];
  const translationSources = [
    '../data/unfoldingWord_en_ult_pkserialized.json',
    '../data/unfoldingWord_en_ust_pkserialized.json',
    '../data/unfoldingWord_hbo_uhb_pkserialized.json',
    '../data/unfoldingWord_grc_ugnt_pkserialized.json',
    '../data/ebible_cmn_cmn_pkserialized.json',
    '../data/ebible_en_web_pkserialized.json',
    '../data/ebible_fr_lsg_pkserialized.json',
    '../data/dbl_en_drh_pkserialized.json',
    '../data/dbl_en_gnv_pkserialized.json',
    '../data/dbl_en_kjv_pkserialized.json',
    '../data/dbl_nl_nld1939_pkserialized.json',
    '../data/dbl_spa_rv09_pkserialized.json',
    '../data/dbl_grc_tr_pkserialized.json',
    '../data/dbl_ben_irv_pkserialized.json',
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
            <Tab label="Edit" />
            <Tab label={"Verse Mapping"} />
            <Tab label="Raw Query" />
          </Tabs>
        </AppBar>
        <Container className={classes.content}>
          {tabN === 0 && (
            <DocSets pk={pk} state={state} mutationCount={mutationCount} />
          )}
          {tabN === 1 && <Browse pk={pk} state={state} />}
          {tabN === 2 && <Search pk={pk} state={state} />}
          {tabN === 3 && <EditBlock pk={pk} state={state} />}
          {tabN === 4 && <VerseMapping pk={pk} state={state} />}
          {tabN === 5 && <PkQuery pk={pk} state={state} />}
        </Container>
        <Footer />
      </div>
    );
  });
  return <RootComponent />;
}
