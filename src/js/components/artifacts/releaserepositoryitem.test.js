import React from 'react';
import { render } from '@testing-library/react';
import ReleaseRepositoryItem from './releaserepositoryitem';
import { undefineds } from '../../../../tests/mockData';

describe('ReleaseRepositoryItem Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <ReleaseRepositoryItem artifact={{ device_types_compatible: ['test-type'], updates: [], modified: '2019-01-01' }} onExpanded={() => {}} />
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
