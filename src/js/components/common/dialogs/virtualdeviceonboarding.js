import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { setOnboardingApproach } from '../../../actions/onboardingActions';
import { getDemoDeviceCreationCommand } from '../../../helpers';
import { getDocsVersion } from '../../../selectors';
import CopyCode from '../copy-code';

export const VirtualDeviceOnboarding = ({ docsVersion, isHosted, setOnboardingApproach, token }) => {
  useEffect(() => {
    setOnboardingApproach('virtual');
  }, []);

  const codeToCopy = getDemoDeviceCreationCommand(token);

  return (
    <div>
      {isHosted ? (
        <div>
          <b>1. Get Docker Engine</b>
          <p>If you do not have it already, please install Docker on your local machine.</p>
          <p>
            For example if you are using Ubuntu follow this tutorial:{' '}
            <a href="https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/" target="_blank" rel="noopener noreferrer">
              https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/
            </a>
          </p>
        </div>
      ) : (
        <div>
          <b>1. Prerequisites</b>
          <p>
            As you are running Mender on-premise, for these instructions we assume that you already have Docker installed and the Mender integration environment
            up and running on your machine.
          </p>
          <p>To start a virtual device, change directory into the folder where you cloned Mender integration.</p>
        </div>
      )}
      <p>
        <b>2. Copy & paste and run the following command to start the virtual device:</b>
      </p>
      <CopyCode code={codeToCopy} withDescription={true} />
      <p>The device should appear in the Pending devices view in a couple of minutes.</p>
      <p>
        Visit{' '}
        <a href={`https://docs.mender.io/${docsVersion}get-started/preparation/prepare-a-virtual-device`} target="_blank" rel="noopener noreferrer">
          our documentation
        </a>{' '}
        for more information on managing the virtual device.
      </p>
    </div>
  );
};

const actionCreators = { setOnboardingApproach };

const mapStateToProps = state => {
  return {
    docsVersion: getDocsVersion(state),
    isHosted: state.app.features.isHosted,
    token: state.organization.organization.tenant_token
  };
};

export default connect(mapStateToProps, actionCreators)(VirtualDeviceOnboarding);
