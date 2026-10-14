import { act, waitFor } from '@testing-library/react-native';
import { renderRouter, screen, fireEvent } from 'expo-router/testing-library';
import { Slot, router } from 'expo-router';
import { AccessibilityInfo, Linking } from 'react-native';
import { setStringAsync, getStringAsync, addClipboardListener } from 'expo-clipboard';
import StartupScreen from '../../../src/app';
import ScriptsRoute from '../../../src/app/scripts';
import ScriptsLayout from '../../../src/app/scripts/_layout';
import { ScriptCatalogScreen } from '../../../src/features/communication-scripts/ScriptCatalogScreen';
import { initialScripts, scriptCategories } from '../../../src/features/communication-scripts/script-catalog';
import { LowStimulationProvider } from '../../../src/features/regulation/LowStimulationProvider';
import { LowStimulationControl } from '../../../src/features/regulation/LowStimulationControl';
import { SentenceProvider } from '../../../src/features/communication/sentence/SentenceProvider';
import { CustomCardsProvider } from '../../../src/features/communication/custom-cards/CustomCardsProvider';
import { openCardDatabase } from '../../../src/features/communication/storage/card-database';
import { openDisplayPreferencesDatabase } from '../../../src/features/regulation/display-preferences-database';
import { localSpeech } from '../../../src/features/communication/speech/local-speech';
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(), getStringAsync: jest.fn(), addClipboardListener: jest.fn(), StringFormat: { PLAIN_TEXT: 'plainText' } }));
jest.mock('../../../src/features/communication/storage/card-database', () => ({ openCardDatabase: jest.fn() }));
jest.mock('../../../src/features/regulation/display-preferences-database', () => ({ openDisplayPreferencesDatabase: jest.fn() }));
jest.mock('../../../src/features/communication/custom-cards/local-image-storage', () => ({ localImages: { prune: jest.fn() } }));
jest.mock('../../../src/features/communication/speech/local-speech', () => ({ localSpeech: { isAvailable: jest.fn(), speak: jest.fn(), stop: jest.fn() } }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
function GlobalLayout() {
  return <LowStimulationProvider><LowStimulationControl /><SentenceProvider><CustomCardsProvider><Slot /></CustomCardsProvider></SentenceProvider></LowStimulationProvider>;
}
const routes = { _layout: GlobalLayout, index: StartupScreen, 'scripts/_layout': ScriptsLayout, 'scripts/index': ScriptsRoute };
beforeEach(() => {
  jest.clearAllMocks(); jest.mocked(setStringAsync).mockResolvedValue(true);
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  jest.mocked(openCardDatabase).mockResolvedValue({ list: async () => [], listFavorites: async () => [], setFavorite: jest.fn(), save: jest.fn(), remove: jest.fn() });
  jest.mocked(openDisplayPreferencesDatabase).mockResolvedValue({ read: async () => ({ enabled: false }), save: async value => ({ ...value }) });
});
afterEach(() => jest.restoreAllMocks());
async function mount(initialUrl = '/scripts', override = ScriptsRoute) {
  const view = renderRouter({ ...routes, 'scripts/index': override }, { initialUrl }); await act(async () => {}); return view;
}
async function press(name: string) { await act(async () => fireEvent.press(screen.getByRole('button', { name }))); }
const copyLabel = `Copiar script: ${initialScripts[0].text}`;
it('opens the real route from the board, filters the catalog and copies each literal script offline with one touch', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  const view = await mount('/'); await press('Abrir scripts de comunicação'); expect(view.getPathname()).toBe('/scripts');
  expect(setStringAsync).not.toHaveBeenCalled(); expect(screen.getAllByRole('button', { name: /^Copiar script:/ })).toHaveLength(5);
  for (const [index, category] of scriptCategories.entries()) {
    await press(category.label); expect(screen.getByRole('button', { name: category.label, selected: true })).toBeOnTheScreen();
    expect(screen.getAllByRole('button', { name: /^Copiar script:/ })).toHaveLength(1);
    await press(`Copiar script: ${initialScripts[index].text}`); await screen.findByText('Script copiado.');
    expect(setStringAsync).toHaveBeenLastCalledWith(initialScripts[index].text, { inputFormat: 'plainText' });
  }
  await press('Todos'); expect(screen.getAllByRole('button', { name: /^Copiar script:/ })).toHaveLength(5);
  expect(fetch).not.toHaveBeenCalled(); expect(getStringAsync).not.toHaveBeenCalled(); expect(addClipboardListener).not.toHaveBeenCalled();
  expect(localSpeech.speak).not.toHaveBeenCalled(); expect(Linking.openURL).not.toHaveBeenCalled();
});
it('does not claim success while a copy is pending and refuses duplicate presses, but permits leaving', async () => {
  let release!: (value: boolean) => void;
  jest.mocked(setStringAsync).mockImplementationOnce(() => new Promise(resolve => { release = resolve; }));
  await mount(); await press(copyLabel); const button = screen.getByRole('button', { name: copyLabel });
  expect(button).toBeDisabled(); fireEvent.press(button); expect(setStringAsync).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('Script copiado.')).toBeNull(); expect(screen.getByText('Copiando...')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Voltar ao quadro' })).toBeEnabled();
  await act(async () => release(true)); await screen.findByText('Script copiado.');
});
it('retains the catalog on false or rejected writes, hides raw errors and succeeds only on explicit retry', async () => {
  jest.mocked(setStringAsync).mockResolvedValueOnce(false).mockRejectedValueOnce(new Error('synthetic private detail'));
  await mount(); await press(copyLabel); await screen.findByText('Não foi possível copiar. Tente novamente.');
  expect(screen.queryByText('Script copiado.')).toBeNull(); await press(copyLabel);
  await screen.findByText('Não foi possível copiar. Tente novamente.'); expect(screen.queryByText('synthetic private detail')).toBeNull();
  await press(copyLabel); await screen.findByText('Script copiado.'); expect(setStringAsync).toHaveBeenCalledTimes(3);
});
it('ignores late copy feedback after exiting or unmounting and returns safely with no history', async () => {
  let release!: (value: boolean) => void;
  jest.mocked(setStringAsync).mockImplementationOnce(() => new Promise(resolve => { release = resolve; }));
  const view = await mount(); await press(copyLabel); await press('Voltar ao quadro'); expect(view.getPathname()).toBe('/');
  await act(async () => release(true)); await press('Abrir scripts de comunicação');
  expect(screen.queryByText('Script copiado.')).toBeNull(); expect(screen.getByRole('button', { name: copyLabel })).toBeEnabled();
  jest.mocked(setStringAsync).mockImplementationOnce(() => new Promise(resolve => { release = resolve; }));
  await press(copyLabel); view.unmount(); await act(async () => release(false)); await mount();
  expect(screen.queryByText('Não foi possível copiar. Tente novamente.')).toBeNull();
});
it('discards stale copy feedback when navigating back and reentering before the write finishes', async () => {
  let release!: (value: boolean) => void;
  jest.mocked(setStringAsync).mockImplementationOnce(() => new Promise(resolve => { release = resolve; }));
  const view = await mount('/'); await press('Abrir scripts de comunicação'); await press(copyLabel);
  await act(async () => router.back()); expect(view.getPathname()).toBe('/'); await press('Abrir scripts de comunicação');
  await act(async () => release(true)); expect(screen.queryByText('Script copiado.')).toBeNull();
  await press(copyLabel); await screen.findByText('Script copiado.');
});
it('shows a neutral empty catalog and keeps fallback navigation available', async () => {
  function Empty() { return <ScriptCatalogScreen scripts={[]} onClose={() => router.replace('/')} />; }
  const view = await mount('/scripts', Empty); expect(screen.getByText('Nenhum script disponível nesta categoria.')).toBeOnTheScreen();
  expect(screen.queryAllByRole('button', { name: /^Copiar script:/ })).toHaveLength(0); expect(setStringAsync).not.toHaveBeenCalled();
  await press('Voltar ao quadro'); expect(view.getPathname()).toBe('/');
});
it('preserves global low stimulation and ignores supplied text params instead of copying unchosen input', async () => {
  const view = await mount('/scripts?text=synthetic-unselected'); const toggle = screen.getByRole('switch', { name: 'Modo de baixa estimulação' });
  await act(async () => fireEvent(toggle, 'valueChange', true)); await waitFor(() => expect(toggle).toBeChecked());
  expect(setStringAsync).not.toHaveBeenCalled(); expect(screen.queryByText('synthetic-unselected')).toBeNull();
  await press(copyLabel); await press('Voltar ao quadro'); expect(view.getPathname()).toBe('/');
  await press('Abrir scripts de comunicação'); expect(screen.getByRole('switch', { name: 'Modo de baixa estimulação' })).toBeChecked();
  expect(localSpeech.speak).not.toHaveBeenCalled(); expect(Linking.openURL).not.toHaveBeenCalled();
});
