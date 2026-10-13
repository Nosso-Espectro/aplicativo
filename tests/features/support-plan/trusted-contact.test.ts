import { createWhatsAppDraftLink, emptyTrustedContact, normalizedTrustedContact, type TrustedContact } from '../../../src/features/support-plan/trusted-contact';
const fixture = { name: 'Pessoa sintética', phone: '+1 202 555 0123', message: 'Mensagem sintética' };

it('starts empty, allows clearing and never invents a contact or default message — spec004/RF-008', () => {
  expect(normalizedTrustedContact(emptyTrustedContact)).toEqual(emptyTrustedContact);
  expect(normalizedTrustedContact({ name: ' ', phone: ' ', message: '\n' })).toEqual(emptyTrustedContact);
  expect(() => createWhatsAppDraftLink(emptyTrustedContact)).toThrow('Trusted contact not configured.');
});
it('normalizes explicit international numbers with the real parser and preserves optional name/free text — RF-008', () => {
  expect(normalizedTrustedContact({ ...fixture, name: '  Pessoa sintética  ', message: '  Linha um\nLinha dois  ' })).toEqual({
    name: 'Pessoa sintética', phone: '+12025550123', message: 'Linha um\nLinha dois',
  });
  expect(normalizedTrustedContact({ ...fixture, name: '' }).name).toBe('');
});
it('rejects missing country code, malformed numbers, extensions and blank messages without leaking input', () => {
  for (const input of [
    { ...fixture, phone: '2025550123' }, { ...fixture, phone: '+999123456789' }, { ...fixture, phone: '+12' },
    { ...fixture, phone: 'call +1 202 555 0123' }, { ...fixture, phone: '+1 202 555 0123 ext. 1' },
    { ...fixture, message: '\n ' }, { name: 'Nome isolado', phone: '', message: '' },
    { ...fixture, message: null }, null,
  ]) expect(() => normalizedTrustedContact(input as unknown as TrustedContact)).toThrow('Invalid trusted contact.');
});
it('constructs only an encoded official draft link, excludes local name and never sends anything — RF-009/RF-010', () => {
  const message = 'Preciso de silêncio & tempo\n# pausa + ajuda?';
  const link = createWhatsAppDraftLink({ ...fixture, message });
  const url = new URL(link);
  expect(url.origin).toBe('https://wa.me'); expect(url.pathname).toBe('/12025550123');
  expect([...url.searchParams.keys()]).toEqual(['text']); expect(url.searchParams.get('text')).toBe(message);
  expect(link).not.toContain(fixture.name); expect(link).toContain('%26'); expect(link).toContain('%0A');
});
it('rejects an unencodable message generically rather than constructing a partial outgoing link', () => {
  expect(() => createWhatsAppDraftLink({ ...fixture, message: '\uD800' })).toThrow('Invalid contact message.');
});
