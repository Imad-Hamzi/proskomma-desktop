import React, {useEffect, useState} from 'react';
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import TitleBar from 'frameless-titlebar';
import {remote} from 'electron';
import {Proskomma} from 'proskomma';
import fse from 'fs-extra';
import path from 'path';

import Footer from './footer';
import Home from './home';
// import Import from './import';
import icon from '../assets/icons/48x48.ico';

const pk = new Proskomma();
let timeToLoad = Date.now();
pk.loadSuccinctDocSet(fse.readJsonSync(path.resolve(__dirname, '../data/ult_nt.json')));
timeToLoad = Date.now() - timeToLoad;
const currentWindow = remote.getCurrentWindow();

export default function App() {
  const [maximized, setMaximized] = useState(currentWindow.isMaximized());
  const [tabIndex, setTabIndex] = useState(0);
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

  return (
    <React.Fragment>
      <TitleBar
        title="Proskomma Desktop"
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
        onSelect={index => setTabIndex(index)}
        className="top_tabs"
      >
        <TabList>
          <Tab>Home</Tab>
          <Tab>Browse</Tab>
          <Tab>Search</Tab>
        </TabList>
        <TabPanel>
          <Home pk={pk} timeToLoad={timeToLoad} setTabIndex={setTabIndex}/>
        </TabPanel>
        <TabPanel>
          <div className="content">Browse Not Implemented</div>
        </TabPanel>
        <TabPanel>
          <div className="content">Search Not Implemented</div>
        </TabPanel>
      </Tabs>
      <Footer/>
    </React.Fragment>
  )
    ;
}
