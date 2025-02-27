import DeploymentConstants from '../constants/deploymentConstants';
import DeviceConstants from '../constants/deviceConstants';

export const initialState = {
  byId: {
    // [id]: { stats, devices: { [deploymentId]: { id, log } }, totalDeviceCount }
  },
  byStatus: {
    finished: { deploymentIds: [], total: 0 },
    inprogress: { deploymentIds: [], total: 0 },
    pending: { deploymentIds: [], total: 0 },
    scheduled: { deploymentIds: [], total: 0 }
  },
  deploymentDeviceLimit: 5000,
  selectedDeployment: null,
  selectedDeviceIds: [],
  selectionState: {
    finished: { ...DeviceConstants.DEVICE_LIST_DEFAULTS, endDate: undefined, search: '', selection: [], startDate: undefined, total: 0, type: '' },
    inprogress: { ...DeviceConstants.DEVICE_LIST_DEFAULTS, perPage: DeploymentConstants.DEFAULT_PENDING_INPROGRESS_COUNT, selection: [], total: 0 },
    pending: { ...DeviceConstants.DEVICE_LIST_DEFAULTS, perPage: DeploymentConstants.DEFAULT_PENDING_INPROGRESS_COUNT, selection: [], total: 0 },
    scheduled: { ...DeviceConstants.DEVICE_LIST_DEFAULTS, selection: [], total: 0 },
    general: {
      state: '/deployments/active',
      showCreationDialog: false,
      showReportDialog: false,
      reportType: null // DeploymentConstants.DEPLOYMENT_TYPES.configuration|DeploymentConstants.DEPLOYMENT_TYPES.software
    }
  }
};

const deploymentReducer = (state = initialState, action) => {
  switch (action.type) {
    case DeploymentConstants.CREATE_DEPLOYMENT:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.deploymentId]: {
            ...DeploymentConstants.deploymentPrototype,
            ...action.deployment
          }
        },
        byStatus: {
          ...state.byStatus,
          pending: {
            ...state.byStatus.pending,
            deploymentIds: [...state.byStatus.pending.deploymentIds, action.deploymentId],
            total: state.byStatus.pending.total + 1
          }
        },
        selectionState: {
          ...state.selectionState,
          pending: {
            ...state.selectionState.pending,
            selection: [action.deploymentId, ...state.selectionState.pending.selection],
            total: state.selectionState.pending.total + 1
          }
        }
      };
    case DeploymentConstants.REMOVE_DEPLOYMENT: {
      // eslint-disable-next-line no-unused-vars
      const { [action.deploymentId]: removedDeployment, ...remainder } = state.byId;
      return {
        ...state,
        byId: remainder
      };
    }
    case DeploymentConstants.RECEIVE_DEPLOYMENT:
    case DeploymentConstants.RECEIVE_DEPLOYMENT_DEVICE_LOG:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.deployment.id]: action.deployment
        }
      };
    case DeploymentConstants.RECEIVE_DEPLOYMENT_STATS:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.deploymentId]: {
            ...state.byId[action.deploymentId],
            stats: action.stats
          }
        }
      };
    case DeploymentConstants.RECEIVE_DEPLOYMENT_DEVICES:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.deploymentId]: {
            ...state.byId[action.deploymentId],
            devices: action.devices,
            totalDeviceCount: action.totalDeviceCount
          }
        },
        selectedDeviceIds: action.selectedDeviceIds
      };
    case DeploymentConstants.RECEIVE_INPROGRESS_DEPLOYMENTS:
    case DeploymentConstants.RECEIVE_PENDING_DEPLOYMENTS:
    case DeploymentConstants.RECEIVE_SCHEDULED_DEPLOYMENTS:
    case DeploymentConstants.RECEIVE_FINISHED_DEPLOYMENTS:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...action.deployments
        },
        byStatus: {
          ...state.byStatus,
          [action.status]: {
            ...state.byStatus[action.status],
            deploymentIds: action.deploymentIds,
            total: action.total
          }
        }
      };
    case DeploymentConstants.SELECT_INPROGRESS_DEPLOYMENTS:
    case DeploymentConstants.SELECT_PENDING_DEPLOYMENTS:
    case DeploymentConstants.SELECT_SCHEDULED_DEPLOYMENTS:
    case DeploymentConstants.SELECT_FINISHED_DEPLOYMENTS:
      return {
        ...state,
        selectionState: {
          ...state.selectionState,
          [action.status]: {
            ...state.selectionState[action.status],
            selection: action.deploymentIds,
            total: action.total
          }
        }
      };
    case DeploymentConstants.SELECT_DEPLOYMENT:
      return {
        ...state,
        selectedDeployment: action.deploymentId
      };
    case DeploymentConstants.SET_DEPLOYMENTS_STATE:
      return {
        ...state,
        selectionState: action.state
      };
    default:
      return state;
  }
};

export default deploymentReducer;
