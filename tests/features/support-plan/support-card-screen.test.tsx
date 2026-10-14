import { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AppState, Modal, StyleSheet, type AppStateStatus } from 'react-native';
import { SupportCardScreen } from '../../../src/features/support-plan/SupportCardScreen';
import { openSupportPlanDatabase } from '../../../src/features/support-plan/support-plan-database';
import { openPreferencesDatabase } from '../../../src/features/communication-profile/preferences-database';
import { emptySupportPlan, type SupportPlan } from '../../../src/features/support-plan/support-plan';
import { emptySupportPreferences, supportForPlan } from '../../../src/features/communication-profile/support-preferences';
jest.mock('../../../src/features/support-plan/support-plan-database', () => ({ openSupportPlanDatabase: jest.fn() }));
jest.mock('../../../src/features/communication-profile/preferences-database', () => ({ openPreferencesDatabase: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let saved: SupportPlan; let support: typeof emptySupportPreferences;
let appEvent: (state: AppStateStatus) => void;
const read = jest.fn(); const readSupportForPlan = jest.fn(); const save = jest.fn(); const close = jest.fn();
beforeEach(() => {
  jest.clearAllMocks(); saved = { ...emptySupportPlan }; support = { ...emptySupportPreferences };
  read.mockReset().mockImplementation(async () => saved);
  readSupportForPlan.mockReset().mockImplementation(async fields => supportForPlan(support, fields));
  jest.mocked(openSupportPlanDatabase).mockResolvedValue({ read, save });
  jest.mocked(openPreferencesDatabase).mockResolvedValue({ read: jest.fn(), save, readSupport: jest.fn(), saveSupport: save,
    readSummarySelection: jest.fn(), saveSummarySelection: save, readProfileSummary: jest.fn(), readSupportForPlan });
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_name, listener) => { appEvent = listener; return { remove: jest.fn() }; });
});
afterEach(() => jest.restoreAllMocks());
async function press(label: string) { await act(async () => fireEvent.press(screen.getByRole('button', { name: label }))); }
it('opens a full-screen calm modal, empty without defaults, with independent accessible exit', async () => {
  const view = render(<SupportCardScreen onClose={close} />); await screen.findByText('Nenhuma orientação preenchida para apresentar.');
  const modal = view.UNSAFE_getByType(Modal);
  expect(modal.props).toMatchObject({ visible: true, presentationStyle: 'fullScreen', animationType: 'none' });
  const button = screen.getByRole('button', { name: 'Fechar cartão e voltar ao painel' });
  expect(StyleSheet.flatten(button.props.style).minHeight).toBe(64);
  fireEvent.press(button); modal.props.onRequestClose(); expect(close).toHaveBeenCalledTimes(2);
  expect(openPreferencesDatabase).not.toHaveBeenCalled(); expect(save).not.toHaveBeenCalled();
});
it('shows only saved orientations and current explicitly chosen profile values with scalable large text', async () => {
  saved = { instructions: 'Texto sintético\nSegunda linha', suggestions: ['quiet'], profileFields: ['light'] };
  support.light = 'Luz sintética atual'; support.sound = 'Campo não escolhido';
  render(<SupportCardScreen onClose={close} />); await screen.findByText('Luz sintética atual');
  expect(screen.getByText('Preciso de silêncio')).toBeOnTheScreen(); expect(screen.queryByText('Campo não escolhido')).toBeNull();
  const text = screen.getByText(saved.instructions); expect(StyleSheet.flatten(text.props.style)).toMatchObject({ fontSize: 24, lineHeight: 34, color: '#202124' });
  expect(text.props.allowFontScaling).not.toBe(false); expect(readSupportForPlan).toHaveBeenCalledWith(['light']); expect(save).not.toHaveBeenCalled();
});
it('rereads on foreground and removes old plan, suggestions and profile values after editing/removal', async () => {
  saved = { instructions: 'Antiga orientação sintética', suggestions: ['no-touch'], profileFields: ['light'] }; support.light = 'Antiga luz sintética';
  render(<SupportCardScreen onClose={close} />); await screen.findByText('Antiga luz sintética');
  saved = { ...emptySupportPlan }; support.light = '';
  await act(async () => { appEvent('background'); }); expect(screen.queryByText('Antiga luz sintética')).toBeNull();
  await act(async () => { appEvent('active'); }); await screen.findByText('Nenhuma orientação preenchida para apresentar.');
  expect(screen.queryByText('Antiga orientação sintética')).toBeNull(); expect(screen.queryByText('Não me toque')).toBeNull(); expect(save).not.toHaveBeenCalled();
});
it('clears earlier content on a failed plan reload and retries without writing', async () => {
  saved = { ...emptySupportPlan, instructions: 'Orientação sintética confirmada' };
  render(<SupportCardScreen onClose={close} />); await screen.findByText(saved.instructions);
  read.mockRejectedValueOnce(new Error('Synthetic read error'));
  await act(async () => { appEvent('active'); }); await screen.findByRole('button', { name: 'Tentar abrir cartão novamente' });
  expect(screen.queryByText(saved.instructions)).toBeNull(); await press('Tentar abrir cartão novamente'); await screen.findByText(saved.instructions);
  expect(save).not.toHaveBeenCalled();
});
it('keeps confirmed orientations when references fail, hides old values and separately retries current values', async () => {
  saved = { ...emptySupportPlan, instructions: 'Orientação própria sintética', profileFields: ['touch'] }; support.touch = 'Toque sintético anterior';
  render(<SupportCardScreen onClose={close} />); await screen.findByText(support.touch);
  readSupportForPlan.mockRejectedValueOnce(new Error('Synthetic profile error'));
  await act(async () => { appEvent('active'); }); await screen.findByRole('button', { name: 'Tentar abrir informações do perfil novamente' });
  expect(screen.getByText(saved.instructions)).toBeOnTheScreen(); expect(screen.queryByText(support.touch)).toBeNull();
  support.touch = ''; await press('Tentar abrir informações do perfil novamente');
  expect(screen.queryByText('Toque sintético anterior')).toBeNull(); expect(screen.queryByRole('button', { name: 'Tentar abrir informações do perfil novamente' })).toBeNull();
  expect(save).not.toHaveBeenCalled();
});
it('can close during pending reads and discards a late result from the previous presentation', async () => {
  let resolve!: (value: SupportPlan) => void;
  read.mockImplementationOnce(() => new Promise<SupportPlan>(done => { resolve = done; }));
  render(<SupportCardScreen onClose={close} />); await act(async () => {});
  await press('Fechar cartão e voltar ao painel'); expect(close).toHaveBeenCalled();
  await act(async () => { appEvent('active'); }); await screen.findByText('Nenhuma orientação preenchida para apresentar.');
  await act(async () => resolve({ ...emptySupportPlan, instructions: 'Resultado sintético obsoleto' }));
  expect(screen.queryByText('Resultado sintético obsoleto')).toBeNull();
});
it('discards late profile results after the plan selection changes', async () => {
  saved = { ...emptySupportPlan, profileFields: ['light'] };
  let resolve!: (value: ReturnType<typeof supportForPlan>) => void;
  readSupportForPlan.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
  render(<SupportCardScreen onClose={close} />); await screen.findByText('Abrindo informações escolhidas do perfil…');
  saved = { ...emptySupportPlan }; await act(async () => { appEvent('active'); });
  await act(async () => resolve([{ field: 'light', label: 'Luz', value: 'Resultado sintético obsoleto' }]));
  expect(screen.queryByText('Resultado sintético obsoleto')).toBeNull();
});
it('recovers an unavailable store under StrictMode and keeps exit available', async () => {
  jest.mocked(openSupportPlanDatabase).mockRejectedValueOnce(new Error('Synthetic open failure'));
  render(<StrictMode><SupportCardScreen onClose={close} /></StrictMode>);
  await screen.findByRole('button', { name: 'Tentar abrir cartão novamente' });
  await press('Tentar abrir cartão novamente'); await screen.findByText('Nenhuma orientação preenchida para apresentar.');
  await press('Fechar cartão e voltar ao painel'); expect(close).toHaveBeenCalled(); expect(save).not.toHaveBeenCalled();
});
