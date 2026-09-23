import { renderRouter, screen } from 'expo-router/testing-library';
import StartupScreen from '../../src/app';
import RootLayout from '../../src/app/_layout';

describe('app bootstrap', () => {
  it('opens the root route with an accessible startup heading', async () => {
    const { getPathname } = renderRouter(
      { _layout: RootLayout, index: StartupScreen },
      { initialUrl: '/' },
    );

    expect(await screen.findByRole('header', { name: 'TEAr' })).toBeOnTheScreen();
    expect(getPathname()).toBe('/');
  });
});
