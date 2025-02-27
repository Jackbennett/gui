import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import ExpandedDevice from './expanded-device';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('ExpandedDevice Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          hasDeviceConfig: true,
          hasDeviceConnect: true,
          hasMultitenancy: true,
          isHosted: true
        }
      },
      users: {
        ...defaultState.users,
        onboarding: {
          ...defaultState.onboarding,
          complete: false
        }
      }
    });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <ExpandedDevice device={{ id: 'a1', status: 'accepted', attributes: [], auth_sets: [] }} attrs={[]} />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
