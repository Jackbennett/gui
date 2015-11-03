var React = require('react');
var AppStore = require('../../stores/app-store');
var Health = require('./health');
var Schedule = require('./schedule');
var Progress = require('./progress');
var Router = require('react-router');

function getState() {
  return {
    progress: AppStore.getProgressUpdates(new Date().getTime()),
    schedule: AppStore.getScheduledUpdates(new Date().getTime()),
    health: AppStore.getHealth()
  }
}

var Dashboard = React.createClass({
  getInitialState: function() {
    return getState();
  },
  _handleWidgetClick: function(route) {
    this.context.router.transitionTo(route);
  },
  render: function() {
    return (
      <div className="contentContainer">
        <Progress clickHandle={this._handleWidgetClick} progress={this.state.progress} route="/updates" />
        <Health clickHandle={this._handleWidgetClick} health={this.state.health} route="/devices/1/status%3DDown" />
        <Schedule clickHandle={this._handleWidgetClick} schedule={this.state.schedule} route="/updates/schedule" />
      </div>
    );
  }
});

Dashboard.contextTypes = {
  router: React.PropTypes.func
};

module.exports = Dashboard;