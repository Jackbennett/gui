import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { defaultState } from '../../../tests/mockData';

import { abortDeployment, createDeployment, getDeployments, getDeploymentsByStatus, getDeviceLog, selectDeployment } from './deploymentActions';
import AppConstants from '../constants/appConstants';
import DeploymentConstants from '../constants/deploymentConstants';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const createdDeployment = {
  ...defaultState.deployments.byId.d1,
  id: 'created-123'
};

const defaultResponseActions = {
  creation: {
    type: DeploymentConstants.CREATE_DEPLOYMENT,
    deployment: { devices: [{ id: Object.keys(defaultState.devices.byId)[0], status: 'pending' }], stats: {} },
    deploymentId: createdDeployment.id
  },
  log: {
    type: DeploymentConstants.RECEIVE_DEPLOYMENT_DEVICE_LOG,
    deploymentId: Object.keys(defaultState.deployments.byId)[0],
    devices: {
      ...defaultState.deployments.byId.d1.devices,
      a1: {
        ...defaultState.deployments.byId.d1.devices.a1,
        log: 'test'
      }
    }
  },
  snackbar: {
    type: AppConstants.SET_SNACKBAR,
    snackbar: {
      maxWidth: '900px',
      message: 'Deployment created successfully',
      open: true
    }
  },
  receive: {
    type: DeploymentConstants.RECEIVE_DEPLOYMENT,
    deployment: createdDeployment
  },
  receiveInprogress: { type: DeploymentConstants.RECEIVE_INPROGRESS_DEPLOYMENTS, deploymentIds: [], deployments: {}, status: 'inprogress', total: 0 },
  remove: { type: DeploymentConstants.REMOVE_DEPLOYMENT, deploymentId: defaultState.deployments.byId.d1.id },
  select: {
    type: DeploymentConstants.SELECT_DEPLOYMENT,
    deploymentId: createdDeployment.id
  },
  selectMultiple: {
    type: DeploymentConstants.SELECT_INPROGRESS_DEPLOYMENTS,
    deploymentIds: Object.keys(defaultState.deployments.byId),
    status: 'inprogress'
  },
  stats: {
    type: DeploymentConstants.RECEIVE_DEPLOYMENT_STATS,
    stats: {},
    deploymentId: createdDeployment.id
  }
};

describe('abortDeployment', () => {
  const store = mockStore({ ...defaultState });
  it('should allow aborting deployments', async () => {
    const expectedActions = [
      defaultResponseActions.receiveInprogress,
      defaultResponseActions.remove,
      {
        ...defaultResponseActions.snackbar,
        snackbar: {
          ...defaultResponseActions.snackbar.snackbar,
          message: 'The deployment was successfully aborted'
        }
      }
    ];
    return store.dispatch(abortDeployment(defaultState.deployments.byId.d1.id)).then(() => {
      const storeActions = store.getActions();
      expect(storeActions.length).toEqual(expectedActions.length);
      expectedActions.map((action, index) => Object.keys(action).map(key => expect(action[key]).toEqual(storeActions[index][key])));
    });
  });
  it(`should reject aborting deployments that don't exist`, async () => {
    const abortedDeployment = store.dispatch(abortDeployment(`${defaultState.deployments.byId.d1.id}-invalid`));
    expect(typeof abortedDeployment === Promise);
    expect(abortedDeployment).rejects.toBeTruthy();
  });
});

