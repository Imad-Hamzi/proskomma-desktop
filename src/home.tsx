import React from 'react';

const Home = (props) => {
  return (
    <div className="content">
      <div><i>Click in Window, then F12, to Toggle Dev Tools (Scary Output to the Right)!</i></div>
      <h3>Status</h3>
      <div>
        Using '{props.pk.processor()}
        {'\' Version '}
        {props.pk.packageVersion()}.
      </div>
      <div>
        {props.pk.nDocSets()}
        {' Doc Set'}
        {props.pk.nDocSets() === 1 ? "" : "s"}
        {' Containing '}
        {props.pk.nDocuments()}
        {' Document'}
        {props.pk.nDocuments() === 1 ? "" : "s"}.
      </div>
    </div>
  );
};

export default Home;
