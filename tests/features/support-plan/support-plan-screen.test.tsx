import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SupportPlanScreen } from '../../../src/features/support-plan/SupportPlanScreen';
import { openSupportPlanDatabase } from '../../../src/features/support-plan/support-plan-database';
import { openPreferencesDatabase } from '../../../src/features/communication-profile/preferences-database';
import { emptySupportPlan, normalizedSupportPlan, suggestedOrientations, type SupportPlan } from '../../../src/features/support-plan/support-plan';
import { emptySupportPreferences, supportForPlan } from '../../../src/features/communication-profile/support-preferences';
jest.mock('../../../src/features/support-plan/support-plan-database', () => ({ openSupportPlanDatabase: jest.fn() }));
jest.mock('../../../src/features/communication-profile/preferences-database', () => ({ openPreferencesDatabase: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let saved: SupportPlan; let support: typeof emptySupportPreferences;
const save = jest.fn(); const read = jest.fn(); const readSupportForPlan = jest.fn(); const onClose = jest.fn();
beforeEach(() => {
  jest.clearAllMocks(); saved = normalizedSupportPlan(emptySupportPlan); support = { ...emptySupportPreferences };
  save.mockReset().mockImplementation(async (value) => { saved = normalizedSupportPlan(value); return saved; });
  read.mockReset().mockImplementation(async () => saved);
  readSupportForPlan.mockReset().mockImplementation(async (fields) => supportForPlan(support, fields));
  jest.mocked(openSupportPlanDatabase).mockResolvedValue({ read, save });
  jest.mocked(openPreferencesDatabase).mockResolvedValue({ read: jest.fn(), save: jest.fn(), readSupport: jest.fn(), saveSupport: jest.fn(), readSummarySelection: jest.fn(),
    saveSummarySelection: jest.fn(), readProfileSummary: jest.fn(), readSupportForPlan });
});
async function ready() { await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar plano' })).toBeEnabled()); }
it('starts empty with every suggestion/reference unchecked and no implicit saving or profile read — RF-001/RF-002', async () => {
  render(<SupportPlanScreen onClose={onClose} />); await ready();
  expect(screen.getByText('Ainda não há orientações salvas.')).toBeOnTheScreen();
  for (const { label } of suggestedOrientations) expect(screen.getByRole('checkbox', { name: label })).not.toBeChecked();
  for (const checkbox of screen.getAllByRole('checkbox')) expect(checkbox).not.toBeChecked();
  expect(screen.getByLabelText('Minhas orientações').props.value).toBe('');
  expect(save).not.toHaveBeenCalled(); expect(openPreferencesDatabase).not.toHaveBeenCalled();
});
it('saves free orientations and suggestions explicitly and restores them after a new session — RF-001/RF-004', async () => {
  const view = render(<SupportPlanScreen onClose={onClose} />); await ready();
  fireEvent.changeText(screen.getByLabelText('Minhas orientações'), '  Orientação sintética  ');
  fireEvent.press(screen.getByRole('checkbox', { name: 'Preciso de silêncio' }));
  expect(save).not.toHaveBeenCalled(); fireEvent.press(screen.getByRole('button', { name: 'Salvar plano' })); await screen.findByText('Plano salvo.');
  view.unmount(); render(<SupportPlanScreen onClose={onClose} />); await ready();
  expect(screen.getByLabelText('Minhas orientações').props.value).toBe('Orientação sintética');
  expect(screen.getByRole('checkbox', { name: 'Preciso de silêncio' })).toBeChecked();
});
it('edits and clears text/choices without touching other orientations — RF-003', async () => {
  saved = { instructions: 'Texto', suggestions: ['quiet', 'no-touch'], profileFields: [] };
  render(<SupportPlanScreen onClose={onClose} />); await ready();
  fireEvent.changeText(screen.getByLabelText('Minhas orientações'), ''); fireEvent.press(screen.getByRole('checkbox', { name: 'Não me toque' }));
  fireEvent.press(screen.getByRole('button', { name: 'Salvar plano' })); await screen.findByText('Plano salvo.');
  expect(saved).toEqual({ instructions: '', suggestions: ['quiet'], profileFields: [] });
});
it('cancels unsaved input and retains the draft on save failure until explicit retry', async () => {
  render(<SupportPlanScreen onClose={onClose} />); await ready();
  fireEvent.changeText(screen.getByLabelText('Minhas orientações'), 'Teste');
  fireEvent.press(screen.getByRole('button', { name: 'Cancelar e voltar' })); expect(onClose).toHaveBeenCalled(); expect(save).not.toHaveBeenCalled();
  save.mockRejectedValueOnce(new Error('private failure'));
  fireEvent.press(screen.getByRole('button', { name: 'Salvar plano' })); await screen.findByText(/Seu preenchimento e o plano salvo foram mantidos/);
  expect(saved).toEqual(emptySupportPlan); expect(screen.getByLabelText('Minhas orientações').props.value).toBe('Teste'); expect(screen.queryByText('private failure')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar plano' })); await screen.findByText('Plano salvo.'); expect(saved.instructions).toBe('Teste');
});
it('confirms whole-plan removal, supports cancel/retry and never calls profile deletion', async () => {
  saved = { instructions: 'Texto', suggestions: ['no-touch'], profileFields: ['sound'] };
  render(<SupportPlanScreen onClose={onClose} />); await ready(); await screen.findByText('Ainda não há informações preenchidas nos campos escolhidos.');
  fireEvent.press(screen.getByRole('button', { name: 'Remover plano' })); fireEvent.press(screen.getByRole('button', { name: 'Manter plano' })); expect(save).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Remover plano' })); save.mockRejectedValueOnce(new Error('private failure'));
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar remoção do plano' })); await screen.findByText(/Seu preenchimento e o plano salvo foram mantidos/);
  expect(saved.instructions).toBe('Texto'); expect(screen.getByRole('checkbox', { name: 'Não me toque' })).toBeChecked();
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar remoção do plano' })); await screen.findByText('Plano removido.'); expect(saved).toEqual(emptySupportPlan);
  const profile = await openPreferencesDatabase(); expect(profile.saveSupport).not.toHaveBeenCalled(); expect(profile.save).not.toHaveBeenCalled();
});
it('blocks duplicate actions and announces success only after commit', async () => {
  let finish!: (value: SupportPlan) => void;
  save.mockImplementationOnce(() => new Promise<SupportPlan>((resolve) => { finish = resolve; }));
  render(<SupportPlanScreen onClose={onClose} />); await ready();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar plano' }));
  expect(screen.queryByText('Plano salvo.')).toBeNull(); expect(screen.getByRole('checkbox', { name: 'Não me toque' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancelar e voltar' })).toBeDisabled();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar plano' })); expect(save).toHaveBeenCalledTimes(1);
  await act(async () => finish(emptySupportPlan)); expect(screen.getByText('Plano salvo.')).toBeOnTheScreen();
});
it('recovers plan initialization failure without accepting edits/saves or exposing private details', async () => {
  jest.mocked(openSupportPlanDatabase).mockRejectedValueOnce(new Error('private content'));
  render(<SupportPlanScreen onClose={onClose} />); await screen.findByRole('button', { name: 'Tentar abrir plano novamente' });
  expect(screen.getByRole('button', { name: 'Salvar plano' })).toBeDisabled(); expect(screen.queryByText('private content')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Tentar abrir plano novamente' })); await ready();
});
it('loads only chosen current profile values, hides removed data on reopening and keeps identifiers', async () => {
  support = { ...emptySupportPreferences, sound: 'Não escolhido', helpfulStrategies: 'Pausa atual' };
  const view = render(<SupportPlanScreen onClose={onClose} />); await ready();
  fireEvent.press(screen.getByRole('checkbox', { name: 'Incluir Estratégias que ajudam do perfil' })); await screen.findByText('Pausa atual');
  expect(screen.queryByText('Não escolhido')).toBeNull(); expect(readSupportForPlan).toHaveBeenLastCalledWith(['helpfulStrategies']);
  fireEvent.press(screen.getByRole('button', { name: 'Salvar plano' })); await screen.findByText('Plano salvo.'); view.unmount();
  support.helpfulStrategies = ''; render(<SupportPlanScreen onClose={onClose} />); await ready();
  await screen.findByText('Ainda não há informações preenchidas nos campos escolhidos.'); expect(screen.queryByText('Pausa atual')).toBeNull();
  expect(saved.profileFields).toEqual(['helpfulStrategies']);
});
it('recovers profile read failure independently while preserving editable plan and confirmed choices', async () => {
  saved = { instructions: 'Orientação', suggestions: [], profileFields: ['sound'] }; support.sound = 'Som atual';
  readSupportForPlan.mockRejectedValueOnce(new Error('private details'));
  render(<SupportPlanScreen onClose={onClose} />); await ready(); await screen.findByText('Não foi possível abrir as informações do perfil. O plano foi mantido.');
  expect(screen.getByRole('button', { name: 'Salvar plano' })).toBeEnabled(); expect(screen.queryByText('private details')).toBeNull(); expect(screen.queryByText('Som atual')).toBeNull();
  expect(screen.getByLabelText('Minhas orientações').props.value).toBe('Orientação');
  fireEvent.press(screen.getByRole('button', { name: 'Tentar abrir informações do perfil novamente' })); await screen.findByText('Som atual');
});
it('ignores an obsolete in-flight profile result after the person deselects that field', async () => {
  let finish!: (value: ReturnType<typeof supportForPlan>) => void;
  readSupportForPlan.mockImplementationOnce(() => new Promise<ReturnType<typeof supportForPlan>>((resolve) => { finish = resolve; }));
  render(<SupportPlanScreen onClose={onClose} />); await ready();
  fireEvent.press(screen.getByRole('checkbox', { name: 'Incluir Som do perfil' }));
  await waitFor(() => expect(readSupportForPlan).toHaveBeenCalledTimes(1));
  fireEvent.press(screen.getByRole('checkbox', { name: 'Incluir Som do perfil' }));
  await act(async () => finish([{ field: 'sound', label: 'Som', value: 'Obsoleto' }]));
  expect(screen.queryByText('Obsoleto')).toBeNull(); expect(screen.getByRole('checkbox', { name: 'Incluir Som do perfil' })).not.toBeChecked();
});
it('shares one pending profile initialization when choices change before the database opens', async () => {
  const profile = await openPreferencesDatabase(); jest.mocked(openPreferencesDatabase).mockClear();
  let finish!: (value: typeof profile) => void;
  jest.mocked(openPreferencesDatabase).mockImplementationOnce(() => new Promise<typeof profile>((resolve) => { finish = resolve; }));
  support.light = 'Luz atual'; render(<SupportPlanScreen onClose={onClose} />); await ready();
  fireEvent.press(screen.getByRole('checkbox', { name: 'Incluir Som do perfil' }));
  fireEvent.press(screen.getByRole('checkbox', { name: 'Incluir Luz do perfil' }));
  expect(openPreferencesDatabase).toHaveBeenCalledTimes(1);
  await act(async () => finish(profile)); await screen.findByText('Luz atual');
  expect(readSupportForPlan).toHaveBeenLastCalledWith(['sound', 'light']);
});
