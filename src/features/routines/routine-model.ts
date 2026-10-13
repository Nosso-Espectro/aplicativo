export type RoutineStep = { id: string; title: string; imageUri: string | null };
export type RoutineDraft = { name: string; steps: RoutineStep[] };
export type Routine = RoutineDraft & { id: string };

export function newStep(): RoutineStep {
  return { id: `step-${Date.now()}-${Math.random().toString(36).slice(2)}`, title: '', imageUri: null };
}
export function validateRoutine(draft: RoutineDraft) {
  return {
    name: draft.name.trim() ? null : 'Informe o nome da rotina.',
    steps: draft.steps.map((step) => step.title.trim() ? null : 'Informe o título da etapa.'),
  };
}
export function normalizedRoutine(draft: RoutineDraft): RoutineDraft {
  const errors = validateRoutine(draft);
  if (errors.name || errors.steps.some(Boolean) || new Set(draft.steps.map((step) => step.id)).size !== draft.steps.length) {
    throw new Error('Invalid routine.');
  }
  return { name: draft.name.trim(), steps: draft.steps.map((step) => ({ ...step, title: step.title.trim() })) };
}
