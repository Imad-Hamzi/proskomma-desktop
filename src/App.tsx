import React, { useEffect, useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import TitleBar from 'frameless-titlebar';
import { remote } from 'electron';
import { UWProskomma } from 'uw-proskomma';
import fse from 'fs-extra';
import path from 'path';

import Footer from './footer';
import DocSets from './doc_sets';
import Browse from './browse';
import Search from './search';
import PkQuery from './pk_query';
import icon from '../assets/icons/48x48.ico';

const pk = new UWProskomma();
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
const currentWindow = remote.getCurrentWindow();

export default function App() {
  const [maximized, setMaximized] = useState(currentWindow.isMaximized());
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedDocSet, setSelectedDocSet] = useState('');
  const [selectedDocument, setSelectedDocument] = useState('');
  const [savedQueries, setSavedQueries] = React.useState([]);
  const [selectedBook, setSelectedBook] = React.useState('MRK');
  const [selectedChapter, setSelectedChapter] = React.useState('1');
  const [selectedVerse, setSelectedVerse] = React.useState('1');
  const [mutationCount, setMutationCount] = React.useState('0');
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

  useEffect(() => {
    const loadTranslations = async () => {
      for (const translationSource of translationSources) {
        pk.loadSuccinctDocSet(fse.readJsonSync(translationSource));
        setMutationCount(mutationCount + 1);
      }
    };
    const loadMappings = async () => {
      for (const query of mappingQueries) {
        await pk.gqlQuery(query);
        setMutationCount(mutationCount + 1);
      }
    };
    loadTranslations()
      .then(
        () => loadMappings()
      );
  }, []);

  const handleMaximize = () => {
    if (maximized) {
      currentWindow.restore();
    } else {
      currentWindow.maximize();
    }
  };

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
          <DocSets pk={pk} state={state} />
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
