import React, { useEffect, useState } from 'react';

import fse from 'fs-extra';
import path from 'path';

import TitleBar from 'frameless-titlebar';
import { remote } from 'electron';

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/core/Menu';

import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import { UWProskomma } from 'uw-proskomma';

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
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedDocSet, setSelectedDocSet] = useState('');
  const [selectedDocument, setSelectedDocument] = useState('');
  const [savedQueries, setSavedQueries] = React.useState([]);
  const [selectedBook, setSelectedBook] = React.useState('MRK');
  const [selectedChapter, setSelectedChapter] = React.useState('1');
  const [selectedVerse, setSelectedVerse] = React.useState('1');
  const [mutationCount, setMutationCount] = React.useState(0);
  const state = {
    tabIndex: {
      get: tabIndex,
      set: setTabIndex,
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
  ].map(ts => path.resolve(__dirname, ts));

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
    loadTranslations()
      .then(
        () => loadMappings()
          .then(() => {console.log("done"); setMutationCount(1)})
      );
  }, []);

  return (
    <>
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
      <Tabs
        selectedIndex={tabIndex}
        onSelect={(index) => setTabIndex(index)}
        className="top_tabs"
      >
        <TabList>
          <Tab>DocSets</Tab>
          <Tab>Browse</Tab>
          <Tab>Search</Tab>
          <Tab>Pk Query</Tab>
        </TabList>
        <TabPanel>
          <DocSets pk={pk} state={state} mutationCount={mutationCount} />
        </TabPanel>
        <TabPanel>
          <Browse pk={pk} state={state} />
        </TabPanel>
        <TabPanel>
          <Search pk={pk} state={state} />
        </TabPanel>
        <TabPanel>
          <PkQuery pk={pk} state={state} />
        </TabPanel>
      </Tabs>
      <Footer />
    </>
  );
}
