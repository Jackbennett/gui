import React, { useEffect, useRef, useState } from 'react';

// material ui
import { Divider, ListItem, ListItemText, Tooltip } from '@material-ui/core';

import { FileCopyOutlined as CopyToClipboardIcon } from '@material-ui/icons';

import copy from 'copy-to-clipboard';

const defaultClasses = { root: 'attributes' };

export const ExpandableAttribute = ({
  copyToClipboard,
  dividerDisabled,
  primary,
  secondary,
  secondaryTypographyProps = {},
  setSnackbar,
  style,
  textClasses
}) => {
  const textContent = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowActive, setOverflowActive] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    if (textContent.current) {
      const overflowActiveCurrently =
        textContent.current.scrollWidth > textContent.current.clientWidth || textContent.current.scrollHeight > textContent.current.clientHeight;
      if (overflowActive !== overflowActiveCurrently && !expanded) {
        setOverflowActive(overflowActiveCurrently);
      }
    }
  }, [textContent]);

  const onClick = () => {
    if (copyToClipboard) {
      // Date/Time components
      if (secondary.props && secondary.props.value) {
        copy(secondary.props.value);
      } else {
        copy(secondary);
      }
      setSnackbar('Value copied to clipboard');
    }
    setExpanded(!expanded);
  };

  const currentTextClasses = `${textClasses ? textClasses.secondary : 'inventory-text'}${expanded && overflowActive ? ' expanded-attribute' : ''}`;
  const secondaryText = (
    <div>
      <span className={currentTextClasses} ref={textContent} style={overflowActive ? { marginBottom: '-0.5em' } : {}}>
        {secondary}
      </span>{' '}
      {overflowActive ? <a>show {expanded ? 'less' : 'more'}</a> : null}
    </div>
  );

  const cssClasses = { ...defaultClasses, root: `${defaultClasses.root} ${copyToClipboard ? 'copy-to-clipboard' : ''}`.trim() };

  return (
    <div onClick={onClick} onMouseEnter={() => setTooltipVisible(true)} onMouseLeave={() => setTooltipVisible(false)} style={style}>
      <ListItem classes={cssClasses} disabled={true}>
        <ListItemText
          primary={primary}
          secondary={secondaryText}
          secondaryTypographyProps={{ title: secondary, component: 'div', ...secondaryTypographyProps }}
        />
        {copyToClipboard ? (
          <Tooltip title={'Copy to clipboard'} placement="top" open={tooltipVisible}>
            <CopyToClipboardIcon fontSize="small"></CopyToClipboardIcon>
          </Tooltip>
        ) : null}
      </ListItem>
      {dividerDisabled ? null : <Divider />}
    </div>
  );
};

export default ExpandableAttribute;
