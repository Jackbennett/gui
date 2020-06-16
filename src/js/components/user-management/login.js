import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import Cookies from 'universal-cookie';
import ReactTooltip from 'react-tooltip';

import { Button, SvgIcon } from '@material-ui/core';
import { Help as HelpIcon } from '@material-ui/icons';
import { mdiGithub, mdiGoogle } from '@mdi/js';

import { setSnackbar } from '../../actions/appActions';
import { getUser, loginUser, setCurrentUser } from '../../actions/userActions';

import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';
import PasswordInput from '../common/forms/passwordinput';
import FormCheckbox from '../common/forms/formcheckbox';
import { WelcomeSnackTip } from '../helptips/onboardingtips';
import { getOnboardingStepCompleted } from '../../utils/onboardingmanager';
import { clearAllRetryTimers } from '../../utils/retrytimer';

const providers = [
  {
    id: 'Github',
    icon: (
      <SvgIcon fontSize="inherit">
        <path d={mdiGithub} />
      </SvgIcon>
    )
  },
  {
    id: 'Google',
    icon: (
      <SvgIcon fontSize="inherit">
        <path d={mdiGoogle} />
      </SvgIcon>
    )
  }
];

export class Login extends React.Component {
  constructor(props, context) {
    super(props, context);
    const cookies = new Cookies();
    this.state = {
      noExpiry: cookies.get('noExpiry'),
      redirectToReferrer: false
    };
  }

  componentDidMount() {
    clearAllRetryTimers(this.props.setSnackbar);
    this.props.setCurrentUser(null);
  }

  componentDidUpdate(prevProps) {
    const self = this;
    if (prevProps.currentUser !== this.props.currentUser && !!this.props.currentUser.id) {
      // logged in, so redirect
      self.setState({ redirectToReferrer: true });
      setTimeout(() => {
        if (
          self.props.showHelptips &&
          self.props.showOnboardingTips &&
          !self.props.onboardingComplete &&
          !getOnboardingStepCompleted('devices-pending-accepting-onboarding')
        ) {
          self.props.setSnackbar('open', 10000, '', <WelcomeSnackTip progress={1} />, () => {}, self.onCloseSnackbar);
        }
      }, 1000);
      self.props.setSnackbar('');
    }
    if (prevProps.has2FA !== self.props.has2FA && self.props.has2FA) {
      self.setState({});
    }
  }

  componentWillUnmount() {
    this.props.setSnackbar('');
  }

  onCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.props.setSnackbar('');
  };

  _handleLogin(formData) {
    var self = this;

    if (!formData.hasOwnProperty('email')) {
      return;
    }
    if (self.state.isEnterprise && self.props.has2FA && !formData.hasOwnProperty('token2fa')) {
      return;
    }
    return self.props.loginUser(formData).catch(err => console.log(err));
  }

  render() {
    const { noExpiry, redirectToReferrer } = this.state;
    const { has2FA, isHosted, location } = this.props;
    let { from } = { from: { pathname: '/' } };
    if (location && location.state && location.state.from.pathname !== '/ui/') {
      from = location.state.from;
    }
    if (redirectToReferrer) {
      return <Redirect to={from} />;
    }

    let twoFAAnchor = {};
    if (this.twoFARef) {
      twoFAAnchor = {
        left: this.twoFARef.offsetLeft + this.twoFARef.offsetWidth + 120,
        top: this.twoFARef.parentElement.parentElement.offsetTop + this.twoFARef.offsetHeight / 2
      };
    }
    return (
      <div className="full-screen">
        <div id="login-box">
          <h3>Log in</h3>
          <img src="assets/img/loginlogo.png" alt="mender-logo" className="margin-bottom-small" />

          {isHosted && (
            <>
              <div className="flexbox centered margin-bottom">Log in with:</div>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {providers.map(provider => (
                  <Button
                    className="oauth-provider"
                    variant="contained"
                    key={provider.id}
                    href={`/api/management/v1/useradm/oauth2/${provider.id.toLowerCase()}`}
                    startIcon={provider.icon}
                  >
                    {provider.id}
                  </Button>
                ))}
              </div>
              <h4 className="dashboard-header margin-top-large" style={{ display: 'flex', justifyContent: 'center' }}>
                <span style={{ padding: 15, top: -24 }}>or your email address</span>
              </h4>
            </>
          )}

          <Form showButtons={true} buttonColor="primary" onSubmit={formdata => this._handleLogin(formdata)} submitLabel="Log in" submitButtonId="login_button">
            <TextInput hint="Your email" label="Your email" id="email" required={true} validations="isLength:1,isEmail" />
            <PasswordInput className="margin-bottom-small" id="password" label="Password" required={true} />
            {has2FA ? (
              <TextInput
                hint="Two Factor Authentication Code"
                label="Two Factor Authentication Code"
                id="token2fa"
                validations="isLength:6,isNumeric"
                required={true}
                setControlRef={re => (this.twoFARef = re)}
              />
            ) : (
              <div />
            )}
            <FormCheckbox id="noExpiry" label="Stay logged in" checked={noExpiry === 'true'} />
          </Form>

          {isHosted ? (
            <div className="margin-top text-muted">
              <div className="flexbox centered">
                Don&#39;t have an account?{' '}
                <Link style={{ marginLeft: '4px' }} to="/signup">
                  Sign up here
                </Link>
              </div>
              {this.twoFARef && (
                <div>
                  <div id="onboard-6" className="tooltip info" data-tip data-for="2fa-tip" data-event="click focus" style={twoFAAnchor}>
                    <HelpIcon />
                  </div>
                  <ReactTooltip id="2fa-tip" globalEventOff="click" place="top" effect="solid" className="react-tooltip info" style={{ maxWidth: 300 }}>
                    Two Factor Authentication is enabled for your account. If you haven&apos;t set up a 3rd party authentication app with a verification code,
                    please contact an administrator.
                  </ReactTooltip>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

const actionCreators = { getUser, loginUser, setCurrentUser, setSnackbar };

const mapStateToProps = state => {
  return {
    currentUser: state.users.byId[state.users.currentUser] || {},
    has2FA: state.users.globalSettings.hasOwnProperty('2fa') && state.users.globalSettings['2fa'] === 'enabled',
    isHosted: state.app.features.isHosted,
    showHelptips: state.users.showHelptips,
    showOnboardingTips: state.users.onboarding.showTips,
    onboardingComplete: state.users.onboarding.complete
  };
};

export default connect(mapStateToProps, actionCreators)(Login);
