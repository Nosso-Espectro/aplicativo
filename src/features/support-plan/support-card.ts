import { normalizedSupportPlan, suggestedOrientations, type SupportPlan } from './support-plan';

export type SupportCardOrientation = { id: string; value: string };

export function supportCardOrientations(input: SupportPlan): SupportCardOrientation[] {
  const plan = normalizedSupportPlan(input);
  return [
    ...(plan.instructions ? [{ id: 'instructions', value: plan.instructions }] : []),
    ...suggestedOrientations.filter(({ id }) => plan.suggestions.includes(id)).map(({ id, label }) => ({ id, value: label })),
  ];
}