describe('createDeployment', () => {
  it('should allow creating deployments without filter or group', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      defaultResponseActions.creation,
      {
        ...defaultResponseActions.snackbar,
        snackbar: {
          ...defaultResponseActions.snackbar.snackbar,
          autoHideDuration: 8000
        }
      },
      defaultResponseActions.receive,
      defaultResponseActions.stats
    ];
    return store.dispatch(createDeployment({ devices: [Object.keys(defaultState.devices.byId)[0]] })).then(() => {
      const storeActions = store.getActions();
      expect(storeActions.length).toEqual(expectedActions.length);
      expectedActions.map((action, index) => Object.keys(action).map(key => expect(action[key]).toEqual(storeActions[index][key])));
    });
  });
  it('should allow creating deployments with a filter', async () => {
    const store = mockStore({ ...defaultState });
    const filter_id = '1234';
    const expectedActions = [
      { ...defaultResponseActions.creation, deployment: { devices: [], filter_id, stats: {} } },
      {
        ...defaultResponseActions.snackbar,
        snackbar: {
          ...defaultResponseActions.snackbar.snackbar,
          autoHideDuration: 8000
        }
      },
      defaultResponseActions.receive,
      defaultResponseActions.stats
    ];
    return store.dispatch(createDeployment({ filter_id })).then(() => {
      const storeActions = store.getActions();
      expect(storeActions.length).toEqual(expectedActions.length);
      expectedActions.map((action, index) => Object.keys(action).map(key => expect(action[key]).toEqual(storeActions[index][key])));
    });
  });
  it('should allow creating deployments with a group', async () => {
    const store = mockStore({ ...defaultState });
    const group = Object.keys(defaultState.devices.groups.byId)[0];
    const expectedActions = [
      { ...defaultResponseActions.creation, deployment: { devices: [], group, stats: {} } },
      {
        ...defaultResponseActions.snackbar,
        snackbar: {
          ...defaultResponseActions.snackbar.snackbar,
          autoHideDuration: 8000
        }
      },
      defaultResponseActions.receive,
      defaultResponseActions.stats
    ];
    return store.dispatch(createDeployment({ group })).then(() => {
      const storeActions = store.getActions();
      expect(storeActions.length).toEqual(expectedActions.length);
      expectedActions.map((action, index) => Object.keys(action).map(key => expect(action[key]).toEqual(storeActions[index][key])));
    });
  });
});

describe('getDeploymentsByStatus', () => {
  const store = mockStore({ ...defaultState });
  it('should allow deployments retrieval', async () => {
    const expectedActions = [
      {
        ...defaultResponseActions.receiveInprogress,
        deployments: defaultState.deployments.byId,
        deploymentIds: Object.keys(defaultState.deployments.byId),
        total: Object.keys(defaultState.deployments.byId).length
      },
      defaultResponseActions.selectMultiple,
      { ...defaultResponseActions.stats, deploymentId: defaultState.deployments.byId.d1.id, stats: defaultState.deployments.byId.d1.stats },
      { ...defaultResponseActions.stats, deploymentId: defaultState.deployments.byId.d2.id, stats: defaultState.deployments.byId.d2.stats }
    ];
    return store
      .dispatch(getDeploymentsByStatus('inprogress', null, null, new Date(), new Date(), Object.keys(defaultState.devices.groups.byId)[0], true))
      .then(() => {
        const storeActions = store.getActions();
        expect(storeActions.length).toEqual(expectedActions.length);
        expectedActions.map((action, index) => {
          Object.keys(action).map(key => expect(action[key]).toEqual(storeActions[index][key]));
        });
      });
  });
});

describe('getDeviceLog', () => {
  it('should allow deployment device log retrieval', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [defaultResponseActions.log];
    return store.dispatch(getDeviceLog(Object.keys(defaultState.deployments.byId)[0], defaultState.deployments.byId.d1.devices.a1.id)).then(() => {
      const storeActions = store.getActions();
      expect(storeActions.length).toEqual(expectedActions.length);
      expectedActions.map((action, index) => Object.keys(action).map(key => expect(action[key]).toEqual(storeActions[index][key])));
    });
  });
});

describe('selectDeployment', () => {
  it('should allow selecting a deployment', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [defaultResponseActions.select, defaultResponseActions.receive, defaultResponseActions.stats];
    return store.dispatch(selectDeployment(createdDeployment.id)).then(() => {
      const storeActions = store.getActions();
      expect(storeActions.length).toEqual(expectedActions.length);
      expectedActions.map((action, index) => Object.keys(action).map(key => expect(action[key]).toEqual(storeActions[index][key])));
    });
  });
});
