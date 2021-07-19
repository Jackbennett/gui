import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

import { Help as HelpIcon, InfoOutlined as InfoIcon } from '@material-ui/icons';

import { setSnackbar } from '../../actions/appActions';
import { toggleHelptips } from '../../actions/userActions';
import { getDocsVersion } from '../../selectors';
import ConfigurationObject from '../common/configurationobject';

const actionCreators = { setSnackbar, toggleHelptips };
const mapStateToProps = (state, ownProps) => {
  let device = {};
  if (ownProps.deviceId) {
    device = state.devices.byId[ownProps.deviceId];
  }
  return {
    device,
    docsVersion: getDocsVersion(state)
  };
};

const HideHelptipsButton = ({ toggleHelptips }) => (
  <p>
    <a className="hidehelp" onClick={toggleHelptips}>
      Hide all help tips
    </a>
  </p>
);

const AuthExplainComponent = ({ docsVersion }) => (
  <div>
    <div id="auth-info" className="tooltip" style={{ right: 0, top: -70 }} data-tip data-for="auth-info-tip" data-event="click focus">
      <InfoIcon />
    </div>
    <ReactTooltip id="auth-info-tip" globalEventOff="click" place="left" type="light" effect="solid" className="react-tooltip">
      <h3>Device authorization status</h3>
      <p>
        Each device sends an authentication request containing its identity attributes and its current public key. You can accept, reject or dismiss these
        requests to determine the authorization status of the device.
      </p>
      <p>
        In cases such as key rotation, each device may have more than one identity/key combination listed. See the documentation for more on{' '}
        <a href={`https://docs.mender.io/${docsVersion}overview/device-authentication`} target="_blank" rel="noopener noreferrer">
          Device authentication
        </a>
        .
      </p>
    </ReactTooltip>
  </div>
);
export const AuthExplainButton = connect(mapStateToProps, actionCreators)(AuthExplainComponent);

const AuthButtonComponent = ({ docsVersion, highlightHelp, toggleHelptips }) => (
  <div>
    <div
      id="onboard-4"
      className={highlightHelp ? 'tooltip help highlight' : 'tooltip help'}
      data-tip
      data-for="auth-button-tip"
      data-event="click focus"
      style={{ left: '75%', top: 0 }}
    >
      <HelpIcon />
    </div>
    <ReactTooltip id="auth-button-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
      <div style={{ whiteSpace: 'normal' }}>
        <h3>Authorize devices</h3>
        <hr />
        <p>
          Expand this section to view the authentication options for this device. You can decide whether to accept it, reject it, or just dismiss this device
          for now.
        </p>
        <p>
          See the documentation for more on{' '}
          <a href={`https://docs.mender.io/${docsVersion}overview/device-authentication`} target="_blank" rel="noopener noreferrer">
            Device authentication
          </a>
          .
        </p>
        <HideHelptipsButton toggleHelptips={toggleHelptips} />
      </div>
    </ReactTooltip>
  </div>
);
export const AuthButton = connect(mapStateToProps, actionCreators)(AuthButtonComponent);

const AddGroupComponent = ({ toggleHelptips }) => (
  <div>
    <div id="onboard-5" className="tooltip help" data-tip data-for="groups-tip" data-event="click focus" style={{ bottom: '-10px' }}>
      <HelpIcon />
    </div>
    <ReactTooltip id="groups-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
      <h3>Device groups</h3>
      <hr />
      <p>
        It is possible to create groups of devices. Once you have created a group and added one or more devices to it, you can deploy an update to that specific
        group only.
      </p>
      <p>To avoid accidents, Mender only allows a device to be in one group at the time.</p>
      <p>
        You can find out additional information about device groups in <Link to="/help/devices">the help section</Link>.
      </p>
      <HideHelptipsButton toggleHelptips={toggleHelptips} />
    </ReactTooltip>
  </div>
);
export const AddGroup = connect(mapStateToProps, actionCreators)(AddGroupComponent);

