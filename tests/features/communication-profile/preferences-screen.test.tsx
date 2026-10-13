import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { PreferencesScreen } from '../../../src/features/communication-profile/PreferencesScreen';
import { openPreferencesDatabase } from '../../../src/features/communication-profile/preferences-database';
import { emptyPreferences, normalizedPreferences, type CommunicationPreferences } from '../../../src/features/communication-profile/preferences';
jest.mock('../../../src/features/communication-profile/preferences-database', () => ({ openPreferencesDatabase: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let saved: CommunicationPreferences;
const save = jest.fn(); const onClose = jest.fn();
beforeEach(() => {
  jest.clearAllMocks(); saved = { ...emptyPreferences }; save.mockReset();
  save.mockImplementation(async (value) => { saved = normalizedPreferences(value); return saved; });
  jest.mocked(openPreferencesDatabase).mockResolvedValue({ read: async () => saved, save });
});
async function ready() { await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar preferências' })).toBeEnabled()); }
it('shows empty/uninformed state, saves free text and restores it after a new session', async () => {
  const view = render(<PreferencesScreen onClose={onClose} />); await ready();
  expect(screen.getByText('Ainda não há preferências salvas.')).toBeOnTheScreen();
  expect(screen.getByRole('radio', { name: 'Não informado' })).toBeChecked();
  fireEvent.changeText(screen.getByLabelText('Formas preferidas de comunicação'), '  Texto  ');
  fireEvent.changeText(screen.getByLabelText('Como prefiro receber informações'), 'Uma por vez');
  fireEvent.press(screen.getByRole('radio', { name: 'Preciso de tempo adicional' }));
  fireEvent.press(screen.getByRole('button', { name: 'Salvar preferências' }));
  await screen.findByText('Preferências salvas.');
  view.unmount(); render(<PreferencesScreen onClose={onClose} />); await ready();
  expect(screen.getByLabelText('Formas preferidas de comunicação').props.value).toBe('Texto');
  expect(screen.getByRole('radio', { name: 'Preciso de tempo adicional' })).toBeChecked();
});
it('supports editing, removing one field and restoring additional time to uninformed', async () => {
  saved = { communication: 'Texto', instructions: 'Imagens', extraTime: false };
  render(<PreferencesScreen onClose={onClose} />); await ready();
  expect(screen.getByRole('radio', { name: 'Não preciso de tempo adicional' })).toBeChecked();
  fireEvent.changeText(screen.getByLabelText('Formas preferidas de comunicação'), '');
  fireEvent.press(screen.getByRole('radio', { name: 'Não informado' }));
  fireEvent.press(screen.getByRole('button', { name: 'Salvar preferências' }));
  await screen.findByText('Preferências salvas.');
  expect(saved).toEqual({ communication: '', instructions: 'Imagens', extraTime: null });
});
it('requires removal confirmation, preserves confirmed info on failure and retries', async () => {
  saved = { communication: 'Teste', instructions: '', extraTime: true };
  render(<PreferencesScreen onClose={onClose} />); await ready();
  fireEvent.press(screen.getByRole('button', { name: 'Remover preferências' }));
  fireEvent.press(screen.getByRole('button', { name: 'Manter preferências' })); expect(save).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Remover preferências' }));
  save.mockRejectedValueOnce(new Error('private content'));
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar remoção das preferências' }));
  await screen.findByText(/Seu preenchimento e a versão salva foram mantidos/);
  expect(screen.queryByText('private content')).toBeNull();
  expect(screen.getByLabelText('Formas preferidas de comunicação').props.value).toBe('Teste');
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar remoção das preferências' }));
  await screen.findByText('Preferências removidas.');
  expect(saved).toEqual(emptyPreferences);
});
it('cancels unsaved changes and keeps draft on failed saving until an explicit retry', async () => {
  render(<PreferencesScreen onClose={onClose} />); await ready();
  fireEvent.changeText(screen.getByLabelText('Formas preferidas de comunicação'), 'Teste');
  fireEvent.press(screen.getByRole('button', { name: 'Cancelar e voltar' }));
  expect(onClose).toHaveBeenCalled(); expect(save).not.toHaveBeenCalled();
  save.mockRejectedValueOnce(new Error('private failure'));
  fireEvent.press(screen.getByRole('button', { name: 'Salvar preferências' }));
  await screen.findByText(/Seu preenchimento e a versão salva foram mantidos/);
  expect(saved).toEqual(emptyPreferences);
  fireEvent.press(screen.getByRole('button', { name: 'Salvar preferências' }));
  await screen.findByText('Preferências salvas.'); expect(saved.communication).toBe('Teste');
});
it('does not show success or accept duplicate operations before commit', async () => {
  let finish!: (value: CommunicationPreferences) => void;
  save.mockImplementationOnce(() => new Promise<CommunicationPreferences>((resolve) => { finish = resolve; }));
  render(<PreferencesScreen onClose={onClose} />); await ready();
  fireEvent.changeText(screen.getByLabelText('Formas preferidas de comunicação'), 'Teste');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar preferências' }));
  expect(screen.getByRole('button', { name: 'Salvar preferências' })).toBeDisabled();
  expect(screen.queryByText('Preferências salvas.')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar preferências' })); expect(save).toHaveBeenCalledTimes(1);
  await act(async () => { finish({ ...emptyPreferences, communication: 'Teste' }); });
  expect(screen.getByText('Preferências salvas.')).toBeOnTheScreen();
});
it('recovers initialization failure without logging or displaying private details', async () => {
  jest.mocked(openPreferencesDatabase).mockRejectedValueOnce(new Error('private path'));
  render(<PreferencesScreen onClose={onClose} />);
  await screen.findByRole('button', { name: 'Tentar abrir preferências novamente' });
  expect(screen.queryByText('private path')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Tentar abrir preferências novamente' })); await ready();
  expect(screen.getByText('Ainda não há preferências salvas.')).toBeOnTheScreen();
});
