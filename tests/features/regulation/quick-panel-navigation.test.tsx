import { act } from '@testing-library/react-native';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo } from 'react-native';
import Board from '../../../src/app';
import RootLayout from '../../../src/app/_layout';
import Panel from '../../../src/app/regulation';
import Sounds from '../../../src/app/regulation-sounds';
import Timer from '../../../src/app/transition-timer';
import Contact from '../../../src/app/trusted-contact';
import { openCardDatabase } from '../../../src/features/communication/storage/card-database';
import { openDisplayPreferencesDatabase } from '../../../src/features/regulation/display-preferences-database';
import { openTimerDatabase } from '../../../src/features/transition-timer/timer-database';
import { startTimer } from '../../../src/features/transition-timer/visual-timer';
import { versionedTimerFixture } from '../transition-timer/versioned-timer-fixture';
import { openTrustedContactDatabase } from '../../../src/features/support-plan/trusted-contact-database';
import { emptyTrustedContact } from '../../../src/features/support-plan/trusted-contact';
import { createExpoSoundEngine } from '../../../src/features/regulation-sounds/expo-sound-engine';
import { openWhatsAppDraft } from '../../../src/features/support-plan/whatsapp-handoff';
jest.mock('../../../src/features/communication/storage/card-database', () => ({ openCardDatabase: jest.fn() }));
jest.mock('../../../src/features/communication/custom-cards/local-image-storage', () => ({ localImages: { copy: jest.fn(), remove: jest.fn(), prune: jest.fn() } }));
jest.mock('../../../src/features/regulation/display-preferences-database', () => ({ openDisplayPreferencesDatabase: jest.fn() }));
jest.mock('../../../src/features/transition-timer/timer-database', () => ({ openTimerDatabase: jest.fn() }));
jest.mock('../../../src/features/support-plan/trusted-contact-database', () => ({ openTrustedContactDatabase: jest.fn() }));
jest.mock('../../../src/features/support-plan/whatsapp-handoff', () => ({ openWhatsAppDraft: jest.fn() }));
jest.mock('../../../src/features/regulation-sounds/expo-sound-engine', () => ({ createExpoSoundEngine: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
jest.mock('@react-native-community/slider', () => 'Slider');
const routes = { _layout: RootLayout, index: Board, regulation: Panel, 'regulation-sounds': Sounds, 'transition-timer': Timer, 'trusted-contact': Contact };
const saveContact = jest.fn(); const timerAction = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(openCardDatabase).mockResolvedValue({ list: async () => [], listFavorites: async () => [], setFavorite: async () => [], save: async () => [], remove: async () => [] });
  jest.mocked(openDisplayPreferencesDatabase).mockResolvedValue({ read: async () => ({ enabled: false }), save: async value => ({ ...value }) });
  jest.mocked(openTimerDatabase).mockResolvedValue(versionedTimerFixture(async () => null, timerAction));
  jest.mocked(openTrustedContactDatabase).mockResolvedValue({ read: async () => ({ ...emptyTrustedContact }), save: saveContact });
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
});
afterEach(() => jest.restoreAllMocks());
async function press(name: string) {
  if (!screen.queryByRole('button', { name }) && screen.queryByRole('button', { name: 'Abrir ferramentas' })) {
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Abrir ferramentas' })));
  }
  await act(async () => fireEvent.press(screen.getByRole('button', { name })));
}
async function openPanel() {
  const result = renderRouter(routes, { initialUrl: '/' });
  await screen.findByRole('header', { name: 'TEAr' }); await press('Abrir painel de regulação'); return result;
}
it.each([
  ['Sons', '/regulation-sounds'], ['Timer de transição', '/transition-timer'], ['Contato de confiança', '/trusted-contact'],
])('opens %s in two commands and returns to the real panel without activating tools', async (label, path) => {
  const { getPathname } = await openPanel(); await press(label);
  await screen.findByRole('header', { name: label }); expect(getPathname()).toBe(path);
  await press('Voltar ao painel'); expect(getPathname()).toBe('/regulation');
  expect(screen.getByRole('header', { name: 'Painel de regulação' })).toBeOnTheScreen();
  expect(createExpoSoundEngine).not.toHaveBeenCalled(); expect(timerAction).not.toHaveBeenCalled();
  expect(saveContact).not.toHaveBeenCalled(); expect(openWhatsAppDraft).not.toHaveBeenCalled();
});
it('opens actual communication and permits returning from a directly opened panel', async () => {
  const { getPathname } = await openPanel(); await press('Comunicação'); expect(getPathname()).toBe('/');
  expect(screen.getByRole('header', { name: 'Frase' })).toBeOnTheScreen();
});
it('uses the board fallback when panel has no history', async () => {
  const { getPathname } = renderRouter(routes, { initialUrl: '/regulation' }); await press('Voltar ao quadro');
  expect(getPathname()).toBe('/');
});
it('keeps contact load failures recoverable without blocking return or other tools', async () => {
  jest.mocked(openTrustedContactDatabase).mockRejectedValue(new Error('Synthetic unavailable storage'));
  await openPanel(); await press('Contato de confiança'); await screen.findByRole('button', { name: 'Tentar abrir contato novamente' });
  await press('Voltar ao painel'); await press('Sons'); expect(screen.getByText('Nenhum som selecionado')).toBeOnTheScreen();
  expect(openWhatsAppDraft).not.toHaveBeenCalled(); expect(createExpoSoundEngine).not.toHaveBeenCalled();
});
it('preserves sound choices, restored timer and voluntary low-stimulation mode across real routes', async () => {
  jest.mocked(openTimerDatabase).mockResolvedValue(versionedTimerFixture(async () => startTimer(60000, Date.now()), timerAction));
  await openPanel(); await act(async () => fireEvent(screen.getByRole('switch', { name: 'Modo de baixa estimulação' }), 'valueChange', true));
  await press('Sons'); fireEvent.press(screen.getByRole('radio', { name: 'Ruído marrom' }));
  fireEvent(screen.getByLabelText('Volume do som'), 'valueChange', 0); await press('Voltar ao painel');
  await press('Timer de transição'); expect(screen.getByRole('progressbar')).toBeOnTheScreen(); await press('Voltar ao painel');
  await press('Sons'); expect(screen.getByRole('radio', { name: 'Ruído marrom' })).toBeChecked();
  expect(screen.getByText('Volume: 0%')).toBeOnTheScreen();
  expect(screen.getByRole('switch', { name: 'Modo de baixa estimulação' })).toBeChecked();
  expect(timerAction).not.toHaveBeenCalled(); expect(createExpoSoundEngine).not.toHaveBeenCalled();
});
it.each(['regulation', 'https://invalid.example'])('does not redirect a direct origin=%s to arbitrary destinations without history', async origin => {
  const { getPathname } = renderRouter(routes, { initialUrl: `/regulation-sounds?origin=${encodeURIComponent(origin)}` });
  await press(origin === 'regulation' ? 'Voltar ao painel' : 'Voltar ao quadro'); expect(getPathname()).toBe('/');
});
