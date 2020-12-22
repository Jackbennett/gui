import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import BaseOnboardingTip, { orientations } from './baseonboardingtip';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('BaseOnboardingTip Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <BaseOnboardingTip anchor={{ left: 1, top: 1, right: 1, bottom: 1 }} component={<div />} id="test" />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });

  it('calculates offsets depending on icon width', () => {
    const expectedOrientation = {
      top: { top: 0, left: -15 },
      right: { top: -15, left: 15 },
      bottom: { top: 0, left: -15 },
      left: { top: -15, left: 0 }
    };
    Object.entries(orientations).forEach(([direction, orientation]) => {
      const { top, left } = orientation.offsetStyle({ top: 0, left: 0 });
      expect(top).toEqual(expectedOrientation[direction].top);
      expect(left).toEqual(expectedOrientation[direction].left);
    });
  });
});
