import { act } from '@testing-library/react-native';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo, Modal } from 'react-native';
import Home from '../../../../src/app';
import RootLayout from '../../../../src/app/_layout';
import Favorites from '../../../../src/app/favorites';
import NewCard from '../../../../src/app/custom-card/new';
import { openCardDatabase } from '../../../../src/features/communication/storage/card-database';
import { openDisplayPreferencesDatabase } from '../../../../src/features/regulation/display-preferences-database';
import { localSpeech } from '../../../../src/features/communication/speech/local-speech';
jest.mock('../../../../src/features/communication/storage/card-database', () => ({ openCardDatabase: jest.fn() }));
jest.mock('../../../../src/features/communication/custom-cards/local-image-storage', () => ({ localImages: { copy: jest.fn(), remove: jest.fn(), prune: jest.fn() } }));
jest.mock('../../../../src/features/regulation/display-preferences-database', () => ({ openDisplayPreferencesDatabase: jest.fn() }));
jest.mock('../../../../src/features/communication/speech/local-speech', () => ({ localSpeech: { isAvailable: jest.fn(), speak: jest.fn(), stop: jest.fn() } }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  jest.mocked(openCardDatabase).mockResolvedValue({ list: async () => [], listFavorites: async () => [], setFavorite: async () => [], save: async () => [], remove: async () => [] });
  jest.mocked(openDisplayPreferencesDatabase).mockResolvedValue({ read: async () => ({ enabled: false }), save: async value => ({ ...value }) });
});
afterEach(() => jest.restoreAllMocks());
async function mount() { const result = renderRouter({ _layout: RootLayout, index: Home, favorites: Favorites, 'custom-card/new': NewCard }, { initialUrl: '/' }); await act(async () => {}); return result; }
async function press(name: string) { await act(async () => fireEvent.press(screen.getByRole('button', { name }))); }
it('keeps the sentence header and every existing action on home, not in the closed drawer', async () => {
  await mount(); expect(screen.getByRole('header', { name: 'Frase' })).toBeOnTheScreen();
  for (const name of ['Abrir painel de regulação', 'Abrir favoritos', 'Abrir rotinas', 'Abrir tarefas', 'Abrir check-in corporal e sensorial', 'Abrir perfil de comunicação', 'Abrir scripts de comunicação', 'Abrir plano de apoio', 'Abrir contato de confiança', 'Abrir sons', 'Abrir Pomodoro', 'Abrir timer de transição']) {
    expect(screen.getByRole('button', { name })).toBeOnTheScreen();
  }
  expect(screen.queryByRole('header', { name: 'Comunicação' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Água' })).toBeNull();
});
it('composes across drawer categories without speech and preserves the header through close/reopen', async () => {
  await mount(); await press('Abrir Comunicação');
  expect(screen.queryByRole('button', { name: 'Abrir tarefas' })).toBeNull();
  expect(screen.queryByRole('header', { name: 'Frase' })).toBeNull();
  await press('Necessidades'); await press('Água'); await press('Solicitações'); await press('Ajuda');
  await press('Fechar Comunicação'); expect(screen.getByLabelText('1. Água')).toBeOnTheScreen(); expect(screen.getByLabelText('2. Ajuda')).toBeOnTheScreen();
  await press('Abrir Comunicação'); await press('Fechar Comunicação tocando fora');
  await press('Remover Água da posição 1'); expect(screen.getByLabelText('1. Ajuda')).toBeOnTheScreen();
  await press('Limpar frase'); expect(screen.getByText('Frase vazia')).toBeOnTheScreen();
  expect(localSpeech.speak).not.toHaveBeenCalled(); expect(localSpeech.isAvailable).not.toHaveBeenCalled();
});
it('handles native back without losing composition and keeps favorites on the home route', async () => {
  const { getPathname } = await mount(); await press('Abrir Comunicação'); await press('Sim');
  const drawer = screen.UNSAFE_getAllByType(Modal).find(modal => modal.props.transparent);
  expect(drawer?.props.animationType).toBe('none');
  act(() => drawer!.props.onRequestClose()); expect(screen.getByLabelText('1. Sim')).toBeOnTheScreen();
  await press('Abrir favoritos'); expect(getPathname()).toBe('/favorites'); await press('Voltar ao quadro');
  expect(screen.getByLabelText('1. Sim')).toBeOnTheScreen(); expect(screen.queryByRole('header', { name: 'Comunicação' })).toBeNull();
});
it('closes the drawer before navigating to the existing card editor', async () => {
  const { getPathname } = await mount(); await press('Abrir Comunicação'); await press('Novo cartão');
  expect(getPathname()).toBe('/custom-card/new'); expect(screen.queryByRole('button', { name: 'Fechar Comunicação' })).toBeNull();
  expect(screen.getByLabelText('Título do cartão')).toBeOnTheScreen();
});
