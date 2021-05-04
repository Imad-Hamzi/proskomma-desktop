import React from 'react';

const AlignedToken = (props) => {
  const tokenLemma = scopes => {
    const lemmaScopes = scopes.filter(s => s.startsWith('attribute/milestone/zaln/x-lemma/0') || s.startsWith('attribute/spanWithAtts/w/lemma/0'));
    if (lemmaScopes.length > 0) {
      return lemmaScopes[0].split('/').reverse()[0];
    } else {
      return null;
    }
  };

  const tl = tokenLemma(props.token.scopes);
  const oc = () => { props.setLemma(tl) };
  if (tl && (tl === props.lemma)) {
    return <span onClick={oc} style={{backgroundColor: 'yellow'}}>{props.token.payload}</span>;
  } else {
    return <span onClick={oc}>{props.token.payload}</span>;
  };
};

export default AlignedToken;
