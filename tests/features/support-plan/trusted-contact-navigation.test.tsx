import { act } from '@testing-library/react-native';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import StartupRoute from '../../../src/app';
import RootLayout from '../../../src/app/_layout';
import TrustedContactRoute from '../../../src/app/trusted-contact';
import { openTrustedContactDatabase } from '../../../src/features/support-plan/trusted-contact-database';
import { emptyTrustedContact } from '../../../src/features/support-plan/trusted-contact';
import { openWhatsAppDraft } from '../../../src/features/support-plan/whatsapp-handoff';
jest.mock('../../../src/features/support-plan/trusted-contact-database', () => ({ openTrustedContactDatabase: jest.fn() }));
jest.mock('../../../src/features/support-plan/whatsapp-handoff', () => ({ openWhatsAppDraft: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
const save = jest.fn(); const routes = { _layout: RootLayout, index: StartupRoute, 'trusted-contact': TrustedContactRoute };
beforeEach(() => { jest.clearAllMocks(); jest.mocked(openTrustedContactDatabase).mockResolvedValue({ read: async () => ({ ...emptyTrustedContact }), save }); });
it('opens configuration from the board, then returns without saving or opening an external app', async () => {
  const { getPathname } = renderRouter(routes, { initialUrl: '/' }); await screen.findByRole('header', { name: 'TEAr' });
  await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Abrir ferramentas' })));
  await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Abrir contato de confiança' })));
  await screen.findByText('Ainda não há contato de confiança salvo.'); expect(getPathname()).toBe('/trusted-contact');
  fireEvent.changeText(screen.getByLabelText('Nome (opcional)'), 'Rascunho sintético');
  await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Cancelar e voltar' })));
  expect(getPathname()).toBe('/'); expect(save).not.toHaveBeenCalled(); expect(openWhatsAppDraft).not.toHaveBeenCalled();
});
it('returns safely to the board from a directly opened configuration route', async () => {
  const { getPathname } = renderRouter(routes, { initialUrl: '/trusted-contact' }); await screen.findByText('Ainda não há contato de confiança salvo.');
  await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Cancelar e voltar' })));
  await screen.findByRole('header', { name: 'TEAr' }); expect(getPathname()).toBe('/'); expect(openWhatsAppDraft).not.toHaveBeenCalled();
});
