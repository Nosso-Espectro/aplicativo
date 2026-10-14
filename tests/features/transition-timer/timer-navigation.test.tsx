import { useEffect, useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, AppState, Text } from 'react-native';
import RootLayout from '../../../src/app/_layout';
import StartupScreen from '../../../src/app';
import TimerRoute from '../../../src/app/transition-timer';
import { openTimerDatabase, type TimerAction } from '../../../src/features/transition-timer/timer-database';
import { startTimer, type TimerSession } from '../../../src/features/transition-timer/visual-timer';
import { versionedTimerFixture } from './versioned-timer-fixture';
import { openCardDatabase } from '../../../src/features/communication/storage/card-database';
import { openDisplayPreferencesDatabase } from '../../../src/features/regulation/display-preferences-database';
jest.mock('../../../src/features/transition-timer/timer-database', () => ({ openTimerDatabase: jest.fn() }));
jest.mock('../../../src/features/communication/storage/card-database', () => ({ openCardDatabase: jest.fn() }));
jest.mock('../../../src/features/communication/custom-cards/local-image-storage', () => ({ localImages: { copy: jest.fn(), remove: jest.fn(), prune: jest.fn() } }));
jest.mock('../../../src/features/regulation/display-preferences-database', () => ({ openDisplayPreferencesDatabase: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
const mockPush = jest.fn(); const mockBack = jest.fn(); const mockReplace = jest.fn(); let mockHasHistory = true;
jest.mock('expo-router', () => ({
  useFocusEffect: (effect: () => void) => jest.requireActual('react').useEffect(effect, [effect]),
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ push: mockPush, back: mockBack, replace: mockReplace, canGoBack: () => mockHasHistory }),
  Stack: (props: { screenOptions: { animation: string } }) => <MockStack {...props} />,
}));
function MockStack({ screenOptions }: { screenOptions: { animation: string } }) {
  const [route, setRoute] = useState('/');
  useEffect(() => { mockPush.mockImplementation(setRoute); mockBack.mockImplementation(() => setRoute('/')); mockReplace.mockImplementation(setRoute); }, []);
  return <><Text>{`Stack:${screenOptions.animation}`}</Text>{route === '/transition-timer' ? <TimerRoute /> : <StartupScreen />}</>;
}
let stored: TimerSession | null;
const operation = jest.fn();
beforeEach(() => {
  jest.clearAllMocks(); jest.useFakeTimers({ now: 10000 }); stored = null; mockHasHistory = true;
  jest.mocked(openTimerDatabase).mockResolvedValue(versionedTimerFixture(async () => stored && { ...stored }, operation));
  operation.mockReset().mockImplementation(async (action: TimerAction, nowMs: number) => { stored = action.type === 'start' ? startTimer(action.durationMs, nowMs) : null; return stored && { ...stored }; });
  jest.mocked(openCardDatabase).mockResolvedValue({ list: async () => [], listFavorites: async () => [], setFavorite: async () => [], save: async () => [], remove: async () => [] });
  jest.mocked(openDisplayPreferencesDatabase).mockResolvedValue({ read: async () => ({ enabled: false }), save: async (value) => ({ ...value }) });
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  jest.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue({ remove: jest.fn() } as unknown as ReturnType<typeof AccessibilityInfo.addEventListener>);
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
});
afterEach(() => { jest.restoreAllMocks(); jest.useRealTimers(); });
async function press(name: string) { await act(async () => { fireEvent.press(screen.getByRole('button', { name })); }); }
it('reaches the real route from the board and retains countdown while navigating back and returning', async () => {
  render(<RootLayout />); await act(async () => {});
  await press('Abrir timer de transição'); expect(screen.getByRole('header', { name: 'Timer de transição' })).toBeOnTheScreen();
  fireEvent.changeText(screen.getByLabelText('Minutos do timer'), '1'); await press('Iniciar timer');
  await press('Voltar ao quadro'); expect(screen.getByRole('header', { name: 'Frase' })).toBeOnTheScreen();
  act(() => jest.advanceTimersByTime(15000)); await press('Abrir timer de transição');
  expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ max: 60, now: 45 }); expect(operation).toHaveBeenCalledTimes(1);
});
it('preserves the global low-stimulation mode, Stack animation and timer session across route changes', async () => {
  render(<RootLayout />); await act(async () => {});
  await act(async () => { fireEvent(screen.getByRole('switch', { name: 'Modo de baixa estimulação' }), 'valueChange', true); });
  await press('Abrir timer de transição'); expect(screen.getByText('Stack:none')).toBeOnTheScreen();
  fireEvent.changeText(screen.getByLabelText('Segundos do timer'), '30'); await press('Iniciar timer');
  await press('Voltar ao quadro'); await press('Abrir timer de transição');
  expect(screen.getByRole('switch', { name: 'Modo de baixa estimulação' })).toBeChecked();
  expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ max: 30, now: 30 });
});
it('returns safely to the board when the timer is opened without navigation history', async () => {
  render(<RootLayout />); await act(async () => {}); await press('Abrir timer de transição'); mockHasHistory = false;
  await press('Voltar ao quadro'); expect(mockReplace).toHaveBeenCalledWith('/');
  expect(screen.getByRole('header', { name: 'Frase' })).toBeOnTheScreen();
});
