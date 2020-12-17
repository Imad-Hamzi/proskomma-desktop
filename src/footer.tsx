import React from 'react';
import { shell } from "electron";

const Footer = () => {
  return (
    <footer>
      <div className="footer_content">
        {'Part of the '}
        <button
          type="button"
          className="footer_inline_link"
          onClick={() => shell.openExternal('http://doc.proskomma.bible')}
        >
          Proskomma
        </button>
        {' open-source project, curated by '}
        <button
          type="button"
          className="footer_inline_link"
          onClick={() => shell.openExternal('http://mvh.bible')}
        >
          MVH Solutions
        </button>
        .
      </div>
    </footer>
  );
};

export default Footer;
