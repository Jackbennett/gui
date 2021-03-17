import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Cookies from 'universal-cookie';

import { defaultState, token } from '../../../tests/mockData';
import { roles as rbacRoles } from '../../../tests/__mocks__/userHandlers';
import {
  createRole,
  createUser,
  editRole,
  editUser,
  get2FAQRCode,
  getRoles,
  getUser,
  getUserList,
  loginUser,
  logoutUser,
  passwordResetComplete,
  passwordResetStart,
  removeRole,
  removeUser,
  saveGlobalSettings,
  saveUserSettings,
  setHideAnnouncement,
  setShowConnectingDialog,
  toggleHelptips,
  verify2FA
} from './userActions';
import OnboardingConstants from '../constants/onboardingConstants';
import AppConstants from '../constants/appConstants';
import UserConstants from '../constants/userConstants';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const defaultRole = { name: 'test', description: 'test description', groups: [] };
const settings = { test: true };

const receivedRoles = rbacRoles.reduce((accu, role) => {
  if (role.name.startsWith('RBAC')) {
    const { name, ...roleRemainder } = role;
    accu[name] = roleRemainder;
  }
  return accu;
}, {});

describe('user actions', () => {
  it('should forward connecting dialog visibility', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      {
        type: UserConstants.SET_SHOW_CONNECT_DEVICE,
        show: true
      }
    ];
    await store.dispatch(setShowConnectingDialog(true));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should toggle helptips visibility based on cookie value', async () => {
    jest.clearAllMocks();
    const cookies = new Cookies();
    const expectedActions = [
      { type: UserConstants.SET_SHOW_HELP, show: true },
      { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: true }
    ];
    const store = mockStore({ ...defaultState });
    store.dispatch(toggleHelptips());
    expect(cookies.get).toHaveBeenCalledTimes(1);
    expect(cookies.set).toHaveBeenCalledTimes(1);
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should toggle helptips visibility based on cookie value - pt 2', async () => {
    jest.clearAllMocks();
    const cookies = new Cookies();
    const expectedActions = [
      { type: UserConstants.SET_SHOW_HELP, show: false },
      { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: false }
    ];
    const store = mockStore({ ...defaultState });
    cookies.get.mockReturnValueOnce({ help: true });
    store.dispatch(toggleHelptips());
    expect(cookies.get).toHaveBeenCalledTimes(1);
    expect(cookies.set).toHaveBeenCalledTimes(1);
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow retrieving 2fa qr codes', async () => {
    jest.clearAllMocks();
    const expectedActions = [{ type: UserConstants.RECEIVED_QR_CODE, value: btoa('test') }];
    const store = mockStore({ ...defaultState });
    await store.dispatch(get2FAQRCode(true));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should verify 2fa codes during 2fa setup', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: UserConstants.SUCCESSFULLY_LOGGED_IN, value: token },
      { type: UserConstants.SET_GLOBAL_SETTINGS, settings: defaultState.users.globalSettings }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(verify2FA({ token2fa: '123456' }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });

  it('should allow logging in', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: UserConstants.SUCCESSFULLY_LOGGED_IN, value: token },
      { type: UserConstants.RECEIVED_USER, user: defaultState.users.byId['a30a780b-b843-5344-80e3-0fd95a4f6fc3'] },
      { type: UserConstants.SET_SHOW_HELP, show: true },
      { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: true }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(loginUser({ email: 'test@example.com', password: 'mysecretpassword' }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow logging out', async () => {
    jest.clearAllMocks();
    const expectedActions = [{ type: UserConstants.USER_LOGOUT }];
    const store = mockStore({ ...defaultState });
    await store.dispatch(logoutUser());
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should not allow logging out with an active upload', async () => {
    jest.clearAllMocks();
    const store = mockStore({ ...defaultState, releases: { ...defaultState.releases, uploadProgress: 42 } });
    await store.dispatch(logoutUser()).catch(() => expect(true).toEqual(true));
  });
  it('should notify on log out if a reason is given', async () => {
    jest.clearAllMocks();
    const expectedActions = [{ type: UserConstants.USER_LOGOUT }, { type: AppConstants.SET_SNACKBAR, snackbar: { message: 'timeout' } }];
    const store = mockStore({ ...defaultState });
    await store.dispatch(logoutUser('timeout'));
    const storeActions = store.getActions();
    // expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow single user retrieval', async () => {
    jest.clearAllMocks();
    const cookies = new Cookies();
    const expectedActions = [
      { type: UserConstants.RECEIVED_USER, user: defaultState.users.byId.a1 },
      { type: UserConstants.SET_SHOW_HELP, show: true },
      { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: true }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(getUser('a1'));
    expect(cookies.set).toHaveBeenCalledTimes(1);
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow user list retrieval', async () => {
    jest.clearAllMocks();
    const expectedActions = [{ type: UserConstants.RECEIVED_USER_LIST, users: defaultState.users.byId }];
    const store = mockStore({ ...defaultState });
    await store.dispatch(getUserList());
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow single user creation', async () => {
    jest.clearAllMocks();
    const createdUser = { email: 'a@b.com', password: 'mysecretpassword' };
    const expectedActions = [
      { type: UserConstants.CREATED_USER, user: createdUser },
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: 'The user was created successfully.' } },
      { type: UserConstants.RECEIVED_USER_LIST, users: defaultState.users.byId }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(createUser(createdUser));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow single user edits', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: UserConstants.UPDATED_USER, userId: 'a1', user: { password: 'mySecretPassword' } },
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: 'The user has been updated.' } }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(editUser('a1', { password: 'mySecretPassword' }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow single user removal', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: UserConstants.REMOVED_USER, userId: 'a1' },
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: 'The user was removed from the system.' } },
      { type: UserConstants.RECEIVED_USER_LIST, users: defaultState.users.byId }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(removeUser('a1'));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow role list retrieval', async () => {
    jest.clearAllMocks();
    const expectedActions = [{ type: UserConstants.RECEIVED_ROLES, rolesById: { ...defaultState.users.rolesById, ...receivedRoles } }];
    const store = mockStore({ ...defaultState });
    await store.dispatch(getRoles());
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow role creation', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: UserConstants.CREATED_ROLE, role: defaultRole, roleId: defaultRole.name },
      { type: UserConstants.RECEIVED_ROLES, rolesById: { ...defaultState.users.rolesById, ...receivedRoles } }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(createRole(defaultRole));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow role edits', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: UserConstants.UPDATED_ROLE, roleId: 'test', role: { name: 'test', groups: [] } },
      { type: UserConstants.RECEIVED_ROLES, rolesById: { ...defaultState.users.rolesById, ...receivedRoles } }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(editRole({ name: 'test', password: 'mySecretPassword', groups: [] }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow role removal', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: UserConstants.REMOVED_ROLE, roleId: 'test' },
      { type: UserConstants.RECEIVED_ROLES, rolesById: { ...defaultState.users.rolesById, ...receivedRoles } }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(removeRole('test'));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow password reset - pt. 1', async () => {
    const store = mockStore({ ...defaultState });
    store.dispatch(passwordResetStart(defaultState.users.byId.a1.email)).then(() => expect(true).toEqual(true));
  });
  it('should allow password reset - pt. 2', async () => {
    const store = mockStore({ ...defaultState });
    store.dispatch(passwordResetComplete('secretHash', 'newPassword')).then(() => expect(true).toEqual(true));
  });
  it('should allow storing global settings without deletion', async () => {
    jest.clearAllMocks();
    const expectedActions = [{ type: UserConstants.SET_GLOBAL_SETTINGS, settings: { ...defaultState.users.globalSettings, ...settings } }];
    const store = mockStore({ ...defaultState });
    await store.dispatch(saveGlobalSettings(settings));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow storing global settings without deletion and with notification', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: UserConstants.SET_GLOBAL_SETTINGS, settings: { ...defaultState.users.globalSettings, ...settings } },
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: 'Settings saved successfully' } }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(saveGlobalSettings(settings, false, true));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow storing user scoped settings', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      {
        type: UserConstants.SET_GLOBAL_SETTINGS,
        settings: { ...defaultState.users.globalSettings, [`${defaultState.users.byId.a1.id}`]: { ...settings } }
      }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(saveUserSettings(settings));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should store the visibility of the announcement shown in the header in a cookie on dismissal', async () => {
    jest.clearAllMocks();
    const cookies = new Cookies();
    const expectedActions = [{ type: AppConstants.SET_ANNOUNCEMENT, announcement: undefined }];
    const store = mockStore({ ...defaultState, app: { ...defaultState.app, hostedAnnouncement: 'something' } });
    await store.dispatch(setHideAnnouncement(true));
    const storeActions = store.getActions();
    expect(cookies.get).toHaveBeenCalledTimes(1);
    expect(cookies.set).toHaveBeenCalledTimes(1);
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
});
