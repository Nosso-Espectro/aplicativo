import { normalizedPreferences, type CommunicationPreferences } from './preferences';
import { normalizedSupportPreferences, supportFields, type SupportPreferences } from './support-preferences';

export const summaryFields = [
  { id: 'communication', label: 'Formas preferidas de comunicação' },
  { id: 'instructions', label: 'Como prefiro receber informações' },
  { id: 'extraTime', label: 'Tempo adicional para responder' },
  ...supportFields,
] as const;
export type SummaryField = typeof summaryFields[number]['id'];

export function normalizedSummarySelection(selected: readonly SummaryField[]): SummaryField[] {
  if (!Array.isArray(selected) || !selected.every((id) => summaryFields.some((field) => field.id === id))) {
    throw new Error('Invalid summary selection.');
  }
  return summaryFields.filter((field) => selected.includes(field.id)).map((field) => field.id);
}
export function buildProfileSummary(communication: CommunicationPreferences, support: SupportPreferences, selected: readonly SummaryField[] = []) {
  const chosen = normalizedSummarySelection(selected);
  const current = normalizedPreferences(communication);
  const values: Record<SummaryField, string> = {
    ...normalizedSupportPreferences(support), communication: current.communication, instructions: current.instructions,
    extraTime: current.extraTime === null ? '' : current.extraTime ? 'Preciso de tempo adicional.' : 'Não preciso de tempo adicional.',
  };
  return chosen.flatMap((id) => values[id] ? [{ field: id, label: summaryFields.find((field) => field.id === id)!.label, value: values[id] }] : []);
}
