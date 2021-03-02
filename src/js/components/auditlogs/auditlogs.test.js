import React from 'react';
import { prettyDOM } from '@testing-library/dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import AuditLogs from './auditlogs';
import { defaultState, mockDate, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Auditlogs Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
    const _Date = Date;
    global.Date = jest.fn(() => mockDate);
    global.Date.parse = _Date.parse;
    global.Date.now = _Date.now;
    global.Date.toISOString = _Date.toISOString;
    global.Date.UTC = _Date.UTC;
    global.Date.getUTCFullYear = _Date.getUTCFullYear;
    global.Date.getUTCMonth = _Date.getUTCMonth;
    global.Date.getUTCDate = _Date.getUTCDate;
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <AuditLogs />
        </Provider>
      </MemoryRouter>
    );
    const view = prettyDOM(baseElement.firstChild, 100000, { highlight: false })
      .replace(/id="mui-[0-9]*"/g, '')
      .replace(/aria-labelledby="(mui-[0-9]* *)*"/g, '')
      .replace(/\\/g, '');
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as expected', async () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <AuditLogs />
        </Provider>
      </MemoryRouter>
    );
    userEvent.click(screen.getByText(/last 7 days/i));
    userEvent.click(screen.getByText(/clear filter/i));
    userEvent.click(screen.getByRole('button', { name: /Download results as csv/i }));
    userEvent.click(screen.getByText(/open_terminal/i));
  });

  it('allows navigating by url as expected', async () => {
    const ui = (
      <MemoryRouter initialEntries={['/auditlog?start_date=2020-01-01T00:00:00.000Z']}>
        <Provider store={store}>
          <AuditLogs />
        </Provider>
      </MemoryRouter>
    );
    const { rerender } = render(ui);
    await act(() => waitFor(() => rerender(ui)));
    userEvent.click(screen.getByText(/clear filter/i));
  });
});
