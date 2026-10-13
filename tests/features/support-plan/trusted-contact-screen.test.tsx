import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { TrustedContactScreen } from '../../../src/features/support-plan/TrustedContactScreen';
import { openTrustedContactDatabase } from '../../../src/features/support-plan/trusted-contact-database';
import { emptyTrustedContact, normalizedTrustedContact, type TrustedContact } from '../../../src/features/support-plan/trusted-contact';
import { openWhatsAppDraft } from '../../../src/features/support-plan/whatsapp-handoff';
jest.mock('../../../src/features/support-plan/trusted-contact-database', () => ({ openTrustedContactDatabase: jest.fn() }));
jest.mock('../../../src/features/support-plan/whatsapp-handoff', () => ({ openWhatsAppDraft: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
const fixture = { name: 'Pessoa sintética', phone: '+12025550123', message: 'Mensagem sintética & tempo' };
let saved: TrustedContact; const save = jest.fn(); const read = jest.fn(); const onClose = jest.fn();
beforeEach(() => {
  jest.clearAllMocks(); saved = { ...emptyTrustedContact };
  save.mockReset().mockImplementation(async (value) => { saved = normalizedTrustedContact(value); return saved; });
  read.mockReset().mockImplementation(async () => saved);
  jest.mocked(openTrustedContactDatabase).mockResolvedValue({ read, save });
  jest.mocked(openWhatsAppDraft).mockReset().mockResolvedValue('opened');
});
async function ready() { await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar contato e mensagem' })).toBeEnabled()); }
function fill() {
  fireEvent.changeText(screen.getByLabelText('Nome (opcional)'), fixture.name);
  fireEvent.changeText(screen.getByLabelText('Telefone com código do país (+)'), '+1 (202) 555-0123');
  fireEvent.changeText(screen.getByLabelText('Mensagem padrão'), fixture.message);
}
function review() { fireEvent.press(screen.getByRole('button', { name: 'Revisar pedido de apoio' })); }
it('starts empty without reading the address book, saving or opening an external app — RF-008/RF-010', async () => {
  render(<TrustedContactScreen onClose={onClose} />); await ready();
  expect(screen.getByText('Ainda não há contato de confiança salvo.')).toBeOnTheScreen();
  expect(screen.getByLabelText('Nome (opcional)').props.value).toBe(''); expect(screen.getByLabelText('Mensagem padrão').props.value).toBe('');
  expect(screen.queryByRole('button', { name: 'Revisar pedido de apoio' })).toBeNull(); expect(save).not.toHaveBeenCalled(); expect(openWhatsAppDraft).not.toHaveBeenCalled();
});
it('saves explicitly, normalizes number and reopens confirmed local content without any handoff — RF-008', async () => {
  const view = render(<TrustedContactScreen onClose={onClose} />); await ready(); fill();
  expect(save).not.toHaveBeenCalled(); fireEvent.press(screen.getByRole('button', { name: 'Salvar contato e mensagem' }));
  await screen.findByText('Contato e mensagem salvos.'); expect(saved).toEqual(fixture); expect(openWhatsAppDraft).not.toHaveBeenCalled();
  view.unmount(); render(<TrustedContactScreen onClose={onClose} />); await ready();
  expect(screen.getByLabelText('Telefone com código do país (+)').props.value).toBe(fixture.phone);
  expect(screen.getByLabelText('Mensagem padrão').props.value).toBe(fixture.message);
});
it('rejects invalid configuration while retaining input and the previous confirmed contact', async () => {
  saved = { ...fixture }; render(<TrustedContactScreen onClose={onClose} />); await ready();
  fireEvent.changeText(screen.getByLabelText('Telefone com código do país (+)'), 'invalid');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar contato e mensagem' }));
  await screen.findByText(/Informe um telefone internacional válido/);
  expect(save).not.toHaveBeenCalled(); expect(saved).toEqual(fixture); expect(screen.getByLabelText('Telefone com código do país (+)').props.value).toBe('invalid');
  expect(screen.getByRole('button', { name: 'Revisar pedido de apoio' })).toBeDisabled(); expect(openWhatsAppDraft).not.toHaveBeenCalled();
});
it('cancels draft input and keeps it after a failed save until an explicit retry', async () => {
  render(<TrustedContactScreen onClose={onClose} />); await ready(); fill();
  fireEvent.press(screen.getByRole('button', { name: 'Cancelar e voltar' })); expect(onClose).toHaveBeenCalled(); expect(save).not.toHaveBeenCalled();
  save.mockRejectedValueOnce(new Error('private content'));
  fireEvent.press(screen.getByRole('button', { name: 'Salvar contato e mensagem' })); await screen.findByText(/Seu preenchimento e a versão salva foram mantidos/);
  expect(saved).toEqual(emptyTrustedContact); expect(screen.queryByText('private content')).toBeNull();
  expect(screen.getByLabelText('Mensagem padrão').props.value).toBe(fixture.message);
  fireEvent.press(screen.getByRole('button', { name: 'Salvar contato e mensagem' })); await screen.findByText('Contato e mensagem salvos.'); expect(saved).toEqual(fixture);
});
it('requires confirmation to remove, supports cancel and retry without implicit handoff', async () => {
  saved = { ...fixture }; render(<TrustedContactScreen onClose={onClose} />); await ready();
  fireEvent.press(screen.getByRole('button', { name: 'Remover contato e mensagem' })); fireEvent.press(screen.getByRole('button', { name: 'Manter contato e mensagem' })); expect(save).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Remover contato e mensagem' })); save.mockRejectedValueOnce(new Error('private content'));
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar remoção do contato' })); await screen.findByText(/Seu preenchimento e a versão salva foram mantidos/); expect(saved).toEqual(fixture);
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar remoção do contato' })); await screen.findByText('Contato e mensagem removidos.');
  expect(saved).toEqual(emptyTrustedContact); expect(screen.queryByRole('button', { name: 'Revisar pedido de apoio' })).toBeNull(); expect(openWhatsAppDraft).not.toHaveBeenCalled();
});
it('requires removal confirmation even when all fields are cleared and saved manually', async () => {
  saved = { ...fixture }; render(<TrustedContactScreen onClose={onClose} />); await ready();
  fireEvent.changeText(screen.getByLabelText('Nome (opcional)'), '');
  fireEvent.changeText(screen.getByLabelText('Telefone com código do país (+)'), '');
  fireEvent.changeText(screen.getByLabelText('Mensagem padrão'), '');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar contato e mensagem' })); expect(save).not.toHaveBeenCalled(); expect(saved).toEqual(fixture);
  fireEvent.press(screen.getByRole('button', { name: 'Manter contato e mensagem' })); expect(saved).toEqual(fixture);
  fireEvent.press(screen.getByRole('button', { name: 'Salvar contato e mensagem' }));
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar remoção do contato' })); await screen.findByText('Contato e mensagem removidos.');
  expect(saved).toEqual(emptyTrustedContact); expect(openWhatsAppDraft).not.toHaveBeenCalled();
});
it('shows confirmed destination/message and consequences for review, allowing cancellation without leaving TEAr — RF-010', async () => {
  saved = { ...fixture }; render(<TrustedContactScreen onClose={onClose} />); await ready(); review();
  expect(screen.getByText(fixture.phone)).toBeOnTheScreen(); expect(screen.getByText(fixture.message)).toBeOnTheScreen();
  expect(screen.getByText(/este telefone e esta mensagem serão encaminhados/)).toBeOnTheScreen(); expect(openWhatsAppDraft).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Cancelar abertura' }));
  expect(screen.queryByRole('button', { name: 'Confirmar abertura do WhatsApp' })).toBeNull(); expect(openWhatsAppDraft).not.toHaveBeenCalled();
});
it('opens only after explicit review and confirmation, never claims message delivery — RF-009/RF-010', async () => {
  saved = { ...fixture }; render(<TrustedContactScreen onClose={onClose} />); await ready(); review();
  expect(openWhatsAppDraft).not.toHaveBeenCalled(); fireEvent.press(screen.getByRole('button', { name: 'Confirmar abertura do WhatsApp' }));
  await screen.findByText('Pedido de abertura encaminhado ao WhatsApp. O envio não foi confirmado.');
  expect(openWhatsAppDraft).toHaveBeenCalledTimes(1); expect(openWhatsAppDraft).toHaveBeenCalledWith(fixture); expect(save).not.toHaveBeenCalled();
});
it.each(['unavailable', 'failed'] as const)('retains contact/message after %s handoff and allows only an explicit retry — RF-011', async (result) => {
  saved = { ...fixture }; jest.mocked(openWhatsAppDraft).mockResolvedValueOnce(result);
  render(<TrustedContactScreen onClose={onClose} />); await ready(); review(); fireEvent.press(screen.getByRole('button', { name: 'Confirmar abertura do WhatsApp' }));
  await screen.findByText(result === 'unavailable' ? 'WhatsApp indisponível. O contato e a mensagem foram mantidos.' : 'Não foi possível abrir o WhatsApp. Nada foi enviado pelo TEAr. Tente novamente ou cancele.');
  expect(saved).toEqual(fixture); expect(openWhatsAppDraft).toHaveBeenCalledTimes(1);
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar abertura do WhatsApp' })); await screen.findByText(/Pedido de abertura encaminhado/);
  expect(openWhatsAppDraft).toHaveBeenCalledTimes(2);
});
it('handles unexpected handoff rejection without exposing a private URL or dropping confirmed data', async () => {
  saved = { ...fixture }; jest.mocked(openWhatsAppDraft).mockRejectedValueOnce(new Error('private URL'));
  render(<TrustedContactScreen onClose={onClose} />); await ready(); review(); fireEvent.press(screen.getByRole('button', { name: 'Confirmar abertura do WhatsApp' }));
  await screen.findByText(/Não foi possível abrir o WhatsApp/); expect(screen.queryByText('private URL')).toBeNull(); expect(saved).toEqual(fixture);
});
it('discards the review when edited and blocks launching an unsaved draft', async () => {
  saved = { ...fixture }; render(<TrustedContactScreen onClose={onClose} />); await ready(); review();
  fireEvent.changeText(screen.getByLabelText('Mensagem padrão'), 'Rascunho não confirmado');
  expect(screen.queryByRole('button', { name: 'Confirmar abertura do WhatsApp' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Revisar pedido de apoio' })).toBeDisabled(); expect(openWhatsAppDraft).not.toHaveBeenCalled();
});
it('blocks duplicate saves and does not publish success before commit', async () => {
  let finish!: (value: TrustedContact) => void;
  save.mockImplementationOnce(() => new Promise<TrustedContact>((resolve) => { finish = resolve; }));
  render(<TrustedContactScreen onClose={onClose} />); await ready(); fill(); fireEvent.press(screen.getByRole('button', { name: 'Salvar contato e mensagem' }));
  expect(screen.queryByText('Contato e mensagem salvos.')).toBeNull(); expect(screen.getByRole('button', { name: 'Cancelar e voltar' })).toBeDisabled();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar contato e mensagem' })); expect(save).toHaveBeenCalledTimes(1);
  await act(async () => finish(fixture)); expect(screen.getByText('Contato e mensagem salvos.')).toBeOnTheScreen();
});
it('blocks duplicate handoffs and keeps editing/cancellation unavailable while opening', async () => {
  saved = { ...fixture }; let finish!: (value: 'opened') => void;
  jest.mocked(openWhatsAppDraft).mockImplementationOnce(() => new Promise<'opened'>((resolve) => { finish = resolve; }));
  render(<TrustedContactScreen onClose={onClose} />); await ready(); review(); fireEvent.press(screen.getByRole('button', { name: 'Confirmar abertura do WhatsApp' }));
  expect(screen.getByRole('button', { name: 'Confirmar abertura do WhatsApp' })).toBeDisabled(); expect(screen.getByRole('button', { name: 'Cancelar abertura' })).toBeDisabled();
  expect(screen.queryByText(/Pedido de abertura encaminhado/)).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar abertura do WhatsApp' })); expect(openWhatsAppDraft).toHaveBeenCalledTimes(1);
  await act(async () => finish('opened')); expect(screen.getByText(/Pedido de abertura encaminhado/)).toBeOnTheScreen();
});
it('recovers initialization failure without accepting writes/handoff or exposing private details', async () => {
  jest.mocked(openTrustedContactDatabase).mockRejectedValueOnce(new Error('private path'));
  render(<TrustedContactScreen onClose={onClose} />); await screen.findByRole('button', { name: 'Tentar abrir contato novamente' });
  expect(screen.getByRole('button', { name: 'Salvar contato e mensagem' })).toBeDisabled(); expect(screen.queryByText('private path')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Tentar abrir contato novamente' })); await ready(); expect(openWhatsAppDraft).not.toHaveBeenCalled();
});
