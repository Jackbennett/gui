import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Login from './login';
import { undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Login Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: { features: { isHosted: false } },
      users: {
        byId: {},
        currentUser: null,
        globalSettings: {},
        onboarding: {
          complete: false,
          showTips: false
        },
        showHelptips: false
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <Provider store={store}>
            <Login location={{ state: { from: '' } }} />
          </Provider>
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
