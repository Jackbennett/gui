import reducer, { initialState } from './releaseReducer';
import * as ReleaseConstants from '../constants/releaseConstants';
const testRelease = {
  Artifacts: [
    {
      id: '123',
      name: 'test',
      description: '-',
      device_types_compatible: ['test'],
      updates: [{ files: [{ size: 123, name: '' }], type_info: { type: 'rootfs-image' } }],
      url: ''
    }
  ],
  device_types_compatible: ['test'],
  Name: 'test'
};
describe('release reducer', () => {
  it('should return the initial state', async () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should handle UPDATED_ARTIFACT', async () => {
    expect(
      reducer(undefined, {
        type: ReleaseConstants.UPDATED_ARTIFACT,
        release: { ...testRelease, Artifacts: [{ ...testRelease.Artifacts[0], name: 'testUpdated' }] }
      }).byId[testRelease.Name].Artifacts
    ).toEqual([{ ...testRelease.Artifacts[0], name: 'testUpdated' }]);
    expect(
      reducer(initialState, {
        type: ReleaseConstants.UPDATED_ARTIFACT,
        release: { ...testRelease, Artifacts: [{ ...testRelease.Artifacts[0], name: 'testUpdated' }] }
      }).byId[testRelease.Name].Artifacts
    ).toEqual([{ ...testRelease.Artifacts[0], name: 'testUpdated' }]);
  });
  it('should handle ARTIFACTS_SET_ARTIFACT_URL', async () => {
    expect(
      reducer(undefined, {
        type: ReleaseConstants.ARTIFACTS_SET_ARTIFACT_URL,
        release: { ...testRelease, Artifacts: [{ ...testRelease.Artifacts[0], url: 'testUpdated' }] }
      }).byId[testRelease.Name].Artifacts
    ).toEqual([{ ...testRelease.Artifacts[0], url: 'testUpdated' }]);
    expect(
      reducer(initialState, {
        type: ReleaseConstants.ARTIFACTS_SET_ARTIFACT_URL,
        release: { ...testRelease, Artifacts: [{ ...testRelease.Artifacts[0], url: 'testUpdated' }] }
      }).byId[testRelease.Name].Artifacts
    ).toEqual([{ ...testRelease.Artifacts[0], url: 'testUpdated' }]);
  });
  it('should handle ARTIFACTS_REMOVED_ARTIFACT', async () => {
    expect(
      reducer(undefined, { type: ReleaseConstants.ARTIFACTS_REMOVED_ARTIFACT, release: { ...testRelease, Artifacts: [] } }).byId[testRelease.Name].Artifacts
    ).toEqual([]);
    expect(
      reducer(initialState, { type: ReleaseConstants.ARTIFACTS_REMOVED_ARTIFACT, release: { ...testRelease, Artifacts: [] } }).byId[testRelease.Name].Artifacts
    ).toEqual([]);
  });
  it('should handle RECEIVE_RELEASE', async () => {
    expect(reducer(undefined, { type: ReleaseConstants.RECEIVE_RELEASE, release: { ...testRelease, Name: 'test2' } }).byId.test2).toEqual({
      ...testRelease,
      Name: 'test2'
    });
    expect(reducer(initialState, { type: ReleaseConstants.RECEIVE_RELEASE, release: { ...testRelease, Name: 'test2' } }).byId.test2).toEqual({
      ...testRelease,
      Name: 'test2'
    });
  });
  it('should handle RECEIVE_RELEASES', async () => {
    expect(
      reducer(undefined, { type: ReleaseConstants.RECEIVE_RELEASES, releases: { test: testRelease, test2: { ...testRelease, Name: 'test2' } } }).byId
    ).toEqual({ test: testRelease, test2: { ...testRelease, Name: 'test2' } });
    expect(
      reducer(initialState, { type: ReleaseConstants.RECEIVE_RELEASES, releases: { test: testRelease, test2: { ...testRelease, Name: 'test2' } } }).byId
    ).toEqual({ test: testRelease, test2: { ...testRelease, Name: 'test2' } });
  });
  it('should handle RELEASE_REMOVED', async () => {
    expect(reducer(undefined, { type: ReleaseConstants.RELEASE_REMOVED, release: 'test' }).byId).toEqual({});
    expect(reducer({ ...initialState, byId: { test: testRelease } }, { type: ReleaseConstants.RELEASE_REMOVED, release: 'test' }).byId).toEqual({});
    expect(
      reducer({ ...initialState, byId: { test: testRelease }, selectedRelease: 'test' }, { type: ReleaseConstants.RELEASE_REMOVED, release: 'test' })
        .selectedRelease
    ).toEqual(undefined);
    expect(
      reducer(
        { ...initialState, byId: { test: testRelease, test2: testRelease }, selectedRelease: 'test' },
        { type: ReleaseConstants.RELEASE_REMOVED, release: 'test' }
      ).selectedRelease
    ).toEqual('test2');
  });
  it('should handle SHOW_REMOVE_DIALOG', async () => {
    expect(reducer(undefined, { type: ReleaseConstants.SHOW_REMOVE_DIALOG, showRemoveDialog: true }).showRemoveDialog).toEqual(true);
    expect(reducer(initialState, { type: ReleaseConstants.SHOW_REMOVE_DIALOG, showRemoveDialog: true }).showRemoveDialog).toEqual(true);
  });
  it('should handle SELECTED_ARTIFACT', async () => {
    expect(reducer(undefined, { type: ReleaseConstants.SELECTED_ARTIFACT, artifact: testRelease.Artifacts[0] }).selectedArtifact.name).toEqual('test');
    expect(reducer(initialState, { type: ReleaseConstants.SELECTED_ARTIFACT, artifact: testRelease.Artifacts[0] }).selectedArtifact.name).toEqual('test');
  });
  it('should handle SELECTED_RELEASE', async () => {
    expect(reducer(undefined, { type: ReleaseConstants.SELECTED_RELEASE, release: 'test' }).selectedRelease).toEqual('test');
    expect(reducer(initialState, { type: ReleaseConstants.SELECTED_RELEASE, release: 'test' }).selectedRelease).toEqual('test');
  });
  it('should handle SET_RELEASES_LIST_STATE', async () => {
    expect(reducer(undefined, { type: ReleaseConstants.SET_RELEASES_LIST_STATE, value: { something: 'special' } }).releasesList).toEqual({
      something: 'special'
    });
    expect(reducer(initialState, { type: ReleaseConstants.SET_RELEASES_LIST_STATE, value: { something: 'special' } }).releasesList).toEqual({
      something: 'special'
    });
  });
});
