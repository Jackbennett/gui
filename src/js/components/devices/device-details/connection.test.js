import React from 'react';
import { render } from '@testing-library/react';
import DeviceConnection from './connection';
import { defaultState, undefineds } from '../../../../../tests/mockData';
import { DEVICE_CONNECT_STATES } from '../../../constants/deviceConstants';

describe('DeviceConnection Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeviceConnection device={defaultState.devices.byId.a1} setSnackbar={jest.fn} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
  it('renders correctly when disconnected', async () => {
    const { baseElement } = render(
      <DeviceConnection device={{ ...defaultState.devices.byId.a1, connect_status: DEVICE_CONNECT_STATES.disconnected }} setSnackbar={jest.fn} />
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
  it('renders correctly when connected', async () => {
    const { baseElement } = render(
      <DeviceConnection device={{ ...defaultState.devices.byId.a1, connect_status: DEVICE_CONNECT_STATES.connected }} setSnackbar={jest.fn} />
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
