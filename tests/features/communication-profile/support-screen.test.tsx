import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SupportPreferencesScreen } from '../../../src/features/communication-profile/SupportPreferencesScreen';
import { openPreferencesDatabase } from '../../../src/features/communication-profile/preferences-database';
import { emptySupportPreferences, normalizedSupportPreferences, supportFields, type SupportPreferences } from '../../../src/features/communication-profile/support-preferences';
jest.mock('../../../src/features/communication-profile/preferences-database', () => ({ openPreferencesDatabase: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let saved: SupportPreferences;
const saveSupport = jest.fn(); const onClose = jest.fn();
beforeEach(() => {
  jest.clearAllMocks(); saved = { ...emptySupportPreferences }; saveSupport.mockReset();
  saveSupport.mockImplementation(async (value) => { saved = normalizedSupportPreferences(value); return saved; });
  jest.mocked(openPreferencesDatabase).mockResolvedValue({ read: jest.fn(), save: jest.fn(), readSupportForPlan: jest.fn(), readSupport: async () => saved, saveSupport });
});
async function ready() { await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar sensibilidades e estratégias' })).toBeEnabled()); }
it('shows named optional fields, saves all and restores them after reopening', async () => {
  const view = render(<SupportPreferencesScreen onClose={onClose} />); await ready();
  expect(screen.getByText('Ainda não há sensibilidades ou estratégias salvas.')).toBeOnTheScreen();
  for (const field of supportFields) fireEvent.changeText(screen.getByLabelText(field.label), `  Teste ${field.id}  `);
  fireEvent.press(screen.getByRole('button', { name: 'Salvar sensibilidades e estratégias' }));
  await screen.findByText('Sensibilidades e estratégias salvas.');
  view.unmount(); render(<SupportPreferencesScreen onClose={onClose} />); await ready();
  for (const field of supportFields) expect(screen.getByLabelText(field.label).props.value).toBe(`Teste ${field.id}`);
});
it('edits and clears a field without changing other saved fields', async () => {
  saved = { ...emptySupportPreferences, sound: 'Som', helpfulStrategies: 'Pausa' };
  render(<SupportPreferencesScreen onClose={onClose} />); await ready();
  fireEvent.changeText(screen.getByLabelText('Som'), ''); fireEvent.changeText(screen.getByLabelText('Luz'), 'Luz sintética');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar sensibilidades e estratégias' }));
  await screen.findByText('Sensibilidades e estratégias salvas.');
  expect(saved).toEqual({ ...emptySupportPreferences, light: 'Luz sintética', helpfulStrategies: 'Pausa' });
});
it('requires confirmation and preserves saved data/draft when removal fails, allowing retry', async () => {
  saved = { ...emptySupportPreferences, touch: 'Teste' };
  render(<SupportPreferencesScreen onClose={onClose} />); await ready();
  fireEvent.press(screen.getByRole('button', { name: 'Remover sensibilidades e estratégias' }));
  fireEvent.press(screen.getByRole('button', { name: 'Manter informações' })); expect(saveSupport).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Remover sensibilidades e estratégias' }));
  saveSupport.mockRejectedValueOnce(new Error('private path'));
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar remoção das sensibilidades e estratégias' }));
  await screen.findByText(/Seu preenchimento e as informações salvas foram mantidos/);
  expect(screen.queryByText('private path')).toBeNull(); expect(screen.getByLabelText('Toque').props.value).toBe('Teste');
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar remoção das sensibilidades e estratégias' }));
  await screen.findByText('Sensibilidades e estratégias removidas.'); expect(saved).toEqual(emptySupportPreferences);
});
it('cancels unsaved changes and retains a failed save until explicit retry', async () => {
  render(<SupportPreferencesScreen onClose={onClose} />); await ready();
  fireEvent.changeText(screen.getByLabelText('Estratégias que ajudam'), 'Pausa');
  fireEvent.press(screen.getByRole('button', { name: 'Cancelar e voltar' })); expect(onClose).toHaveBeenCalled(); expect(saveSupport).not.toHaveBeenCalled();
  saveSupport.mockRejectedValueOnce(new Error('synthetic failure'));
  fireEvent.press(screen.getByRole('button', { name: 'Salvar sensibilidades e estratégias' }));
  await screen.findByText(/Seu preenchimento e as informações salvas foram mantidos/); expect(saved).toEqual(emptySupportPreferences);
  fireEvent.press(screen.getByRole('button', { name: 'Salvar sensibilidades e estratégias' }));
  await screen.findByText('Sensibilidades e estratégias salvas.'); expect(saved.helpfulStrategies).toBe('Pausa');
});
it('blocks duplicate saves and never announces success before storage commits', async () => {
  let finish!: (value: SupportPreferences) => void;
  saveSupport.mockImplementationOnce(() => new Promise<SupportPreferences>((resolve) => { finish = resolve; }));
  render(<SupportPreferencesScreen onClose={onClose} />); await ready();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar sensibilidades e estratégias' }));
  expect(screen.getByRole('button', { name: 'Salvar sensibilidades e estratégias' })).toBeDisabled();
  expect(screen.queryByText('Sensibilidades e estratégias salvas.')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar sensibilidades e estratégias' })); expect(saveSupport).toHaveBeenCalledTimes(1);
  await act(async () => finish(emptySupportPreferences)); expect(screen.getByText('Sensibilidades e estratégias salvas.')).toBeOnTheScreen();
});
it('recovers from load failure without displaying private details or accepting saves', async () => {
  jest.mocked(openPreferencesDatabase).mockRejectedValueOnce(new Error('private content'));
  render(<SupportPreferencesScreen onClose={onClose} />);
  await screen.findByRole('button', { name: 'Tentar abrir informações novamente' });
  expect(screen.queryByText('private content')).toBeNull(); expect(screen.getByRole('button', { name: 'Salvar sensibilidades e estratégias' })).toBeDisabled();
  fireEvent.press(screen.getByRole('button', { name: 'Tentar abrir informações novamente' })); await ready();
});
