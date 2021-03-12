import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KeyValueEditor from './keyvalueeditor';
import { undefineds } from '../../../../../tests/mockData';

describe('KeyValueEditor Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <KeyValueEditor deviceLimitWarning={<div>I should not be rendered/ undefined</div>} limitMaxed={false} onSubmit={jest.fn} onCancel={jest.fn} />
    );
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const submitMock = jest.fn();

    const ui = <KeyValueEditor onInputChange={submitMock} />;
    render(ui);
    userEvent.type(screen.getByPlaceholderText(/key/i), 'testKey');
    userEvent.type(screen.getByPlaceholderText(/value/i), 'testValue');
    expect(document.querySelector('.MuiFab-root')).not.toBeDisabled();
    userEvent.click(document.querySelector('.MuiFab-root'));
    expect(submitMock).toHaveBeenLastCalledWith({ testKey: 'testValue' });
    userEvent.type(screen.getByDisplayValue('testValue'), 's');
    expect(submitMock).toHaveBeenLastCalledWith({ testKey: 'testValues' });
  });

  it('warns of duplicate keys', async () => {
    const ui = <KeyValueEditor onInputChange={jest.fn} />;
    render(ui);
    userEvent.type(screen.getByPlaceholderText(/key/i), 'testKey');
    userEvent.type(screen.getByPlaceholderText(/value/i), 'testValue');
    userEvent.click(document.querySelector('.MuiFab-root'));
    userEvent.type(screen.getAllByPlaceholderText(/key/i)[1], 'testKey');
    userEvent.type(screen.getAllByPlaceholderText(/value/i)[1], 'testValue2');
    expect(screen.getByText(/Duplicate keys exist/i)).toBeInTheDocument();
  });

  it('forwards a warning', async () => {
    const ui = <KeyValueEditor errortext="I should be rendered" onInputChange={jest.fn} />;
    render(ui);
    userEvent.type(screen.getByPlaceholderText(/key/i), 'testKey');
    userEvent.type(screen.getByPlaceholderText(/value/i), 'testValue');
    expect(screen.getByText(/I should be rendered/i)).toBeInTheDocument();
  });

  it('displays tooltips when keys match', async () => {
    const TestComponent = () => <div>testthing</div>;
    const helptipsMap = {
      timezone: {
        component: TestComponent
      }
    };

    const ui = <KeyValueEditor inputHelpTipsMap={helptipsMap} onInputChange={jest.fn} showHelptips={true} />;
    render(ui);
    userEvent.type(screen.getByPlaceholderText(/key/i), 'timezon');
    expect(screen.queryByText(/testthing/i)).not.toBeInTheDocument();
    userEvent.type(screen.getByPlaceholderText(/key/i), 'e');
    expect(screen.getByText(/testthing/i)).toBeInTheDocument();
  });
});
