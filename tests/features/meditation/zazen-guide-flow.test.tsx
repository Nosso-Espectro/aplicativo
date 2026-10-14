import { Slot, router } from 'expo-router';
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, BackHandler, Linking, type HardwareBackPressEvent } from 'react-native';
import ZazenRoute from '../../../src/app/meditation/zazen';
import MeditationRoute from '../../../src/app/meditation';
import StartupScreen from '../../../src/app';
import { ZazenGuideScreen } from '../../../src/features/meditation/ZazenGuideScreen';
import { getZazenGuide } from '../../../src/features/meditation/zazen-guide';
import { LowStimulationProvider } from '../../../src/features/regulation/LowStimulationProvider';
import { LowStimulationControl } from '../../../src/features/regulation/LowStimulationControl';
import { SentenceProvider } from '../../../src/features/communication/sentence/SentenceProvider';
import { CustomCardsProvider } from '../../../src/features/communication/custom-cards/CustomCardsProvider';
import { openCardDatabase } from '../../../src/features/communication/storage/card-database';
import { openDisplayPreferencesDatabase } from '../../../src/features/regulation/display-preferences-database';
jest.mock('../../../src/features/communication/storage/card-database', () => ({ openCardDatabase: jest.fn() }));
jest.mock('../../../src/features/regulation/display-preferences-database', () => ({ openDisplayPreferencesDatabase: jest.fn() }));
jest.mock('../../../src/features/communication/custom-cards/local-image-storage', () => ({ localImages: { prune: jest.fn() } }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let back: ((event: HardwareBackPressEvent) => boolean | null | undefined)[];
beforeEach(() => {
  back = [];
  jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Synthetic offline fixture'));
  jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('External links disabled in fixture'));
  jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_type, callback) => { back.push(callback); return { remove: jest.fn() }; });
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  jest.mocked(openCardDatabase).mockResolvedValue({ list: async () => [], listFavorites: async () => [], setFavorite: jest.fn(), save: jest.fn(), remove: jest.fn() });
  jest.mocked(openDisplayPreferencesDatabase).mockResolvedValue({ read: async () => ({ enabled: false }), save: async value => ({ ...value }) });
});
afterEach(() => { expect(global.fetch).not.toHaveBeenCalled(); expect(Linking.openURL).not.toHaveBeenCalled(); jest.restoreAllMocks(); });
function Layout() {
  return <LowStimulationProvider><LowStimulationControl /><SentenceProvider><CustomCardsProvider><Slot /></CustomCardsProvider></SentenceProvider></LowStimulationProvider>;
}
async function mount(initialUrl = '/') {
  const view = renderRouter({ _layout: Layout, index: StartupScreen, meditation: MeditationRoute, 'meditation/zazen': ZazenRoute }, { initialUrl });
  await act(async () => {}); return view;
}
async function press(name: string) { await act(async () => fireEvent.press(screen.getByRole('button', { name }))); }
it('opens the real guide from tools offline, retains mode9 and sentence and never starts a timer', async () => {
  await mount(); await press('Sim');
  await act(async () => fireEvent(screen.getByRole('switch', { name: 'Modo de baixa estimulação' }), 'valueChange', true));
  await press('Abrir ferramentas'); await press('Abrir guia de Zazen');
  for (const name of ['Guia de Zazen', 'Postura', 'Respiração', 'Começar e encerrar', 'Referências']) expect(screen.getByRole('header', { name })).toBeOnTheScreen();
  for (const section of getZazenGuide()!.sections) expect(screen.getByText(section.body)).toBeOnTheScreen();
  expect(screen.getByRole('switch', { name: 'Modo de baixa estimulação' })).toBeChecked();
  expect(screen.queryByRole('button', { name: 'Iniciar prática' })).toBeNull();
  expect(screen.queryByRole('link')).toBeNull();
  await press('Voltar ao quadro'); expect(screen.getByRole('button', { name: 'Remover Sim da posição 1' })).toBeOnTheScreen();
  await press('Abrir ferramentas'); await press('Abrir meditação');
  expect(screen.getByRole('button', { name: 'Iniciar prática' })).toBeOnTheScreen();
  expect(screen.queryByText('Prática em andamento.')).toBeNull();
});
it('returns from a direct guide route using the focused hardware-back fallback and ignores old callbacks', async () => {
  await mount('/meditation/zazen'); expect(screen.getByRole('header', { name: 'Guia de Zazen' })).toBeOnTheScreen();
  const callback = back[back.length - 1]; const event = { type: 'hardwareBackPress', timeStamp: Date.now() };
  await act(async () => { expect(callback(event)).toBe(true); });
  expect(screen.getByRole('header', { name: 'Frase' })).toBeOnTheScreen();
  expect(callback(event)).toBe(false);
  await act(async () => router.push('/meditation/zazen'));
  expect(screen.getByRole('header', { name: 'Postura' })).toBeOnTheScreen();
});
it.each([
  { name: 'absent', content: () => null },
  { name: 'incomplete', content: () => ({ sections: [] }) },
  { name: 'throwing getter', content: () => ({ get introduction(): never { throw new Error('Synthetic private detail'); } }) },
])('shows a neutral unavailable state and exit for $name local content', async ({ content }) => {
  const close = jest.fn();
  const value = content();
  const view = renderRouter({ index: () => <ZazenGuideScreen onClose={close} backLabel="Voltar" content={value} /> });
  await act(async () => {});
  expect(screen.getByText('O guia não está disponível nesta versão.')).toBeOnTheScreen();
  expect(screen.queryByRole('header', { name: 'Postura' })).toBeNull();
  expect(screen.queryByText('Synthetic private detail')).toBeNull();
  await press('Voltar'); expect(close).toHaveBeenCalledTimes(1); view.unmount();
});
it('removes a focused hardware-back callback on unmount instead of navigating from a disposed screen', async () => {
  const close = jest.fn();
  const view = renderRouter({ index: () => <ZazenGuideScreen onClose={close} backLabel="Voltar" /> });
  await act(async () => {}); const callback = back[back.length - 1]; view.unmount();
  expect(callback({ type: 'hardwareBackPress', timeStamp: Date.now() })).toBe(false);
  expect(close).not.toHaveBeenCalled();
});
it('uses the latest exit callback after a focused rerender', async () => {
  const oldClose = jest.fn(); const newClose = jest.fn();
  let update!: (handler: () => void) => void;
  function Route() {
    const [handler, setHandler] = useState<() => void>(() => oldClose);
    useEffect(() => { update = callback => setHandler(() => callback); }, []);
    return <ZazenGuideScreen onClose={handler} backLabel="Voltar" />;
  }
  const view = renderRouter({ index: Route }); await act(async () => {});
  const callback = back[back.length - 1];
  await act(async () => update(newClose));
  await act(async () => { expect(callback({ type: 'hardwareBackPress', timeStamp: Date.now() })).toBe(true); });
  expect(oldClose).not.toHaveBeenCalled(); expect(newClose).toHaveBeenCalledTimes(1); view.unmount();
});
