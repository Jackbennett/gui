import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import SelectedArtifact, { transformArtifactCapabilities, transformArtifactMetadata } from './selectedartifact';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('SelectedArtifact Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <SelectedArtifact artifact={{ description: 'text' }} />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});

describe('transformArtifactCapabilities', () => {
  it('works as expected', async () => {
    expect(transformArtifactCapabilities(defaultState.releases.byId.r1.Artifacts[0].artifact_provides)).toEqual([
      { key: 'artifact_name', primary: 'artifact_name', secondary: 'myapp' },
      { key: 'data-partition.myapp.version', primary: 'data-partition.myapp.version', secondary: 'v2020.10' },
      { key: 'list_of_fancy-1', primary: 'list_of_fancy-1', secondary: 'qemux86-64' },
      { key: 'list_of_fancy-2', primary: 'list_of_fancy-2', secondary: 'x172' }
    ]);
    expect(transformArtifactCapabilities(defaultState.releases.byId.r1.Artifacts[0].clears_artifact_provides)).toEqual([
      { key: '0', primary: '0', secondary: 'data-partition.myapp.*' }
    ]);
    expect(transformArtifactCapabilities(defaultState.releases.byId.r1.Artifacts[0].artifact_depends)).toEqual([]);
  });
});
describe('transformArtifactMetadata', () => {
  it('works as expected', async () => {
    expect(transformArtifactMetadata({ thing: 'thang', more: ['like', 'a', 'list'], or: { anObject: true }, less: undefined })).toEqual([
      { key: 'thing', primary: 'thing', secondary: 'thang', secondaryTypographyProps: { component: 'div' } },
      { key: 'more', primary: 'more', secondary: 'like,a,list', secondaryTypographyProps: { component: 'div' } },
      { key: 'or', primary: 'or', secondary: '{"anObject":true}', secondaryTypographyProps: { component: 'div' } },
      { key: 'less', primary: 'less', secondary: '-', secondaryTypographyProps: { component: 'div' } }
    ]);
  });
});
