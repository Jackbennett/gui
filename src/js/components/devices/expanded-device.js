import React, { useState } from 'react';
import { connect } from 'react-redux';
import copy from 'copy-to-clipboard';

import { Button, Divider, Drawer } from '@material-ui/core';
import { Link as LinkIcon, Replay as ReplayIcon } from '@material-ui/icons';

import { setSnackbar } from '../../actions/appActions';
import { abortDeployment, getDeviceLog, getSingleDeployment } from '../../actions/deploymentActions';
import { applyDeviceConfig, decommissionDevice, setDeviceConfig } from '../../actions/deviceActions';
import { saveGlobalSettings } from '../../actions/userActions';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import { versionCompare } from '../../helpers';
import ForwardingLink from '../common/forwardlink';
import RelativeTime from '../common/relative-time';
import { getDocsVersion, getTenantCapabilities } from '../../selectors';
import theme from '../../themes/mender-theme';
import Tracking from '../../tracking';
import TroubleshootDialog from './troubleshootdialog';
import AuthStatus from './device-details/authstatus';
import DeviceConfiguration from './device-details/configuration';
import DeviceInventory from './device-details/deviceinventory';
import DeviceIdentity from './device-details/identity';
import DeviceConnection from './device-details/connection';
import InstalledSoftware from './device-details/installedsoftware';

export const ExpandedDevice = ({
  abortDeployment,
  applyDeviceConfig,
  decommissionDevice,
  defaultConfig,
  device,
  deviceConfigDeployment,
  docsVersion,
  getDeviceLog,
  getSingleDeployment,
  hasDeviceConfig,
  hasDeviceConnect,
  hasFileTransfer,
  onClose,
  open,
  refreshDevices,
  saveGlobalSettings,
  setDeviceConfig,
  setSnackbar,
  showHelptips
}) => {
  const { status = DEVICE_STATES.accepted } = device;

  const [socketClosed, setSocketClosed] = useState(true);
  const [troubleshootType, setTroubleshootType] = useState();

  const onDecommissionDevice = device_id => {
    // close dialog!
    // close expanded device
    // trigger reset of list!
    return decommissionDevice(device_id).finally(() => refreshDevices(true));
  };

  const launchTroubleshoot = type => {
    Tracking.event({ category: 'devices', action: 'open_terminal' });
    setSocketClosed(false);
    setTroubleshootType(type);
  };

  const copyLinkToClipboard = () => {
    const location = window.location.href.substring(0, window.location.href.indexOf('/devices') + '/devices'.length);
    copy(`${location}?id=${device.id}`);
    setSnackbar('Link copied to clipboard');
  };

  const deviceIdentifier = device?.attributes?.name ?? device?.id ?? '-';
  return (
    <Drawer anchor="right" className="expandedDevice" open={open} onClose={onClose} PaperProps={{ style: { minWidth: '67vw' } }}>
      <div className="flexbox margin-top margin-bottom-small" style={{ alignItems: 'center' }}>
        <b>Device information for {deviceIdentifier}</b>
        <div className="muted margin-left margin-right">
          Last check-in: <RelativeTime className="muted" updateTime={device.updated_ts} />
        </div>
        <Button onClick={copyLinkToClipboard} startIcon={<LinkIcon />} size="small">
          Copy link to this device
        </Button>
      </div>
      <Divider />
      <DeviceIdentity device={device} setSnackbar={setSnackbar} />
      <AuthStatus device={device} decommission={onDecommissionDevice} showHelptips={showHelptips} />
      {hasDeviceConfig && [DEVICE_STATES.accepted, DEVICE_STATES.preauth].includes(status) && (
        <DeviceConfiguration
          abortDeployment={abortDeployment}
          applyDeviceConfig={applyDeviceConfig}
          defaultConfig={defaultConfig}
          deployment={deviceConfigDeployment}
          device={device}
          getDeviceLog={getDeviceLog}
          getSingleDeployment={getSingleDeployment}
          saveGlobalSettings={saveGlobalSettings}
          setDeviceConfig={setDeviceConfig}
          showHelptips={showHelptips}
        />
      )}
      {status === DEVICE_STATES.accepted && (
        <>
          <InstalledSoftware device={device} docsVersion={docsVersion} setSnackbar={setSnackbar} />
          <DeviceInventory device={device} docsVersion={docsVersion} setSnackbar={setSnackbar} />
        </>
      )}
      <Divider style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(2) }} />
      <div className="flexbox" style={{ alignItems: 'center' }}>
        {status === DEVICE_STATES.accepted && hasDeviceConnect && (
          <DeviceConnection
            device={device}
            docsVersion={docsVersion}
            hasFileTransfer={hasFileTransfer}
            startTroubleshoot={launchTroubleshoot}
            socketClosed={socketClosed}
            style={{ marginRight: theme.spacing(2) }}
          />
        )}
        <Button to={`/deployments?open=true&deviceId=${device.id}`} component={ForwardingLink} startIcon={<ReplayIcon />}>
          Create a deployment for this device
        </Button>
      </div>
      <TroubleshootDialog
        deviceId={device.id}
        hasFileTransfer={hasFileTransfer}
        open={Boolean(troubleshootType)}
        onCancel={() => setTroubleshootType()}
        onSocketClose={() => setTimeout(() => setSocketClosed(true), 5000)}
        setSocketClosed={setSocketClosed}
        type={troubleshootType}
      />
    </Drawer>
  );
};

const actionCreators = {
  abortDeployment,
  applyDeviceConfig,
  decommissionDevice,
  getDeviceLog,
  getSingleDeployment,
  saveGlobalSettings,
  setDeviceConfig,
  setSnackbar
};

const mapStateToProps = (state, ownProps) => {
  const { hasDeviceConfig, hasDeviceConnect } = getTenantCapabilities(state);
  const device = state.devices.byId[ownProps.deviceId] || {};
  const { config = {} } = device;
  const { deployment_id: configDeploymentId } = config;
  return {
    defaultConfig: state.users.globalSettings.defaultDeviceConfig,
    device,
    deviceConfigDeployment: state.deployments.byId[configDeploymentId] || {},
    docsVersion: getDocsVersion(state),
    hasDeviceConnect,
    hasDeviceConfig,
    hasFileTransfer: versionCompare(state.app.versionInformation.Integration, '2.7.0') > -1,
    onboardingComplete: state.onboarding.complete,
    showHelptips: state.users.showHelptips
  };
};

export default connect(mapStateToProps, actionCreators)(ExpandedDevice);
