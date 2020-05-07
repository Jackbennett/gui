import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import ExpandedDevice from './expanded-device';
import { undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('ExpandedDevice Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: { docsVersion: null },
      releases: {},
      users: {
        onboarding: { complete: false },
        showHelptips: true
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <ExpandedDevice device={{ status: 'accepted', attributes: [], auth_sets: [] }} attrs={[]} getReleases={jest.fn()} />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
