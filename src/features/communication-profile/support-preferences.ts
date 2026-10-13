export const supportFields = [
  { id: 'sound', label: 'Som' },
  { id: 'light', label: 'Luz' },
  { id: 'touch', label: 'Toque' },
  { id: 'temperature', label: 'Temperatura' },
  { id: 'other', label: 'Outras sensibilidades' },
  { id: 'helpfulStrategies', label: 'Estratégias que ajudam' },
  { id: 'avoidStrategies', label: 'Estratégias a evitar' },
] as const;
export type SupportField = typeof supportFields[number]['id'];
export type SupportPreferences = Record<SupportField, string>;
export const emptySupportPreferences: SupportPreferences = {
  sound: '', light: '', touch: '', temperature: '', other: '', helpfulStrategies: '', avoidStrategies: '',
};
export function hasSupportPreferences(input: SupportPreferences) {
  return supportFields.some((field) => input[field.id].trim() !== '');
}
export function normalizedSupportPreferences(input: SupportPreferences): SupportPreferences {
  if (!supportFields.every((field) => typeof input[field.id] === 'string')) throw new Error('Invalid support preferences.');
  return Object.fromEntries(supportFields.map((field) => [field.id, input[field.id].trim()])) as SupportPreferences;
}
export function supportForPlan(current: SupportPreferences, selected: readonly SupportField[] = []) {
  const fields = [...new Set(selected)];
  if (!fields.every((id) => supportFields.some((field) => field.id === id))) throw new Error('Invalid support selection.');
  const normalized = normalizedSupportPreferences(current);
  return fields.flatMap((id) => {
    const field = supportFields.find((field) => field.id === id)!;
    return normalized[id] ? [{ field: id, label: field.label, value: normalized[id] }] : [];
  });
}
