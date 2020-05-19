import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Artifacts from './artifacts';
import { undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Artifacts Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      devices: {
        byId: {},
        byStatus: {
          accepted: {
            deviceIds: []
          }
        }
      },
      releases: {
        byId: {},
        selectedArtifact: null,
        selectedRelease: null,
        showRemoveDialog: false,
        uploadProgress: 0
      },
      users: {
        onboarding: {
          complete: false
        }
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <Provider store={store}>
            <Artifacts />
          </Provider>
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
