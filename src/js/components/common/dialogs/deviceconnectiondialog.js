import React, { useState } from 'react';
import { connect } from 'react-redux';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

import docker from '../../../../assets/img/docker.png';
import raspberryPi from '../../../../assets/img/raspberrypi.png';
import raspberryPi4 from '../../../../assets/img/raspberrypi4.jpg';

import { advanceOnboarding } from '../../../actions/onboardingActions';
import { onboardingSteps } from '../../../constants/onboardingConstants';
import { getDocsVersion, getTenantCapabilities } from '../../../selectors';
import theme from '../../../themes/mender-theme';
import { DeviceSupportTip } from '../../helptips/helptooltips';

import PhysicalDeviceOnboarding from './physicaldeviceonboarding';
import VirtualDeviceOnboarding from './virtualdeviceonboarding';

const DeviceConnectionExplainer = ({ docsVersion, hasMonitor, setOnDevice, setVirtualDevice }) => (
  <>
    <p>
      You can connect almost any device and Linux OS with Mender, but to make things simple during evaluation we recommend you use a Raspberry Pi as a test
      device.
    </p>
    <div className="padding-small padding-top-none rpi-quickstart">
      <h3>Raspberry Pi quick start</h3>
      <p>We&apos;ll walk you through the steps to connect a Raspberry Pi and deploy your first update with Mender.</p>
      <div className="flexbox column centered">
        <div className="flexbox centered os-list">
          {[raspberryPi, raspberryPi4].map((tile, index) => (
            <img key={`tile-${index}`} src={tile} />
          ))}
        </div>
        <Button variant="contained" color="secondary" onClick={() => setOnDevice(true)}>
          Get Started
        </Button>
      </div>
    </div>
    <div className="two-columns margin-top">
      <div className="padding-small padding-top-none">
        <div className="flexbox center-aligned">
          <h3>Use a virtual device</h3>
          <img src={docker} style={{ height: 40, marginLeft: theme.spacing(2) }} />
        </div>
        <p className="margin-top-none">Don&apos;t have a Raspberry Pi?</p>
        <p>You can use our Docker-run virtual device to go through the same tutorial.</p>
        {hasMonitor && (
          <p className="info slightly-smaller">
            If you want to evaluate our commercial components such as mender-monitor, please use a physical device instead as the virtual client does not
            support these components at this time.
          </p>
        )}
        <a onClick={() => setVirtualDevice(true)}>Try a virtual device</a>
      </div>
      <div className="padding-small padding-top-none">
        <h3>Other devices</h3>
        <div>See the documentation to integrate the following with Mender:</div>
        <ul>
          {[
            { key: 'debian', target: `https://docs.mender.io/${docsVersion}system-updates-debian-family`, title: 'Debian family' },
            { key: 'yocto', target: `https://docs.mender.io/${docsVersion}system-updates-yocto-project`, title: 'Yocto OSes' }
          ].map(item => (
            <li key={item.key}>
              <a href={item.target} target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>
            </li>
          ))}
        </ul>
        Or visit{' '}
        <a href="https://hub.mender.io/c/board-integrations" target="_blank" rel="noopener noreferrer">
          Mender Hub
        </a>{' '}
        and search integrations for your device and OS.
      </div>
    </div>
    <DeviceSupportTip />
  </>
);

export const DeviceConnectionDialog = ({ advanceOnboarding, docsVersion, hasMonitor, onboardingDeviceType, onboardingComplete, onCancel, pendingCount }) => {
  const [onDevice, setOnDevice] = useState(false);
  const [progress, setProgress] = useState(1);
  const [virtualDevice, setVirtualDevice] = useState(false);

  const onBackClick = () => {
    let updatedProgress = progress - 1;
    if (!updatedProgress) {
      updatedProgress = 1;
      setOnDevice(false);
      setVirtualDevice(false);
    }
    setProgress(updatedProgress);
  };

  const onAdvance = () => {
    advanceOnboarding(onboardingSteps.DASHBOARD_ONBOARDING_START);
    setProgress(progress + 1);
  };

  let content = <DeviceConnectionExplainer docsVersion={docsVersion} hasMonitor={hasMonitor} setOnDevice={setOnDevice} setVirtualDevice={setVirtualDevice} />;
  if (onDevice) {
    content = <PhysicalDeviceOnboarding progress={progress} />;
  } else if (virtualDevice) {
    content = <VirtualDeviceOnboarding />;
  }

  if (pendingCount && !onboardingComplete) {
    setTimeout(onCancel, 2000);
  }
  if (progress >= 2 && pendingCount && !window.location.hash.includes('pending')) {
    advanceOnboarding(onboardingSteps.DASHBOARD_ONBOARDING_START);
    window.location.replace('#/devices/pending');
  }

  return (
    <Dialog open={true} fullWidth={true} maxWidth="sm">
      <DialogTitle>Connecting a device</DialogTitle>
      <DialogContent className="onboard-dialog" style={{ margin: '0 30px' }}>
        {content}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <div style={{ flexGrow: 1 }} />
        {(onDevice || virtualDevice) && (
          <div>
            <Button onClick={onBackClick}>Back</Button>
            {progress < 2 && (!virtualDevice || progress < 1) ? (
              <Button variant="contained" disabled={!(virtualDevice || (onDevice && onboardingDeviceType))} onClick={onAdvance}>
                Next
              </Button>
            ) : (
              <Button variant="contained" disabled={!onboardingComplete} onClick={onCancel}>
                {onboardingComplete ? 'Close' : 'Waiting for device'}
              </Button>
            )}
          </div>
        )}
      </DialogActions>
    </Dialog>
  );
};

const actionCreators = { advanceOnboarding };

const mapStateToProps = state => {
  return {
    docsVersion: getDocsVersion(state),
    hasMonitor: getTenantCapabilities(state).hasMonitor,
    pendingCount: state.devices.byStatus.pending.total,
    onboardingComplete: state.onboarding.complete,
    onboardingDeviceType: state.onboarding.deviceType
  };
};

export default connect(mapStateToProps, actionCreators)(DeviceConnectionDialog);
