import React from 'react';
import { compose, setDisplayName } from 'recompose';

import { DEPLOYMENT_STATES } from '../constants/deploymentConstants';
import { onboardingSteps as stepNames } from '../constants/onboardingConstants';
import CreateArtifactDialog from '../components/helptips/createartifactdialog';
import BaseOnboardingTip from '../components/helptips/baseonboardingtip';
import DeploymentCompleteTip from '../components/helptips/deploymentcompletetip';
import OnboardingCompleteTip from '../components/helptips/onboardingcompletetip';
import {
  ApplicationUpdateReminderTip,
  ArtifactIncludedDeployOnboarding,
  ArtifactIncludedOnboarding,
  ArtifactModifiedOnboarding,
  DashboardOnboardingPendings,
  DashboardOnboardingState,
  DeploymentsInprogress,
  DeploymentsPast,
  DeploymentsPastCompletedFailure,
  DevicePendingTip,
  DevicesAcceptedOnboarding,
  DevicesPendingAcceptingOnboarding,
  GetStartedTip,
  SchedulingAllDevicesSelection,
  SchedulingArtifactSelection,
  SchedulingGroupSelection,
  SchedulingReleaseToDevices,
  UploadNewArtifactDialogDestination,
  UploadNewArtifactDialogDeviceType,
  UploadNewArtifactDialogReleaseName,
  UploadNewArtifactDialogUpload,
  UploadNewArtifactTip,
  UploadPreparedArtifactTip,
  WelcomeSnackTip
} from '../components/helptips/onboardingtips';

