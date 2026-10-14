import { act } from '@testing-library/react-native';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import Panel from '../../../src/app/regulation';
import Card from '../../../src/app/support-card';
import { openSupportPlanDatabase } from '../../../src/features/support-plan/support-plan-database';
import { openPreferencesDatabase } from '../../../src/features/communication-profile/preferences-database';
import { emptySupportPlan, type SupportPlan } from '../../../src/features/support-plan/support-plan';
jest.mock('../../../src/features/support-plan/support-plan-database', () => ({ openSupportPlanDatabase: jest.fn() }));
jest.mock('../../../src/features/communication-profile/preferences-database', () => ({ openPreferencesDatabase: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let saved: SupportPlan; const save = jest.fn();
const routes = { regulation: Panel, 'support-card': Card };
beforeEach(() => {
  jest.clearAllMocks(); saved = { ...emptySupportPlan, instructions: 'Orientação sintética confirmada' };
  jest.mocked(openSupportPlanDatabase).mockResolvedValue({ read: async () => saved, save });
});
async function press(name: string) { await act(async () => fireEvent.press(screen.getByRole('button', { name }))); }
it('opens the actual read-only full-screen card directly from the real panel and returns without saving', async () => {
  const { getPathname } = renderRouter(routes, { initialUrl: '/regulation' });
  await press('Cartão de apoio'); await screen.findByText(saved.instructions); expect(getPathname()).toBe('/support-card');
  expect(screen.queryByRole('textbox')).toBeNull(); expect(screen.queryByRole('switch')).toBeNull();
  await press('Fechar cartão e voltar ao painel'); expect(getPathname()).toBe('/regulation');
  expect(screen.getByRole('button', { name: 'Sons' })).toBeOnTheScreen();
  saved = { ...emptySupportPlan }; await press('Cartão de apoio'); await screen.findByText('Nenhuma orientação preenchida para apresentar.');
  expect(screen.queryByText('Orientação sintética confirmada')).toBeNull(); expect(save).not.toHaveBeenCalled();
  expect(openPreferencesDatabase).not.toHaveBeenCalled();
});
it('returns to the real panel from a direct card link even when reading fails and there is no history', async () => {
  jest.mocked(openSupportPlanDatabase).mockRejectedValue(new Error('Synthetic store unavailable'));
  const { getPathname } = renderRouter(routes, { initialUrl: '/support-card' });
  await screen.findByRole('button', { name: 'Tentar abrir cartão novamente' });
  await press('Fechar cartão e voltar ao painel'); expect(getPathname()).toBe('/regulation');
  expect(screen.getByRole('button', { name: 'Comunicação' })).toBeOnTheScreen(); expect(save).not.toHaveBeenCalled();
});
