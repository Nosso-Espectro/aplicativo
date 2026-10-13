export type CommunicationPreferences = { communication: string; instructions: string; extraTime: boolean | null };
export const emptyPreferences: CommunicationPreferences = { communication: '', instructions: '', extraTime: null };
export function normalizedPreferences(value: CommunicationPreferences): CommunicationPreferences {
  if (typeof value.communication !== 'string' || typeof value.instructions !== 'string'
    || (value.extraTime !== null && typeof value.extraTime !== 'boolean')) throw new Error('Invalid preferences.');
  return { communication: value.communication.trim(), instructions: value.instructions.trim(), extraTime: value.extraTime };
}
export function hasPreferences(value: CommunicationPreferences) {
  return Boolean(value.communication || value.instructions || value.extraTime !== null);
}
