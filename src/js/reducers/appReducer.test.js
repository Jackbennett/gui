import reducer, { initialState } from './appReducer';
import * as AppConstants from '../constants/appConstants';

describe('app reducer', () => {
  it('should return the initial state', async () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle SET_SNACKBAR', async () => {
    expect(
      reducer(undefined, {
        type: AppConstants.SET_SNACKBAR,
        snackbar: { open: true, message: 'Run the tests' }
      }).snackbar
    ).toEqual({
      open: true,
      message: 'Run the tests'
    });

    expect(
      reducer(initialState, {
        type: AppConstants.SET_SNACKBAR,
        snackbar: { open: true, message: 'Run the tests' }
      }).snackbar
    ).toEqual({
      open: true,
      message: 'Run the tests'
    });
  });

  it('should handle SET_FIRST_LOGIN_AFTER_SIGNUP', async () => {
    expect(
      reducer(undefined, {
        type: AppConstants.SET_FIRST_LOGIN_AFTER_SIGNUP,
        firstLoginAfterSignup: true
      }).firstLoginAfterSignup
    ).toEqual(true);

    expect(
      reducer(initialState, {
        type: AppConstants.SET_FIRST_LOGIN_AFTER_SIGNUP,
        firstLoginAfterSignup: false
      }).firstLoginAfterSignup
    ).toEqual(false);
  });
  it('should handle SET_ANNOUNCEMENT', async () => {
    expect(reducer(undefined, { type: AppConstants.SET_ANNOUNCEMENT, announcement: 'something' }).hostedAnnouncement).toEqual('something');
    expect(reducer(initialState, { type: AppConstants.SET_ANNOUNCEMENT, announcement: undefined }).hostedAnnouncement).toEqual(undefined);
  });

  it('should handle UPLOAD_PROGRESS', async () => {
    const { uploading, uploadProgress } = reducer(undefined, {
      type: AppConstants.UPLOAD_PROGRESS,
      inprogress: true,
      uploadProgress: 40
    });
    expect({ uploading, uploadProgress }).toEqual({
      uploading: true,
      uploadProgress: 40
    });

    const { uploading: uploading2, uploadProgress: uploadProgress2 } = reducer(initialState, {
      type: AppConstants.UPLOAD_PROGRESS,
      inprogress: true,
      uploadProgress: 40
    });
    expect({ uploading: uploading2, uploadProgress: uploadProgress2 }).toEqual({
      uploading: true,
      uploadProgress: 40
    });
  });
});
