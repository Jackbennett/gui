import React from 'react';
import renderer from 'react-test-renderer';
import DeviceListItem from './devicelistitem';
import { undefineds } from '../../../../tests/mockData';

describe('DeviceListItem Component', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(<DeviceListItem device={{ id: 1 }} columnHeaders={[{ render: item => item }]} globalSettings={{ id_attribute: 'Device ID' }} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
