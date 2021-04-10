import React from 'react';

const renderVersesItems = items => items.filter(
  i =>
    i.type !== 'graft' &&
    i.subType !== 'end'
    && (i.subType !== 'start' || i.payload.startsWith('verses'))
).map(
  i =>
    i.type === 'scope' ? [<b>{i.payload.split('/')[1]}</b>, ' '] : i.payload
)

export { renderVersesItems };
