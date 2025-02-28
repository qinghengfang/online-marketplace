import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import App from '../src/components/App';
import React from 'react';

describe('App', () => {

  const mockStore = configureStore();
  const store = mockStore({
    user: {
      idTokenClaims: {
        "id":"1"
      },
      accessToken: '2'
    },
  });

  it('Check id token renders', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    screen.debug();

    expect(screen.getByText((content) => content.indexOf('{"id":"1"}') > 0));
  });
});