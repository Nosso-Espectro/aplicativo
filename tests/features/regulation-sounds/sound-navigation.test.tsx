import { useEffect, useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, AppState, Text, type AppStateStatus } from 'react-native';
import RootLayout from '../../../src/app/_layout';
import Board from '../../../src/app';
import SoundRoute from '../../../src/app/regulation-sounds';
import { createExpoSoundEngine } from '../../../src/features/regulation-sounds/expo-sound-engine';
import { openCardDatabase } from '../../../src/features/communication/storage/card-database';
import { openDisplayPreferencesDatabase } from '../../../src/features/regulation/display-preferences-database';
import type { SoundEngine, SoundStatus } from '../../../src/features/regulation-sounds/sound-controller';
jest.mock('../../../src/features/regulation-sounds/expo-sound-engine', () => ({ createExpoSoundEngine: jest.fn() }));
jest.mock('../../../src/features/transition-timer/timer-database', () => ({ openTimerDatabase: async () => ({ read: async () => null, act: jest.fn() }) }));
jest.mock('../../../src/features/communication/storage/card-database', () => ({ openCardDatabase: jest.fn() }));
jest.mock('../../../src/features/communication/custom-cards/local-image-storage', () => ({ localImages: { copy: jest.fn(), remove: jest.fn(), prune: jest.fn() } }));
jest.mock('../../../src/features/regulation/display-preferences-database', () => ({ openDisplayPreferencesDatabase: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
jest.mock('@react-native-community/slider', () => 'Slider');
const mockPush = jest.fn(); const mockBack = jest.fn(); const mockReplace = jest.fn(); let mockHistory = true;
jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({}), useRouter: () => ({ push: mockPush, back: mockBack, replace: mockReplace, canGoBack: () => mockHistory }), Stack: (props: { screenOptions: { animation: string } }) => <MockStack {...props} /> }));
function MockStack({ screenOptions }: { screenOptions: { animation: string } }) {
  const [route, setRoute] = useState('/');
  useEffect(() => { mockPush.mockImplementation(setRoute); mockBack.mockImplementation(() => setRoute('/')); mockReplace.mockImplementation(setRoute); }, []);
  return <><Text>{`Stack:${screenOptions.animation}`}</Text>{route === '/regulation-sounds' ? <SoundRoute /> : <Board />}</>;
}
let appEvent: (state: AppStateStatus) => void; let changed: (status: SoundStatus) => void; let status: SoundStatus; let engine: SoundEngine;
beforeEach(() => {
  jest.clearAllMocks(); mockHistory = true; status = { loaded: true, playing: false, buffering: false, failed: false };
  engine = { configure: jest.fn(async () => {}), play: jest.fn(() => { status.playing = true; changed({ ...status }); }), pause: jest.fn(() => { status.playing = false; }),
    volume: jest.fn(), lockScreen: jest.fn(), dispose: jest.fn(), status: () => ({ ...status }) };
  jest.mocked(createExpoSoundEngine).mockImplementation(async (_id, callback) => { changed = callback; return engine; });
  jest.mocked(openCardDatabase).mockResolvedValue({ list: async () => [], listFavorites: async () => [], setFavorite: async () => [], save: async () => [], remove: async () => [] });
  jest.mocked(openDisplayPreferencesDatabase).mockResolvedValue({ read: async () => ({ enabled: false }), save: async value => ({ ...value }) });
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  jest.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue({ remove: jest.fn() } as unknown as ReturnType<typeof AccessibilityInfo.addEventListener>);
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_name, listener) => { appEvent = listener; return { remove: jest.fn() }; });
});
afterEach(() => { jest.restoreAllMocks(); });
async function press(label: string) { await act(async () => { fireEvent.press(screen.getByRole('button', { name: label })); }); }
async function open() { render(<RootLayout />); await act(async () => { appEvent('active'); }); await press('Abrir sons'); }
it('reaches the actual route and preserves playback/choice/gain across board navigation without another play', async () => {
  await open(); expect(screen.getByRole('header', { name: 'Sons' })).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('radio', { name: 'Ruído marrom' })); await press('Reproduzir som');
  fireEvent(screen.getByLabelText('Volume do som'), 'valueChange', 0); await press('Voltar ao quadro');
  expect(screen.getByRole('header', { name: 'Comunicação' })).toBeOnTheScreen(); await press('Abrir sons');
  expect(screen.getByRole('radio', { name: 'Ruído marrom' })).toBeChecked(); expect(screen.getByText('Volume: 0%')).toBeOnTheScreen();
  expect(screen.getByText('Reproduzindo')).toBeOnTheScreen(); expect(engine.play).toHaveBeenCalledTimes(1); expect(engine.dispose).not.toHaveBeenCalled();
});
it('preserves global low-stimulation mode and the no-animation Stack on the sounds route', async () => {
  await open(); await act(async () => { fireEvent(screen.getByRole('switch', { name: 'Modo de baixa estimulação' }), 'valueChange', true); });
  expect(screen.getByText('Stack:none')).toBeOnTheScreen(); expect(screen.getByRole('switch', { name: 'Modo de baixa estimulação' })).toBeChecked();
  expect(createExpoSoundEngine).not.toHaveBeenCalled();
});
it('returns to communication safely without navigation history', async () => {
  await open(); mockHistory = false; await press('Voltar ao quadro'); expect(mockReplace).toHaveBeenCalledWith('/');
  expect(screen.getByRole('header', { name: 'Comunicação' })).toBeOnTheScreen();
});
