import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import moment from 'moment';

import { InfoOutlined as InfoOutlinedIcon, LocalOffer as LocalOfferIcon } from '@material-ui/icons';

import { setSnackbar } from '../../actions/appActions';
import { getDeviceLimit } from '../../actions/deviceActions';
import { cancelUpgrade, completeUpgrade, getUserOrganization, requestPlanChange, startUpgrade } from '../../actions/organizationActions';
import Loader from '../common/loader';
import { PLANS } from '../../constants/appConstants';
import AddOnSelection from './addonselection';
import PlanSelection from './planselection';
import CardSection from './cardsection';
import QuoteRequestForm from './quoterequestform';

const offerTag = (
  <span className="offerTag">
    <LocalOfferIcon /> End of year offer
  </span>
);

export const PostUpgradeNote = ({ newPlan }) => (
  <div style={{ maxWidth: 750 }} className="margin-top-small">
    <h2 style={{ marginTop: 15 }}>Upgrade now</h2>
    <div>
      <p>
        <b>Your upgrade was successful! </b>You are now signed up to the <b>{newPlan}</b> plan.
      </p>
      <p>Redirecting you to your organization page...</p>
      <Loader show={true} />
    </div>
  </div>
);

export const PricingContactNote = () => (
  <p className="info">
    <InfoOutlinedIcon style={{ fontSize: '14px', margin: '0 4px 4px 0', verticalAlign: 'middle' }} />
    If you have any questions about the plan pricing or device limits,{' '}
    <a href="mailto:contact@mender.io" target="_blank" rel="noopener noreferrer">
      contact our team
    </a>
    .
  </p>
);

const upgradeNotes = {
  default: {
    title: 'Upgrades and add-ons',
    description: 'Upgrade your plan or purchase an add-on to connect more devices, access more features and advanced support.'
  },
  trial: {
    title: 'Upgrade now',
    description: 'Upgrade to one of our plans to connect more devices, continue using advanced features, and get access to support.'
  }
};

export const Upgrade = ({
  cancelUpgrade,
  completeUpgrade,
  features,
  getDeviceLimit,
  getUserOrganization,
  history,
  org,
  requestPlanChange,
  setSnackbar,
  startUpgrade
}) => {
  const offerValid = moment().isBefore('2021-01-01');

  const [addOns, setAddOns] = useState([]);
  const [updatedPlan, setUpdatedPlan] = useState('os');
  const [upgraded, setUpgraded] = useState(false);

  useEffect(() => {
    getUserOrganization();
  }, []);

  useEffect(() => {
    const { addons: orgAddOns = [], plan: orgPlan = 'os', trial = false } = org;
    const currentAddOns = orgAddOns.reduce((accu, addon) => {
      if (addon.enabled) {
        accu.push(addon);
      }
      return accu;
    }, []);
    const plan = Object.values(PLANS).find(plan => plan.value === (trial ? 'os' : orgPlan));
    setAddOns(currentAddOns);
    setUpdatedPlan(plan.value);
  }, [org]);

  if (upgraded) {
    return <PostUpgradeNote newPlan={PLANS[updatedPlan].name} />;
  }

  const handleUpgrade = async () =>
    completeUpgrade(org.id, updatedPlan).then(() => {
      setUpgraded(true);
      setTimeout(() => {
        getDeviceLimit();
        history.push('/settings/organization-and-billing');
      }, 3000);
    });

  const addOnsToString = (addons = []) =>
    addons
      .reduce((accu, item) => {
        if (item.enabled) {
          accu.push(item.name);
        }
        return accu;
      }, [])
      .join(', ');

  const onSendRequest = (message, addons = addOns) =>
    requestPlanChange(org.id, {
      current_plan: PLANS[org.plan || 'os'].name,
      requested_plan: PLANS[updatedPlan].name,
      current_addons: addOnsToString(org.addons) || '-',
      requested_addons: addOnsToString(addons) || '-',
      user_message: message
    });

  const { plan: currentPlan = 'os', trial: isTrial = true } = org;
  const { description, title } = isTrial ? upgradeNotes.trial : upgradeNotes.default;
  return (
    <div style={{ maxWidth: 750 }} className="margin-top-small">
      <h2 style={{ marginTop: 15 }}>{title}</h2>
      <p>{description}</p>
      <p>
        Learn more about the different plans and at{' '}
        <a href="https://mender.io/plans/pricing" target="_blank" rel="noopener noreferrer">
          mender.io/plans/pricing
        </a>
        . Prices can change at larger device counts, please see our{' '}
        <a href="https://mender.io/plans/pricing#calculator" target="_blank" rel="noopener noreferrer">
          price calculator
        </a>{' '}
        for more.
      </p>
      <PlanSelection
        currentPlan={currentPlan}
        isTrial={isTrial}
        offerValid={offerValid}
        offerTag={offerTag}
        setUpdatedPlan={setUpdatedPlan}
        updatedPlan={updatedPlan}
      />
      {isTrial && offerValid && (
        <p className="offerBox">
          {offerTag} – upgrade before December 31st to get a 20% discount for 6 months on Mender Basic and Mender Professional plans. The discount will be
          automatically applied to your account.
        </p>
      )}
      {isTrial ? <PricingContactNote /> : <AddOnSelection addons={addOns} features={features} updatedPlan={updatedPlan} onChange={setAddOns} />}
      {isTrial && updatedPlan !== PLANS.enterprise.value && (
        <>
          <h3 className="margin-top-large">2. Enter your payment details</h3>
          <p>
            You are upgrading to{' '}
            <b>
              Mender <span className="capitalized-start">{PLANS[updatedPlan].name}</span>
            </b>{' '}
            for <b>{PLANS[updatedPlan].price}</b>
          </p>
          <CardSection
            onCancel={() => Promise.resolve(cancelUpgrade(org.id))}
            onComplete={handleUpgrade}
            onSubmit={() => Promise.resolve(startUpgrade(org.id))}
            setSnackbar={setSnackbar}
            isSignUp={true}
          />
        </>
      )}
      {(!isTrial || updatedPlan === PLANS.enterprise.value) && (
        <QuoteRequestForm addOns={addOns} currentPlan={currentPlan} isTrial={isTrial} updatedPlan={updatedPlan} onSendMessage={onSendRequest} />
      )}
    </div>
  );
};

const actionCreators = { cancelUpgrade, completeUpgrade, getDeviceLimit, getUserOrganization, requestPlanChange, setSnackbar, startUpgrade };

const mapStateToProps = state => {
  return {
    features: state.app.features,
    org: state.organization.organization
  };
};

export default withRouter(connect(mapStateToProps, actionCreators)(Upgrade));
