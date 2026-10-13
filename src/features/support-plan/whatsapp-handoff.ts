import { Linking, Platform } from 'react-native';
import { createWhatsAppDraftLink, type TrustedContact } from './trusted-contact';

export async function openWhatsAppDraft(contact: TrustedContact): Promise<'opened' | 'unavailable' | 'failed'> {
  try {
    const url = createWhatsAppDraftLink(contact);
    if (Platform.OS === 'web' || !await Linking.canOpenURL('whatsapp://send')) return 'unavailable';
    await Linking.openURL(url);
    return 'opened';
  } catch { return 'failed'; }
}
