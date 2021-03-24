import React, { useState } from 'react';
import { connect } from 'react-redux';
import pluralize from 'pluralize';

// material ui
import { Button } from '@material-ui/core';
import { InfoOutlined as InfoIcon } from '@material-ui/icons';

import { deleteAuthset, getDeviceAuth, updateDeviceAuth } from '../../../../actions/deviceActions';
import { DEVICE_STATES } from '../../../../constants/deviceConstants';
import { getLimitMaxed } from '../../../../selectors';
import theme from '../../../../themes/mender-theme';
import Confirm from './../../../common/confirm';
import Authsetlist from './authsetlist';

export const Authsets = ({ decommission, deleteAuthset, device, getDeviceAuth, limitMaxed, showHelptips, updateDeviceAuth }) => {
  const [confirmDecommission, setConfirmDecomission] = useState(false);
  const [loading, setLoading] = useState(false);
  const { auth_sets = [], status = DEVICE_STATES.accepted } = device;

  const updateDeviceAuthStatus = (device_id, auth_id, status) => {
    setLoading(auth_id);
    let changeRequest;
    if (status === 'dismiss') {
      changeRequest = deleteAuthset(device_id, auth_id);
    } else {
      // call API to update authset
      changeRequest = updateDeviceAuth(device_id, auth_id, status);
    }
    return (
      changeRequest
        // refresh authset list
        .then(() => getDeviceAuth(device_id))
        // on finish, change "loading" back to null
        .finally(() => setLoading(null))
    );
  };

  return (
    <div style={{ minWidth: 900, marginBottom: theme.spacing(2) }}>
      {status === DEVICE_STATES.pending ? `Authorization ${pluralize('request', auth_sets.length)}` : 'Authorization sets'}
      <Authsetlist
        limitMaxed={limitMaxed}
        total={auth_sets.length}
        confirm={updateDeviceAuthStatus}
        loading={loading}
        device={device}
        showHelptips={showHelptips}
      />
      {limitMaxed && (
        <div className="warning">
          <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
          You have reached your limit of authorized devices.
          <p>
            Contact us by email at <a href="mailto:support@mender.io">support@mender.io</a> to request a higher limit.
          </p>
        </div>
      )}
      {(device.status === DEVICE_STATES.accepted || device.status === DEVICE_STATES.rejected) && (
        <div className="flexbox" style={{ justifyContent: 'flex-end', marginTop: theme.spacing(2) }}>
          {confirmDecommission ? (
            <Confirm action={() => decommission(device.id)} cancel={() => setConfirmDecomission(false)} type="decommissioning" />
          ) : (
            <Button color="secondary" onClick={setConfirmDecomission}>
              Decommission device
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
const actionCreators = { deleteAuthset, getDeviceAuth, updateDeviceAuth };

const mapStateToProps = (state, ownProps) => {
  const device = state.devices.byId[ownProps.device.id] || {};
  return {
    device,
    limitMaxed: getLimitMaxed(state)
  };
};

export default connect(mapStateToProps, actionCreators)(Authsets);
