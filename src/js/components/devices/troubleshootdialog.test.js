import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import TroubleshootDialog from './troubleshootdialog';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('TroubleshootDialog Component', () => {
  let store;
  let socketSpyFactory;
  let socketSpy;
  const oldMatchMedia = window.matchMedia;

  beforeEach(() => {
    store = mockStore({ ...defaultState });
    socketSpyFactory = jest.spyOn(window, 'WebSocket');
    socketSpyFactory.mockImplementation(() => {
      socketSpy = {
        close: () => {},
        send: () => {}
      };
      return socketSpy;
    });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      }))
    });
  });

  afterEach(() => {
    socketSpyFactory.mockReset();
    window.matchMedia = oldMatchMedia;
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <TroubleshootDialog onCancel={jest.fn} onSocketClose={jest.fn} open={true} />
        </Provider>
      </MemoryRouter>
    );
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
