import React, { useState } from 'react';

import { ClickAwayListener, Tooltip, withStyles } from '@material-ui/core';

import theme, { colors } from '../../themes/mender-theme';

export const MenderTooltip = withStyles({
  arrow: {
    color: theme.palette.secondary.main
  },
  tooltip: {
    backgroundColor: theme.palette.secondary.main,
    boxShadow: theme.shadows[1],
    color: colors.tooltipText,
    fontSize: 'small',
    maxWidth: 600,
    info: {
      maxWidth: 300,
      color: colors.mutedText,
      backgroundColor: colors.placeholder
    }
  }
})(Tooltip);

export const MenderTooltipClickable = ({ children, onboarding, startOpen = false, ...remainingProps }) => {
  const [open, setOpen] = useState(startOpen || false);

  const toggle = () => setOpen(!open);

  const hide = () => setOpen(false);

  const Component = onboarding ? OnboardingTooltip : MenderTooltip;
  const extraProps = onboarding
    ? {
        PopperProps: {
          disablePortal: true,
          popperOptions: {
            positionFixed: true,
            modifiers: { preventOverflow: { boundariesElement: 'window' } }
          }
        }
      }
    : {};
  return (
    <ClickAwayListener onClickAway={hide}>
      <Component
        arrow={!onboarding}
        interactive
        open={open}
        disableFocusListener
        disableHoverListener
        disableTouchListener
        onOpen={() => setOpen(true)}
        {...extraProps}
        {...remainingProps}
      >
        <div onClick={toggle}>{children}</div>
      </Component>
    </ClickAwayListener>
  );
};

const iconWidth = 30;

export const OnboardingTooltip = withStyles({
  arrow: {
    color: theme.palette.primary.main
  },
  tooltip: {
    backgroundColor: theme.palette.primary.main,
    boxShadow: theme.shadows[1],
    color: colors.placeholder,
    fontSize: 14,
    maxWidth: 350,
    padding: '12px 18px',
    width: 350,
    '& a': {
      color: colors.placeholder
    },
    '&.MuiTooltip-tooltipPlacementTop': { marginLeft: iconWidth, marginBottom: 0, marginTop: iconWidth + theme.spacing(1.5) },
    '&.MuiTooltip-tooltipPlacementRight': { marginTop: iconWidth / 2 },
    '&.MuiTooltip-tooltipPlacementBottom': { marginLeft: iconWidth },
    '&.MuiTooltip-tooltipPlacementLeft': { marginTop: iconWidth / 2 }
  },
  popper: {
    opacity: 0.9
  }
})(Tooltip);
export default MenderTooltip;
