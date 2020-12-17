import React, { Fragment, useState, useEffect } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import TitleBar from 'frameless-titlebar';
import { remote } from 'electron';
import { ProsKomma } from 'proskomma';

import Footer from './footer';
import Home from './home';
import Import from './import';
import icon from '../assets/icons/48x48.ico'

const pk = new ProsKomma();
const currentWindow = remote.getCurrentWindow();

export default function App() {
  const [maximized, setMaximized] = useState(currentWindow.isMaximized());
  useEffect(() => {
    const onMaximized = () => setMaximized(true);
    const onRestore = () => setMaximized(false);
    currentWindow.on("maximize", onMaximized);
    currentWindow.on("unmaximize", onRestore);
    return () => {
      currentWindow.removeListener("maximize", onMaximized);
      currentWindow.removeListener("unmaximize", onRestore);
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
    <>
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
      <Tabs defaultFocus className="top_tabs">
        <TabList>
          <Tab>Home</Tab>
          <Tab>Import</Tab>
          <Tab>Browse</Tab>
          <Tab>Search</Tab>
          <Tab>Export</Tab>
        </TabList>
        <TabPanel>
          <Home pk={pk} />
        </TabPanel>
        <TabPanel>
          <Import />
        </TabPanel>
        <TabPanel>
          <div className="content">Browse Not Implemented</div>
        </TabPanel>
        <TabPanel>
          <div className="content">Search Not Implemented</div>
        </TabPanel>
        <TabPanel>
          <div className="content">Export Not Implemented</div>
        </TabPanel>
      </Tabs>
      <Footer />
    </>
  );
}
