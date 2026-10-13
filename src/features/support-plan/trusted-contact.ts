import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

export type TrustedContact = { name: string; phone: string; message: string };
export const emptyTrustedContact: TrustedContact = { name: '', phone: '', message: '' };

export function normalizedTrustedContact(input: TrustedContact): TrustedContact {
  if (!input || ![input.name, input.phone, input.message].every((value) => typeof value === 'string')) throw new Error('Invalid trusted contact.');
  const name = input.name.trim(); const rawPhone = input.phone.trim(); const message = input.message.trim();
  if (!name && !rawPhone && !message) return { ...emptyTrustedContact };
  const phone = parsePhoneNumberFromString(rawPhone, { extract: false });
  if (!rawPhone.startsWith('+') || !phone?.isValid() || phone.ext || !message) throw new Error('Invalid trusted contact.');
  return { name, phone: phone.number, message };
}

export function createWhatsAppDraftLink(input: TrustedContact): string {
  const contact = normalizedTrustedContact(input);
  if (!contact.phone) throw new Error('Trusted contact not configured.');
  try { return `https://wa.me/${contact.phone.slice(1)}?text=${encodeURIComponent(contact.message)}`; }
  catch { throw new Error('Invalid contact message.'); }
}