const ExpandDeviceComponent = ({ docsVersion, toggleHelptips }) => (
  <div>
    <div id="onboard-6" className="tooltip help" data-tip data-for="expand-device-tip" data-event="click focus" style={{ left: 'inherit', right: '45px' }}>
      <HelpIcon />
    </div>
    <ReactTooltip id="expand-device-tip" globalEventOff="click" place="left" type="light" effect="solid" className="react-tooltip">
      <h3>Device inventory</h3>
      <hr />
      <p>
        Mender automatically collects identity and inventory information from connected devices. You can view this information by clicking on a device to expand
        the row.
      </p>
      <p>
        Which information is collected about devices is fully configurable;{' '}
        <a href={`https://docs.mender.io/${docsVersion}client-installation/identity`} target="_blank" rel="noopener noreferrer">
          see the documentation for how to configure this
        </a>
        .
      </p>
      <HideHelptipsButton toggleHelptips={toggleHelptips} />
    </ReactTooltip>
  </div>
);
export const ExpandDevice = connect(mapStateToProps, actionCreators)(ExpandDeviceComponent);

const ExpandArtifactComponent = ({ docsVersion, toggleHelptips }) => (
  <div>
    <div id="onboard-10" className="tooltip help" data-tip data-for="artifact-expand-tip" data-event="click focus">
      <HelpIcon />
    </div>
    <ReactTooltip id="artifact-expand-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
      <h3>Device type compatibility</h3>
      <hr />
      <p>
        Mender Artifacts have <b>Device types compatible</b> as part of their metadata. All devices report which device type they are, as part of their
        inventory information. During a deployment, Mender makes sure that a device will only download and install an Artifact it is compatible with.
      </p>
      <p>You can click on each Artifact in the Release to expand the row and view more information about it.</p>
      <p>
        For more information on how to specify the device type compatibility and other artifact metadata,{' '}
        <a href={`https://docs.mender.io/${docsVersion}artifact-creation/create-an-artifact`} target="_blank" rel="noopener noreferrer">
          see the documentation
        </a>
        .
      </p>
      <HideHelptipsButton toggleHelptips={toggleHelptips} />
    </ReactTooltip>
  </div>
);
export const ExpandArtifact = connect(mapStateToProps, actionCreators)(ExpandArtifactComponent);

const DeviceSupportTipComponent = ({ docsVersion }) => (
  <div>
    <div id="deb-package-help" className="tooltip help" data-tip data-for="deb-package-tip" data-event="click focus" style={{ top: '22%', left: '88%' }}>
      <HelpIcon />
    </div>
    <ReactTooltip id="deb-package-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
      <p>
        The steps in the guide should work on most operating systems in the Debian family (e.g. Debian, Ubuntu, Raspberry Pi OS) and devices based on ARMv6 or
        newer (e.g. Raspberry Pi 2/3/4, Beaglebone). Visit{' '}
        <a href={`https://docs.mender.io/${docsVersion}overview/device-support`} target="_blank" rel="noopener noreferrer">
          our documentation
        </a>
        for more information about device support.
      </p>
    </ReactTooltip>
  </div>
);

export const DeviceSupportTip = connect(mapStateToProps, actionCreators)(DeviceSupportTipComponent);

const ConfigureTimezoneTipComponent = ({ anchor, device, toggleHelptips }) => {
  if (!['qemux86-64', 'raspberry', 'rpi'].some(type => device.attributes?.device_type?.startsWith(type))) {
    return null;
  }
  return (
    <>
      <div id="config-timezone-help" className="fadeIn tooltip help" data-tip data-for="config-timezone-tip" data-event="click focus" style={anchor}>
        <HelpIcon />
      </div>
      <ReactTooltip id="config-timezone-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
        <>
          To see the effects of applying a configuration to your device you can set one of the below values to modify the timezone of your device. While all
          values from <i>timedatectl list-timezones</i> will work, to easily see the impact of the changed value you can use one of the following values:
          <ul>
            <li>Europe/Oslo</li>
            <li>America/Los_Angeles</li>
            <li>Asia/Tokyo</li>
          </ul>
          Once the configuration has been applied you can see the effect by opening the Remote Terminal to the device and executing the <i>date</i> command.
          <HideHelptipsButton toggleHelptips={toggleHelptips} />
        </>
      </ReactTooltip>
    </>
  );
};

