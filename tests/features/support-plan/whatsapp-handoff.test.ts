import { Linking, Platform } from 'react-native';
import { openWhatsAppDraft } from '../../../src/features/support-plan/whatsapp-handoff';
import { createWhatsAppDraftLink, emptyTrustedContact } from '../../../src/features/support-plan/trusted-contact';
const fixture = { name: 'Pessoa sintética', phone: '+12025550123', message: 'Mensagem sintética & tempo' };
beforeEach(() => {
  jest.replaceProperty(Platform, 'OS', 'android');
  jest.spyOn(Linking, 'canOpenURL').mockReset().mockResolvedValue(true); jest.spyOn(Linking, 'openURL').mockReset().mockResolvedValue(undefined);
});
afterEach(() => jest.restoreAllMocks());
it.each(['android', 'ios'] as const)('checks availability and requests only an official prefilled link on %s — RF-009/RF-010', async (platform) => {
  jest.replaceProperty(Platform, 'OS', platform);
  expect(await openWhatsAppDraft(fixture)).toBe('opened');
  expect(Linking.canOpenURL).toHaveBeenCalledWith('whatsapp://send');
  expect(Linking.openURL).toHaveBeenCalledTimes(1); expect(Linking.openURL).toHaveBeenCalledWith(createWhatsAppDraftLink(fixture));
});
it('returns unavailable without opening a browser, another scheme or sending anything — RF-011', async () => {
  jest.mocked(Linking.canOpenURL).mockResolvedValueOnce(false);
  expect(await openWhatsAppDraft(fixture)).toBe('unavailable'); expect(Linking.openURL).not.toHaveBeenCalled();
});
it('handles availability rejection generically without any fallback or private error — RF-011', async () => {
  jest.mocked(Linking.canOpenURL).mockRejectedValueOnce(new Error('private error'));
  expect(await openWhatsAppDraft(fixture)).toBe('failed'); expect(Linking.openURL).not.toHaveBeenCalled();
});
it('handles opening failure/cancellation without retrying automatically', async () => {
  jest.mocked(Linking.openURL).mockRejectedValueOnce(new Error('private URL'));
  expect(await openWhatsAppDraft(fixture)).toBe('failed'); expect(Linking.openURL).toHaveBeenCalledTimes(1);
});
it('rejects absent/invalid confirmed data before checking or opening external apps', async () => {
  expect(await openWhatsAppDraft(emptyTrustedContact)).toBe('failed');
  expect(await openWhatsAppDraft({ ...fixture, phone: 'invalid' })).toBe('failed');
  expect(Linking.canOpenURL).not.toHaveBeenCalled(); expect(Linking.openURL).not.toHaveBeenCalled();
});
it('reports the native handoff unavailable in the web preview rather than opening a private link', async () => {
  jest.replaceProperty(Platform, 'OS', 'web');
  expect(await openWhatsAppDraft(fixture)).toBe('unavailable'); expect(Linking.canOpenURL).not.toHaveBeenCalled(); expect(Linking.openURL).not.toHaveBeenCalled();
});
