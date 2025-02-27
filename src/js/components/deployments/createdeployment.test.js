import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

import CreateDeployment from './createdeployment';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('CreateDeployment Component', () => {
  let store;
  let mockState = {
    ...defaultState,
    app: {
      ...defaultState.app,
      features: {
        ...defaultState.features,
        isEnterprise: false,
        isHosted: false
      }
    }
  };

  beforeEach(() => {
    store = mockStore(mockState);
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <CreateDeployment deploymentObject={{}} setDeploymentObject={jest.fn} />
        </Provider>
      </MemoryRouter>
    );
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
