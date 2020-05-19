import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { connect } from 'react-redux';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { Button } from '@material-ui/core';
import { CalendarToday as CalendarTodayIcon, List as ListIcon } from '@material-ui/icons';

import { setSnackbar } from '../../actions/appActions';
import { getDeploymentsByStatus, getSingleDeploymentStats, selectDeployment } from '../../actions/deploymentActions';
import { tryMapDeployments } from '../../helpers';
import { setRetryTimer, clearRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';
import EnterpriseNotification from '../common/enterpriseNotification';
import DeploymentsList, { defaultHeaders } from './deploymentslist';
import { DeploymentDeviceCount, DeploymentEndTime, DeploymentPhases, DeploymentStartTime } from './deploymentitem';
import { defaultRefreshDeploymentsLength as refreshDeploymentsLength } from './deployments';

const localizer = momentLocalizer(moment);

const headers = [
  ...defaultHeaders.slice(0, 2),
  { title: 'Start time', renderer: DeploymentStartTime, props: { direction: 'up' } },
  { title: `End time`, renderer: DeploymentEndTime },
  { title: '# devices', class: 'align-right column-defined', renderer: DeploymentDeviceCount },
  { title: 'Phases', renderer: DeploymentPhases }
];

const tabs = {
  list: {
    icon: <ListIcon />,
    index: 'list',
    title: 'List view'
  },
  calendar: {
    icon: <CalendarTodayIcon />,
    index: 'calendar',
    title: 'Calendar'
  }
};

const type = 'scheduled';

export class Scheduled extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      calendarEvents: [],
      page: 1,
      perPage: 20,
      tabIndex: tabs.list.index
    };
  }

  componentDidMount() {
    const self = this;
    if (!self.props.isEnterprise) {
      return;
    }
    clearInterval(self.timer);
    self.timer = setInterval(() => self.refreshDeployments(), refreshDeploymentsLength);
    self.refreshDeployments();
  }

  componentDidUpdate(_, prevState) {
    if (prevState.tabIndex !== this.state.tabIndex && this.state.tabIndex === tabs.calendar.index) {
      const calendarEvents = this.props.items.map(deployment => {
        const start = new Date(deployment.start_ts || deployment.phases ? deployment.phases[0].start_ts : deployment.created);
        let endDate = start;
        if (deployment.phases && deployment.phases.length && deployment.phases[deployment.phases.length - 1].end_ts) {
          endDate = new Date(deployment.phases[deployment.phases.length - 1].end_ts);
        } else if (deployment.filter_id || deployment.filter) {
          // calendar doesn't support never ending events so we set to the upper limit of js supported dates,
          // - this should be the next best thing to infinity
          endDate = new Date(8640000000000000);
        }
        return {
          allDay: !(deployment.filter_id || deployment.filter),
          id: deployment.id,
          title: `${deployment.name} ${deployment.artifact_name}`,
          start,
          end: endDate
        };
      });
      this.setState({ calendarEvents });
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    clearAllRetryTimers(this.props.setSnackbar);
  }

  refreshDeployments(page = this.state.page, perPage = this.state.perPage) {
    const self = this;
    return self.setState({ page, perPage }, () =>
      Promise.resolve(self.props.getDeploymentsByStatus('scheduled', page, perPage))
        .then(deploymentsAction => {
          clearRetryTimer(type, self.props.setSnackbar);
          if (deploymentsAction && deploymentsAction[0].total && !deploymentsAction[0].deploymentIds.length) {
            return self.refreshDeployments(...arguments);
          }
        })
        .catch(err => {
          console.log(err);
          var errormsg = err.error || 'Please check your connection';
          setRetryTimer(err, 'deployments', `Couldn't load deployments. ${errormsg}`, refreshDeploymentsLength, self.props.setSnackbar);
        })
        .finally(() => self.setState({ doneLoading: true }))
    );
  }

  abortDeployment(id) {
    const self = this;
    self.props.abort(id).then(() => self.refreshDeployments());
  }

  render() {
    const self = this;
    const { calendarEvents, tabIndex } = self.state;
    const { createClick, isEnterprise, isHosted, items, openReport } = self.props;
    return (
      <div className="fadeIn margin-left">
        {items.length ? (
          <>
            <div className="margin-large margin-left-small">
              {Object.entries(tabs).map(([currentIndex, tab]) => (
                <Button
                  color="primary"
                  key={currentIndex}
                  startIcon={tab.icon}
                  style={Object.assign({ textTransform: 'none' }, currentIndex !== tabIndex ? { color: '#c7c7c7' } : {})}
                  onClick={() => self.setState({ tabIndex: currentIndex })}
                >
                  {tab.title}
                </Button>
              ))}
            </div>
            {tabIndex === tabs.list.index && <DeploymentsList {...self.props} abort={id => self.abortDeployment(id)} count={0} headers={headers} type={type} />}
            {tabIndex === tabs.calendar.index && (
              <Calendar
                localizer={localizer}
                className="margin-left"
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 700 }}
                onSelectEvent={calendarEvent => openReport(type, calendarEvent.id)}
              />
            )}
          </>
        ) : (
          <div className="dashboard-placeholder margin-top">
            {isEnterprise ? (
              <>
                <p>Scheduled deployments will appear here. </p>
                <p>
                  <a onClick={createClick}>Create a deployment</a> to get started
                </p>
              </>
            ) : (
              <div className="flexbox centered">
                <EnterpriseNotification
                  isEnterprise={isEnterprise}
                  recommendedPlan={isHosted ? 'professional' : null}
                  benefit="schedule deployments to steer the distribution of your updates."
                />
              </div>
            )}
            <img src="assets/img/deployments.png" alt="In progress" />
          </div>
        )}
      </div>
    );
  }
}

const actionCreators = { getDeploymentsByStatus, getSingleDeploymentStats, setSnackbar, selectDeployment };

const mapStateToProps = state => {
  const scheduled = state.deployments.byStatus.scheduled.selectedDeploymentIds.reduce(tryMapDeployments, { state, deployments: [] }).deployments;
  const plan = state.users.organization ? state.users.organization.plan : 'os';
  return {
    isEnterprise: state.app.features.isEnterprise || (state.app.features.isHosted && plan !== 'os'),
    isHosted: state.app.features.isHosted,
    plan,
    items: scheduled
  };
};

export default connect(mapStateToProps, actionCreators)(Scheduled);
