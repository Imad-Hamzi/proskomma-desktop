import React from 'react';

import BrowseModeSwitcher from './browse_mode_switcher';
import BrowseVerse from './browse_verse';
import BrowseChapter from './browse_chapter';
import BrowseBlocks from './browse_blocks';

const Browse = (props) => {
  const [renderMode, setRenderMode] = React.useState('verse');
  let browseView;
  switch (renderMode) {
    case 'verse':
      browseView = <BrowseVerse pk={props.pk} state={props.state}/>;
      break;
    case 'chapter':
      browseView = <BrowseChapter pk={props.pk} state={props.state}/>;
      break;
    case 'blocks':
      browseView = <BrowseBlocks pk={props.pk} state={props.state}/>;
      break;
    default:
      throw new Error(`Unknown renderMode '${renderMode}'`);
  }
  return (
    <div className="content scrollableTabPanel">
      <div>
        <BrowseModeSwitcher
          renderMode={renderMode}
          setRenderMode={setRenderMode}
        />
        {browseView}
      </div>
    </div>
  );
};

export default Browse;
