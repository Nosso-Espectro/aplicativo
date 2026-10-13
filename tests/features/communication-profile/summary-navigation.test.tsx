import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { act } from '@testing-library/react-native';
import ProfileRoute from '../../../src/app/profile';
import SelectionRoute from '../../../src/app/profile-summary';
import SummaryRoute from '../../../src/app/profile-summary-view';
import { openPreferencesDatabase } from '../../../src/features/communication-profile/preferences-database';
import { buildProfileSummary, normalizedSummarySelection, type SummaryField } from '../../../src/features/communication-profile/profile-summary';
import { emptyPreferences } from '../../../src/features/communication-profile/preferences';
import { emptySupportPreferences } from '../../../src/features/communication-profile/support-preferences';
jest.mock('../../../src/features/communication-profile/preferences-database', () => ({ openPreferencesDatabase: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
const routes = { profile: ProfileRoute, 'profile-summary': SelectionRoute, 'profile-summary-view': SummaryRoute };
const save = jest.fn();
beforeEach(() => {
  jest.clearAllMocks(); let selected: SummaryField[] = [];
  const communication = { ...emptyPreferences, instructions: 'Imagens sintéticas', communication: 'Não escolhido' };
  jest.mocked(openPreferencesDatabase).mockResolvedValue({
    read: async () => communication, save, readSupport: jest.fn(), saveSupport: jest.fn(), readSupportForPlan: jest.fn(),
    readSummarySelection: async () => selected,
    saveSummarySelection: async (input) => { selected = normalizedSummarySelection(input); return selected; },
    readProfileSummary: async () => buildProfileSummary(communication, emptySupportPreferences, selected),
  });
});
it('navigates profile → explicit selection/save → full-screen summary → selection/profile without autosaving', async () => {
  const { getPathname } = renderRouter(routes, { initialUrl: '/profile' });
  await act(async () => {});
  await screen.findByDisplayValue('Imagens sintéticas');
  fireEvent.changeText(screen.getByLabelText('Formas preferidas de comunicação'), 'Rascunho');
  await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Resumo do perfil' })));
  await screen.findByText('Nenhuma informação selecionada.'); expect(getPathname()).toBe('/profile-summary');
  fireEvent.press(screen.getByRole('checkbox', { name: 'Como prefiro receber informações' }));
  fireEvent.press(screen.getByRole('button', { name: 'Salvar seleção' })); await screen.findByText('Seleção salva.');
  expect(getPathname()).toBe('/profile-summary');
  await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Apresentar resumo' })));
  await screen.findByText('Imagens sintéticas'); expect(getPathname()).toBe('/profile-summary-view');
  expect(screen.queryByText('Não escolhido')).toBeNull(); expect(screen.queryByText('Rascunho')).toBeNull();
  await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Fechar resumo' }))); expect(getPathname()).toBe('/profile-summary');
  await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Cancelar e voltar' }))); expect(getPathname()).toBe('/profile');
  expect(save).not.toHaveBeenCalled();
});
it('opens a direct presentation route with no selected data and a safe exit', async () => {
  const { getPathname } = renderRouter(routes, { initialUrl: '/profile-summary-view' });
  await act(async () => {});
  await screen.findByText('Nenhuma informação selecionada e preenchida para apresentar.');
  expect(screen.queryByText('Imagens sintéticas')).toBeNull();
  await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Fechar resumo' })));
  await screen.findByRole('header', { name: 'Informações do resumo' }); expect(getPathname()).toBe('/profile-summary');
});
