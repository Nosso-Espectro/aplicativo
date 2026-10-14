import { act, waitFor } from '@testing-library/react-native';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import StartupRoute from '../../../src/app';
import RootLayout from '../../../src/app/_layout';
import SupportPlanRoute from '../../../src/app/support-plan';
import { openSupportPlanDatabase } from '../../../src/features/support-plan/support-plan-database';
import { emptySupportPlan, normalizedSupportPlan } from '../../../src/features/support-plan/support-plan';
jest.mock('../../../src/features/support-plan/support-plan-database', () => ({ openSupportPlanDatabase: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
const save = jest.fn();
const routes = { _layout: RootLayout, index: StartupRoute, 'support-plan': SupportPlanRoute };
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(openSupportPlanDatabase).mockResolvedValue({ read: async () => normalizedSupportPlan(emptySupportPlan), save });
});
it('opens the real editor from the board and cancels back without implicitly saving', async () => {
  const { getPathname } = renderRouter(routes, { initialUrl: '/' }); await screen.findByRole('header', { name: 'TEAr' });
  await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Abrir ferramentas' })));
  await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Abrir plano de apoio' })));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar plano' })).toBeEnabled()); expect(getPathname()).toBe('/support-plan');
  fireEvent.changeText(screen.getByLabelText('Minhas orientações'), 'Rascunho sintético');
  await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Cancelar e voltar' })));
  expect(getPathname()).toBe('/'); expect(save).not.toHaveBeenCalled();
});
it('returns safely to the board when the editor is opened directly', async () => {
  const { getPathname } = renderRouter(routes, { initialUrl: '/support-plan' });
  await screen.findByText('Ainda não há orientações salvas.');
  await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Cancelar e voltar' })));
  await screen.findByRole('header', { name: 'TEAr' }); expect(getPathname()).toBe('/'); expect(save).not.toHaveBeenCalled();
});