export const ConfigureTimezoneTip = connect(mapStateToProps, actionCreators)(ConfigureTimezoneTipComponent);

const ConfigureRaspberryLedComponent = ({ anchor, device, setSnackbar, toggleHelptips }) => {
  if (!['raspberry', 'rpi'].some(type => device.attributes?.device_type?.startsWith(type))) {
    return null;
  }
  return (
    <>
      <div id="config-led-help" className="fadeIn tooltip help" data-tip data-for="config-led-tip" data-event="click focus" style={anchor}>
        <HelpIcon />
      </div>
      <ReactTooltip id="config-led-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
        <>
          To see the effects of applying a configuration to your device you can set one of the below values to modify the behaviour of your Raspberry Pi green
          status LED
          <ConfigurationObject
            className="react-tooltip margin-top-small margin-bottom-small"
            config={{
              mmc0: 'The default, which blinks the led on storage activity',
              on: 'Turn on the light permanently',
              off: 'Turn off the light permanently',
              heartbeat: 'Enable heartbeat blinking'
            }}
            compact
            setSnackbar={setSnackbar}
          />
          There are other possible values, but we won&apos;t advertise them here. See
          <a href="http://www.d3noob.org/2020/07/controlling-activity-led-on-raspberry-pi.html" target="_blank" rel="noopener noreferrer">
            this blog post
          </a>{' '}
          or{' '}
          <a href="https://www.raspberrypi.org/forums/viewtopic.php?t=273194#p1658930" target="_blank" rel="noopener noreferrer">
            in the Raspberry Pi forums
          </a>
          for more information.
          <HideHelptipsButton toggleHelptips={toggleHelptips} />
        </>
      </ReactTooltip>
    </>
  );
};

export const ConfigureRaspberryLedTip = connect(mapStateToProps, actionCreators)(ConfigureRaspberryLedComponent);

const ConfigureAddOnTipComponent = ({ docsVersion }) => (
  <div>
    <div
      id="configure-add-on-help"
      className="tooltip help"
      data-tip
      data-for="configure-add-on-help-tip"
      data-event="click focus"
      style={{ top: '10%', left: '75%' }}
    >
      <HelpIcon />
    </div>
    <ReactTooltip id="configure-add-on-help-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
      <p>
        Mender deploys the configuration attributes using the same mechanisms as software updates. The configuration is stored as a JSON file at
        <code>/var/lib/mender-configure/device-config.json</code> on the device and then all the scripts in{' '}
        <code>/usr/lib/mender-configure/apply-device-config.d/</code> are executed to apply the configuration attributes. To add a new configuration attribute,
        you simply need to input it in the UI and add a script to that directory that applies it accordingly. Read more about how it works in the{' '}
        <a href={`https://docs.mender.io/${docsVersion}add-ons/configure`} target="_blank" rel="noopener noreferrer">
          Configure documentation
        </a>
        .
      </p>
    </ReactTooltip>
  </div>
);

export const ConfigureAddOnTip = connect(mapStateToProps, actionCreators)(ConfigureAddOnTipComponent);

export const NameTagTip = () => (
  <div>
    <div id="name-tag-help" className="tooltip help" data-tip data-for="name-tag-tip" data-event="click focus" style={{ top: '15%', left: '85%' }}>
      <HelpIcon />
    </div>
    <ReactTooltip id="name-tag-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
      <p>
        The <i>name</i> tag will be available as a device indentifier too.
      </p>
    </ReactTooltip>
  </div>
);
