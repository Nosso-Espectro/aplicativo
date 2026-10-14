import { act, fireEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';
import { Slot, router } from 'expo-router';
import { AppState, Text, type AppStateStatus } from 'react-native';
import SoundsRoute from '../../../src/app/regulation-sounds';
import { RegulationSoundsProvider } from '../../../src/features/regulation-sounds/RegulationSoundsProvider';
import { LowStimulationProvider } from '../../../src/features/regulation/LowStimulationProvider';
import { LowStimulationControl } from '../../../src/features/regulation/LowStimulationControl';
import { openDisplayPreferencesDatabase } from '../../../src/features/regulation/display-preferences-database';
import type { SoundEngine, SoundStatus } from '../../../src/features/regulation-sounds/sound-controller';
jest.mock('../../../src/features/regulation/display-preferences-database', () => ({ openDisplayPreferencesDatabase: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
jest.mock('@react-native-community/slider', () => 'Slider');
let status: SoundStatus; let changed: (value: SoundStatus) => void; let engine: SoundEngine;
let listeners: ((value: AppStateStatus) => void)[];
const initialAppState = AppState.currentState;
const factory = async (_id: unknown, callback: (value: SoundStatus) => void) => { changed = callback; return engine; };
function Layout() { return <LowStimulationProvider><LowStimulationControl /><RegulationSoundsProvider factory={factory}><Slot /></RegulationSoundsProvider></LowStimulationProvider>; }
const routes = { _layout: Layout, index: () => <Text>Destino sintético do quadro</Text>, 'regulation-sounds': SoundsRoute };
beforeEach(() => {
  jest.useFakeTimers({ now: 10000 }); listeners = []; AppState.currentState = 'active';
  status = { loaded: true, playing: false, buffering: false, failed: false };
  engine = { configure: jest.fn(async () => {}), play: jest.fn(() => { status = { ...status, playing: true }; changed(status); }),
    pause: jest.fn(() => { status = { ...status, playing: false }; }), volume: jest.fn(), lockScreen: jest.fn(), dispose: jest.fn(), status: () => status };
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_name, callback) => { listeners.push(callback); return { remove: jest.fn() }; });
  jest.mocked(openDisplayPreferencesDatabase).mockResolvedValue({ read: async () => ({ enabled: false }), save: async value => ({ ...value }) });
});
afterEach(() => { AppState.currentState = initialAppState; jest.restoreAllMocks(); jest.useRealTimers(); });
async function press(name: string) { await act(async () => fireEvent.press(screen.getByRole('button', { name }))); }
async function arm() {
  renderRouter(routes, { initialUrl: '/regulation-sounds' }); await act(async () => {});
  await act(async () => fireEvent.press(screen.getByRole('radio', { name: 'Ruído branco' }))); await press('Reproduzir som');
  fireEvent.changeText(screen.getByLabelText('Duração do temporizador do som em minutos'), '1'); await press('Aplicar temporizador do som');
}
it('retains the global deadline across actual Router navigation and expires off-screen without replay', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('synthetic offline'));
  await arm(); await press('Voltar ao quadro'); expect(screen.getByText('Destino sintético do quadro')).toBeOnTheScreen();
  act(() => jest.advanceTimersByTime(60000)); await act(async () => router.push('/regulation-sounds'));
  expect(screen.getByText('Temporizador encerrado. Som pausado.')).toBeOnTheScreen(); expect(engine.play).toHaveBeenCalledTimes(1);
  expect(fetch).not.toHaveBeenCalled();
});
it('keeps mode9 and reconciles background on the actual route without autoresume', async () => {
  await arm(); await act(async () => fireEvent(screen.getByRole('switch', { name: 'Modo de baixa estimulação' }), 'valueChange', true));
  act(() => { for (const callback of listeners) callback('background'); jest.setSystemTime(80000); for (const callback of listeners) callback('active'); });
  expect(screen.getByText('Temporizador encerrado. Som pausado.')).toBeOnTheScreen();
  expect(screen.getByRole('switch', { name: 'Modo de baixa estimulação' })).toBeChecked(); expect(engine.play).toHaveBeenCalledTimes(1);
});
