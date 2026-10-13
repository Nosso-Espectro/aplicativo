import { supportFields, type SupportField } from '../communication-profile/support-preferences';

export const suggestedOrientations = [
  { id: 'no-touch', label: 'Não me toque' },
  { id: 'few-words', label: 'Fale pouco' },
  { id: 'quiet', label: 'Preciso de silêncio' },
  { id: 'response-time', label: 'Dê-me tempo para responder' },
] as const;
export type SuggestedOrientation = typeof suggestedOrientations[number]['id'];
export type SupportPlan = { instructions: string; suggestions: SuggestedOrientation[]; profileFields: SupportField[] };
export const emptySupportPlan: SupportPlan = { instructions: '', suggestions: [], profileFields: [] };

export function normalizedSupportPlan(input: SupportPlan): SupportPlan {
  if (!input || typeof input.instructions !== 'string' || !Array.isArray(input.suggestions) || !Array.isArray(input.profileFields)
    || !input.suggestions.every((id) => suggestedOrientations.some((item) => item.id === id))
    || !input.profileFields.every((id) => supportFields.some((item) => item.id === id))) throw new Error('Invalid support plan.');
  return {
    instructions: input.instructions.trim(),
    suggestions: suggestedOrientations.filter(({ id }) => input.suggestions.includes(id)).map(({ id }) => id),
    profileFields: supportFields.filter(({ id }) => input.profileFields.includes(id)).map(({ id }) => id),
  };
}
export function hasSupportPlan(input: SupportPlan): boolean {
  const plan = normalizedSupportPlan(input);
  return !!(plan.instructions || plan.suggestions.length || plan.profileFields.length);
}