export const onboardingSteps = {
  [stepNames.ONBOARDING_START]: {
    condition: { min: stepNames.ONBOARDING_START, max: stepNames.DEVICES_PENDING_ACCEPTING_ONBOARDING },
    specialComponent: <WelcomeSnackTip progress={1} />
  },
  [stepNames.DASHBOARD_ONBOARDING_START]: {
    condition: { min: stepNames.ONBOARDING_START },
    component: GetStartedTip,
    progress: 1
  },
  [stepNames.DEVICES_PENDING_ONBOARDING_START]: {
    condition: { min: stepNames.DASHBOARD_ONBOARDING_START, max: stepNames.DEVICES_PENDING_ONBOARDING },
    specialComponent: <DevicePendingTip />
  },
  [stepNames.DEVICES_PENDING_ONBOARDING]: {
    condition: { min: stepNames.DASHBOARD_ONBOARDING_START },
    component: DashboardOnboardingState,
    progress: 1
  },
  [stepNames.DEVICES_PENDING_ACCEPTING_ONBOARDING]: {
    condition: { min: stepNames.DEVICES_PENDING_ONBOARDING, max: stepNames.DEVICES_ACCEPTED_ONBOARDING },
    component: DevicesPendingAcceptingOnboarding,
    progress: 2
  },
  [stepNames.DASHBOARD_ONBOARDING_PENDINGS]: {
    condition: { min: stepNames.DEVICES_PENDING_ONBOARDING },
    component: DashboardOnboardingPendings,
    progress: 2
  },
  [stepNames.DEVICES_ACCEPTED_ONBOARDING]: {
    condition: { max: stepNames.APPLICATION_UPDATE_REMINDER_TIP },
    component: DevicesAcceptedOnboarding,
    progress: 1
  },
  [stepNames.DEVICES_ACCEPTED_ONBOARDING_NOTIFICATION]: {
    condition: { min: stepNames.DASHBOARD_ONBOARDING_PENDINGS, max: stepNames.APPLICATION_UPDATE_REMINDER_TIP },
    specialComponent: <WelcomeSnackTip progress={2} />
  },
  [stepNames.APPLICATION_UPDATE_REMINDER_TIP]: {
    condition: { max: stepNames.ARTIFACT_INCLUDED_DEPLOY_ONBOARDING, extra: () => window.location.hash.endsWith('#/devices') },
    component: ApplicationUpdateReminderTip,
    progress: 2
  },
  [stepNames.UPLOAD_PREPARED_ARTIFACT_TIP]: {
    condition: { min: stepNames.DEVICES_ACCEPTED_ONBOARDING, max: stepNames.ARTIFACT_INCLUDED_ONBOARDING },
    component: UploadPreparedArtifactTip,
    progress: 2
  },
  [stepNames.ARTIFACT_INCLUDED_ONBOARDING]: {
    condition: { min: stepNames.DEVICES_ACCEPTED_ONBOARDING, max: stepNames.DEPLOYMENTS_INPROGRESS },
    component: ArtifactIncludedOnboarding,
    progress: 1
  },
  [stepNames.ARTIFACT_INCLUDED_DEPLOY_ONBOARDING]: {
    condition: { min: stepNames.ARTIFACT_INCLUDED_ONBOARDING, max: stepNames.DEPLOYMENTS_INPROGRESS },
    component: ArtifactIncludedDeployOnboarding,
    progress: 1
  },
  [stepNames.SCHEDULING_ARTIFACT_SELECTION]: {
    condition: { min: stepNames.ARTIFACT_INCLUDED_DEPLOY_ONBOARDING },
    component: SchedulingArtifactSelection,
    progress: 2
  },
  [stepNames.SCHEDULING_ALL_DEVICES_SELECTION]: {
    condition: { max: stepNames.SCHEDULING_RELEASE_TO_DEVICES },
    component: SchedulingAllDevicesSelection,
    progress: 2
  },
  [stepNames.SCHEDULING_GROUP_SELECTION]: {
    condition: {},
    component: SchedulingGroupSelection,
    progress: 2
  },
  [stepNames.SCHEDULING_RELEASE_TO_DEVICES]: {
    condition: { max: stepNames.DEPLOYMENTS_INPROGRESS },
    component: SchedulingReleaseToDevices
  },
  [stepNames.DEPLOYMENTS_INPROGRESS]: {
    condition: {},
    component: DeploymentsInprogress,
    progress: 2
  },
  [stepNames.DEPLOYMENTS_PAST]: {
    condition: { extra: () => !window.location.hash.includes(DEPLOYMENT_STATES.finished) },
    component: DeploymentsPast,
    progress: 3
  },
  [stepNames.DEPLOYMENTS_PAST_COMPLETED_NOTIFICATION]: {
    condition: { min: stepNames.DEPLOYMENTS_PAST },
    specialComponent: <WelcomeSnackTip progress={3} />
  },
  [stepNames.DEPLOYMENTS_PAST_COMPLETED]: {
    condition: { min: stepNames.DEPLOYMENTS_PAST_COMPLETED_NOTIFICATION, max: stepNames.DEPLOYMENTS_PAST_COMPLETED_FAILURE },
    component: compose(setDisplayName('OnboardingTip'))(() => <DeploymentCompleteTip targetUrl="destination-unreachable" />)
  },
  [stepNames.DEPLOYMENTS_PAST_COMPLETED_FAILURE]: {
    condition: { max: stepNames.ARTIFACT_CREATION_DIALOG },
    component: DeploymentsPastCompletedFailure
  },
  [stepNames.ARTIFACT_CREATION_DIALOG]: {
    condition: { max: stepNames.UPLOAD_NEW_ARTIFACT_TIP },
    specialComponent: <CreateArtifactDialog />
  },
  [stepNames.UPLOAD_NEW_ARTIFACT_TIP]: {
    condition: {},
    component: UploadNewArtifactTip,
    progress: 2
  },
  [stepNames.UPLOAD_NEW_ARTIFACT_DIALOG_UPLOAD]: {
    condition: {},
    component: UploadNewArtifactDialogUpload,
    progress: 2
  },
  [stepNames.UPLOAD_NEW_ARTIFACT_DIALOG_DESTINATION]: {
    condition: {},
    component: UploadNewArtifactDialogDestination,
    progress: 2
  },
  [stepNames.UPLOAD_NEW_ARTIFACT_DIALOG_DEVICE_TYPE]: {
    condition: { min: stepNames.UPLOAD_NEW_ARTIFACT_DIALOG_DESTINATION },
    component: UploadNewArtifactDialogDeviceType,
    progress: 2
  },
  [stepNames.UPLOAD_NEW_ARTIFACT_DIALOG_RELEASE_NAME]: {
    condition: { min: stepNames.UPLOAD_NEW_ARTIFACT_DIALOG_DEVICE_TYPE },
    component: UploadNewArtifactDialogReleaseName,
    progress: 2
  },
  [stepNames.ARTIFACT_MODIFIED_ONBOARDING]: {
    condition: {},
    component: ArtifactModifiedOnboarding,
    progress: 1
  },
  [stepNames.ONBOARDING_FINISHED]: {
    condition: {},
    specialComponent: <OnboardingCompleteTip targetUrl="destination-unreachable" />
  },
  [stepNames.ONBOARDING_FINISHED_NOTIFICATION]: {
    condition: { min: stepNames.ARTIFACT_MODIFIED_ONBOARDING },
    specialComponent: <WelcomeSnackTip progress={4} />
  },
  [stepNames.ONBOARDING_CANCELED]: {
    condition: () => true,
    component: compose(setDisplayName('OnboardingTip'))(() => <div />),
    progress: 3
  }
};

const getOnboardingStepCompleted = (id, progress, complete, showHelptips, showTips) => {
  const keys = Object.keys(onboardingSteps);
  const { min = id, max = id, extra } = Object.entries(onboardingSteps).reduce(
    (accu, [key, value]) => {
      if (key === id) {
        return value.condition;
      }
      return accu;
    },
    { min: '' }
  );
  const progressIndex = keys.findIndex(step => step === progress);
  return (
    !complete &&
    showHelptips &&
    showTips &&
    progressIndex >= keys.findIndex(step => step === min) &&
    progressIndex <= keys.findIndex(step => step === max) &&
    (extra ? extra() : true)
  );
};

export const getOnboardingComponentFor = (id, componentProps, params = {}, previousComponent = null) => {
  const step = onboardingSteps[id];
  const isValid = getOnboardingStepCompleted(id, componentProps.progress, componentProps.complete, componentProps.showHelptips, componentProps.showTips);
  if (!isValid) {
    return previousComponent;
  }
  if (step.specialComponent) {
    return React.cloneElement(step.specialComponent, params);
  }
  const component = step.component(componentProps);
  return <BaseOnboardingTip id={id} component={component} progress={step.progress || params.progress || null} {...params} />;
};
