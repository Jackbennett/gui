import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import SelfUserManagement from './selfusermanagement';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('SelfUserManagement Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <SelfUserManagement />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    store = mockStore({ ...defaultState, app: { ...defaultState.app, features: { ...defaultState.app.features, isEnterprise: true } } });

    const copyCheck = jest.fn(() => true);
    document.execCommand = copyCheck;
    render(
      <Provider store={store}>
        <SelfUserManagement />
      </Provider>
    );

    userEvent.click(screen.getByRole('button', { name: /email/i }));
    const input = screen.getByDisplayValue(defaultState.users.byId.a1.email);
    userEvent.clear(input);
    userEvent.type(input, 'test@test');
    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
    userEvent.type(input, '.com');
    expect(screen.queryByText(/enter a valid email address/i)).not.toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    userEvent.click(screen.getByRole('button', { name: /change password/i }));
    const passwordGeneration = screen.getByRole('button', { name: /generate/i });
    userEvent.click(passwordGeneration);
    expect(copyCheck).toHaveBeenCalled();
    userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    userEvent.click(screen.getByText(/Enable Two Factor authentication/i));
    expect(screen.getByText(/Scan the QR code on the right/i)).toBeInTheDocument();
    userEvent.type(screen.getByPlaceholderText(/Verification code/i), '1234');
    expect(screen.getByText(/Must be at least 6 characters long/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Verify/i })).toBeDisabled();
    userEvent.type(screen.getByPlaceholderText(/Verification code/i), '56');
    expect(screen.getByRole('button', { name: /Verify/i })).not.toBeDisabled();
    expect(screen.queryByText(/Must be at least 6 characters long/i)).not.toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: /Verify/i }));
    userEvent.click(screen.getByRole('button', { name: /Save/i }));
  });
});
