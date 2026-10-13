import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ProfileSummaryScreen, SummarySelectionScreen } from '../../../src/features/communication-profile/ProfileSummaryScreen';
import { openPreferencesDatabase } from '../../../src/features/communication-profile/preferences-database';
import { buildProfileSummary, normalizedSummarySelection, summaryFields, type SummaryField } from '../../../src/features/communication-profile/profile-summary';
import { emptyPreferences, type CommunicationPreferences } from '../../../src/features/communication-profile/preferences';
import { emptySupportPreferences, type SupportPreferences } from '../../../src/features/communication-profile/support-preferences';
jest.mock('../../../src/features/communication-profile/preferences-database', () => ({ openPreferencesDatabase: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let selected: SummaryField[]; let communication: CommunicationPreferences; let support: SupportPreferences;
const readSummarySelection = jest.fn(); const saveSummarySelection = jest.fn(); const readProfileSummary = jest.fn();
const onClose = jest.fn(); const onPresent = jest.fn();
beforeEach(() => {
  jest.clearAllMocks(); selected = []; communication = { ...emptyPreferences }; support = { ...emptySupportPreferences };
  readSummarySelection.mockReset().mockImplementation(async () => selected);
  saveSummarySelection.mockReset().mockImplementation(async (value) => { selected = normalizedSummarySelection(value); return selected; });
  readProfileSummary.mockReset().mockImplementation(async () => buildProfileSummary(communication, support, selected));
  jest.mocked(openPreferencesDatabase).mockResolvedValue({ read: jest.fn(), save: jest.fn(), readSupport: jest.fn(), saveSupport: jest.fn(), readSupportForPlan: jest.fn(),
    readSummarySelection, saveSummarySelection, readProfileSummary });
});
async function ready() { await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar seleção' })).toBeEnabled()); }
it('starts with unchecked fields and no implicit save, presentation or private content', async () => {
  communication.communication = 'Conteúdo sintético reservado';
  render(<SummarySelectionScreen onClose={onClose} onPresent={onPresent} />); await ready();
  for (const { label } of summaryFields) expect(screen.getByRole('checkbox', { name: label })).not.toBeChecked();
  expect(screen.getByText('Nenhuma informação selecionada.')).toBeOnTheScreen();
  expect(screen.queryByText('Conteúdo sintético reservado')).toBeNull();
  expect(onPresent).not.toHaveBeenCalled(); expect(saveSummarySelection).not.toHaveBeenCalled(); expect(readProfileSummary).not.toHaveBeenCalled();
});
it('saves choices explicitly, reopens confirmed selection and presents only on command', async () => {
  const view = render(<SummarySelectionScreen onClose={onClose} onPresent={onPresent} />); await ready();
  fireEvent.press(screen.getByRole('checkbox', { name: 'Som' }));
  expect(selected).toEqual([]); expect(screen.getByRole('button', { name: 'Apresentar resumo' })).toBeDisabled();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar seleção' })); await screen.findByText('Seleção salva.');
  expect(onPresent).not.toHaveBeenCalled(); expect(selected).toEqual(['sound']);
  view.unmount(); render(<SummarySelectionScreen onClose={onClose} onPresent={onPresent} />); await ready();
  expect(screen.getByRole('checkbox', { name: 'Som' })).toBeChecked();
  fireEvent.press(screen.getByRole('button', { name: 'Apresentar resumo' })); expect(onPresent).toHaveBeenCalledTimes(1);
});
it('can remove all choices without saving a cancelled draft', async () => {
  selected = ['sound']; render(<SummarySelectionScreen onClose={onClose} onPresent={onPresent} />); await ready();
  fireEvent.press(screen.getByRole('checkbox', { name: 'Som' }));
  fireEvent.press(screen.getByRole('button', { name: 'Cancelar e voltar' }));
  expect(onClose).toHaveBeenCalledTimes(1); expect(selected).toEqual(['sound']); expect(saveSummarySelection).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar seleção' })); await screen.findByText('Seleção salva.'); expect(selected).toEqual([]);
});
it('keeps draft and confirmed choices on failed saving, then retries without exposing error details', async () => {
  selected = ['sound']; render(<SummarySelectionScreen onClose={onClose} onPresent={onPresent} />); await ready();
  fireEvent.press(screen.getByRole('checkbox', { name: 'Luz' })); saveSummarySelection.mockRejectedValueOnce(new Error('private content'));
  fireEvent.press(screen.getByRole('button', { name: 'Salvar seleção' })); await screen.findByText(/Sua seleção e a versão salva foram mantidas/);
  expect(screen.getByRole('checkbox', { name: 'Luz' })).toBeChecked(); expect(selected).toEqual(['sound']);
  expect(screen.queryByText('private content')).toBeNull(); expect(screen.getByRole('button', { name: 'Apresentar resumo' })).toBeDisabled();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar seleção' })); await screen.findByText('Seleção salva.'); expect(selected).toEqual(['sound', 'light']);
});
it('blocks duplicates and presentation until the save commits', async () => {
  let finish!: (value: SummaryField[]) => void;
  saveSummarySelection.mockImplementationOnce(() => new Promise<SummaryField[]>((resolve) => { finish = resolve; }));
  render(<SummarySelectionScreen onClose={onClose} onPresent={onPresent} />); await ready();
  fireEvent.press(screen.getByRole('checkbox', { name: 'Som' })); fireEvent.press(screen.getByRole('button', { name: 'Salvar seleção' }));
  expect(screen.queryByText('Seleção salva.')).toBeNull(); expect(screen.getByRole('checkbox', { name: 'Som' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Apresentar resumo' })).toBeDisabled();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar seleção' })); expect(saveSummarySelection).toHaveBeenCalledTimes(1);
  await act(async () => finish(['sound'])); expect(screen.getByText('Seleção salva.')).toBeOnTheScreen();
});
it('recovers a selection read failure without accepting writes or presentation', async () => {
  readSummarySelection.mockRejectedValueOnce(new Error('private path'));
  render(<SummarySelectionScreen onClose={onClose} onPresent={onPresent} />);
  await screen.findByRole('button', { name: 'Tentar abrir resumo novamente' });
  expect(screen.getByRole('button', { name: 'Salvar seleção' })).toBeDisabled(); expect(screen.queryByText('private path')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Tentar abrir resumo novamente' })); await ready();
});
it('presents selected nonempty current information with explicit false time, without save or sending', async () => {
  selected = ['instructions', 'extraTime', 'sound', 'light'];
  communication = { communication: 'Reservado', instructions: 'Imagens', extraTime: false };
  support = { ...emptySupportPreferences, sound: 'Som sintético', helpfulStrategies: 'Também reservado' };
  render(<ProfileSummaryScreen onClose={onClose} />); await screen.findByText('Imagens');
  expect(screen.getByText('Não preciso de tempo adicional.')).toBeOnTheScreen(); expect(screen.getByText('Som sintético')).toBeOnTheScreen();
  expect(screen.queryByText('Reservado')).toBeNull(); expect(screen.queryByText('Também reservado')).toBeNull(); expect(screen.queryByText('Luz')).toBeNull();
  expect(saveSummarySelection).not.toHaveBeenCalled(); expect(screen.getAllByRole('button')).toHaveLength(1);
  fireEvent.press(screen.getByRole('button', { name: 'Fechar resumo' })); expect(onClose).toHaveBeenCalledTimes(1);
});
it('reopens fresh values after edits/removal and shows an empty state rather than a snapshot', async () => {
  selected = ['instructions']; communication.instructions = 'Texto anterior';
  const view = render(<ProfileSummaryScreen onClose={onClose} />); await screen.findByText('Texto anterior'); view.unmount();
  communication.instructions = '';
  render(<ProfileSummaryScreen onClose={onClose} />); await screen.findByText('Nenhuma informação selecionada e preenchida para apresentar.');
  expect(screen.queryByText('Texto anterior')).toBeNull();
});
it('fails closed on presentation read errors and retries with fresh values only', async () => {
  selected = ['communication']; communication.communication = 'Atual';
  readProfileSummary.mockRejectedValueOnce(new Error('Conteúdo privado antigo'));
  render(<ProfileSummaryScreen onClose={onClose} />); await screen.findByRole('button', { name: 'Tentar abrir resumo novamente' });
  expect(screen.queryByText('Conteúdo privado antigo')).toBeNull(); expect(screen.queryByText('Atual')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Tentar abrir resumo novamente' })); await screen.findByText('Atual');
});
