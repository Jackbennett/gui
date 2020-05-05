import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Button, Tab, Tabs } from '@material-ui/core';

import { getGroups, getDynamicGroups, initializeGroupsDevices, selectDevice } from '../../actions/deviceActions';
import { selectRelease } from '../../actions/releaseActions';
import { saveGlobalSettings } from '../../actions/userActions';
import { setSnackbar } from '../../actions/appActions';
import { abortDeployment, createDeployment, selectDeployment } from '../../actions/deploymentActions';

import CreateDialog from './createdeployment';
import Progress from './inprogressdeployments';
import Past from './pastdeployments';
import Report from './report';
import Scheduled from './scheduleddeployments';

import { deepCompare, preformatWithRequestID, standardizePhases } from '../../helpers';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';

const MAX_PREVIOUS_PHASES_COUNT = 5;

const routes = {
  active: {
    component: Progress,
    route: '/deployments/active',
    title: 'Active'
  },
  scheduled: {
    component: Scheduled,
    route: '/deployments/scheduled',
    title: 'Scheduled'
  },
  finished: {
    component: Past,
    route: '/deployments/finished',
    title: 'Finished'
  }
};

export const defaultRefreshDeploymentsLength = 30000;

export class Deployments extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      currentRefreshDeploymentLength: defaultRefreshDeploymentsLength,
      deploymentObject: {},
      createDialog: false,
      reportDialog: false,
      startDate: null,
      tabIndex: this._updateActive()
    };
  }

  componentDidMount() {
    var self = this;
    self.props.selectRelease();
    self.props.selectDevice();
    Promise.all([self.props.getGroups(), self.props.getDynamicGroups()])
      .then(() => self.props.initializeGroupsDevices())
      .catch(err => console.log(err));
    let startDate = self.state.startDate;
    const params = new URLSearchParams(this.props.location.search);
    if (this.props.match) {
      if (params) {
        if (params.get('open')) {
          if (params.get('id')) {
            self.showReport(self.state.reportType, params.get('id'));
          } else if (params.get('release')) {
            self.props.selectRelease(params.get('release'));
          } else if (params.get('deviceId')) {
            self.props.selectDevice(params.get('deviceId')).catch(err => {
              console.log(err);
              var errMsg = err.res.body.error || '';
              self.props.setSnackbar(preformatWithRequestID(err.res, `Error fetching device details. ${errMsg}`), null, 'Copy to clipboard');
            });
          } else {
            setTimeout(() => self.setState({ createDialog: true }), 400);
          }
        } else if (params.get('from')) {
          startDate = new Date(params.get('from'));
          startDate.setHours(0, 0, 0);
        }
      }
    }
    self.setState({
      createDialog: Boolean(params.get('open')),
      reportType: this.props.match ? this.props.match.params.tab : 'active',
      startDate,
      tabIndex: this._updateActive()
    });
  }

  retryDeployment(deployment, devices) {
    const self = this;
    const release = { Name: deployment.artifact_name, device_types_compatible: deployment.device_types_compatible || [] };
    const deploymentObject = {
      group: deployment.name,
      deploymentDeviceIds: devices.map(item => item.id),
      release,
      phases: [{ batch_size: 100, start_ts: new Date().toISOString(), delay: 0 }]
    };
    self.setState({ deploymentObject, createDialog: true, reportDialog: false });
  }

  onScheduleSubmit(deploymentObject) {
    const self = this;
    const { deploymentDeviceIds, filterId, group, phases, release, retries } = deploymentObject;
    const newDeployment = {
      artifact_name: release.Name,
      devices: filterId ? undefined : deploymentDeviceIds,
      filter_id: filterId,
      name: decodeURIComponent(group) || 'All devices',
      phases,
      retries
    };
    self.setState({ doneLoading: false, createDialog: false, reportDialog: false });

    return self.props
      .createDeployment(newDeployment)
      .then(() => {
        self.props.setSnackbar('Deployment created successfully', 8000);
        if (phases) {
          const standardPhases = standardizePhases(phases);
          let previousPhases = self.props.settings.previousPhases || [];
          previousPhases = previousPhases.map(standardizePhases);
          if (!previousPhases.find(previousPhaseList => previousPhaseList.every(oldPhase => standardPhases.find(phase => deepCompare(phase, oldPhase))))) {
            previousPhases.push(standardPhases);
          }
          self.props.saveGlobalSettings({ previousPhases: previousPhases.slice(-1 * MAX_PREVIOUS_PHASES_COUNT) });
        }
        self.setState({ doneLoading: true, deploymentObject: {} });
        // successfully retrieved new deployment
        if (self._getCurrentRoute().title !== routes.active.title) {
          self.props.history.push(routes.active.route);
          self._changeTab(routes.active.route);
        }
      })
      .catch(err => {
        self.props.setSnackbar('Error while creating deployment');
        var errMsg = err.res.body.error || '';
        self.props.setSnackbar(preformatWithRequestID(err.res, `Error creating deployment. ${errMsg}`), null, 'Copy to clipboard');
      });
  }

  _abortDeployment(id) {
    var self = this;
    return self.props
      .abortDeployment(id)
      .then(() => {
        self.setState({ createDialog: false, reportDialog: false, doneLoading: false });
        self.props.setSnackbar('The deployment was successfully aborted');
        return Promise.resolve();
      })
      .catch(err => {
        console.log(err);
        var errMsg = err.res ? err.res.body.error : '';
        self.props.setSnackbar(preformatWithRequestID(err.res, `There was wan error while aborting the deployment: ${errMsg}`));
      });
  }

  _updateActive(tab = this.props.match.params.tab) {
    if (routes.hasOwnProperty(tab)) {
      return routes[tab].route;
    }
    return routes.active.route;
  }

  _getCurrentRoute(tab = this.props.match.params.tab) {
    if (routes.hasOwnProperty(tab)) {
      return routes[tab];
    }
    return routes.active;
  }

  _changeTab(tabIndex) {
    var self = this;
    self.setState({ tabIndex });
    self.props.setSnackbar('');
  }

  showReport(reportType, deploymentId) {
    const self = this;
    self.props.selectDeployment(deploymentId).then(() => self.setState({ createDialog: false, reportType, reportDialog: true }));
  }

  closeReport() {
    const self = this;
    self.setState({ reportDialog: false }, () => self.props.selectDeployment());
  }

  render() {
    const self = this;
    const { pastCount } = self.props;
    // tabs
    const { createDialog, deploymentObject, reportDialog, reportType, startDate, tabIndex } = self.state;
    let onboardingComponent = null;
    // the pastCount prop is needed to trigger the rerender as the change in past deployments would otherwise not be noticed on this view
    if (pastCount) {
      onboardingComponent = getOnboardingComponentFor('deployments-past', { anchor: { left: 240, top: 50 } });
    }
    const ComponentToShow = self._getCurrentRoute().component;
    return (
      <>
        <div className="margin-left-small margin-top" style={{ maxWidth: '80vw' }}>
          <div className="flexbox space-between">
            <Tabs value={tabIndex} onChange={(e, newTabIndex) => self._changeTab(newTabIndex)}>
              {Object.values(routes).map(route => (
                <Tab component={Link} key={route.route} label={route.title} to={route.route} value={route.route} />
              ))}
            </Tabs>
            <Button color="secondary" variant="contained" onClick={() => self.setState({ createDialog: true })} style={{ height: '100%' }}>
              Create a deployment
            </Button>
          </div>
          <ComponentToShow
            abort={id => self._abortDeployment(id)}
            createClick={() => self.setState({ createDialog: true })}
            openReport={(type, id) => self.showReport(type, id)}
            startDate={startDate}
          />
        </div>
        {reportDialog && (
          <Report
            abort={id => self._abortDeployment(id)}
            onClose={() => self.closeReport()}
            retry={(deployment, devices) => self.retryDeployment(deployment, devices)}
            type={reportType}
          />
        )}
        {createDialog && (
          <CreateDialog
            open={createDialog}
            onDismiss={() => self.setState({ createDialog: false, deploymentObject: {} })}
            onScheduleSubmit={deploymentObj => self.onScheduleSubmit(deploymentObj)}
            deploymentObject={deploymentObject}
          />
        )}
        {onboardingComponent}
      </>
    );
  }
}

const actionCreators = {
  abortDeployment,
  createDeployment,
  getGroups,
  getDynamicGroups,
  initializeGroupsDevices,
  saveGlobalSettings,
  selectDevice,
  selectDeployment,
  selectRelease,
  setSnackbar
};

const mapStateToProps = state => {
  return {
    pastCount: state.deployments.byStatus.finished.total,
    settings: state.users.globalSettings
  };
};

export default withRouter(connect(mapStateToProps, actionCreators)(Deployments));
