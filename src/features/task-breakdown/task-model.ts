export type TaskStep = { id: string; title: string; completed: boolean };
export type TaskDraft = { title: string; steps: TaskStep[] };
const invalid = () => new Error('Invalid task data.');

function checkedSteps(input: readonly TaskStep[]): TaskStep[] {
  if (!Array.isArray(input)) throw invalid();
  const ids = new Set<string>();
  return input.map(step => {
    if (!step || typeof step.id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(step.id) || ids.has(step.id)
      || typeof step.title !== 'string' || typeof step.completed !== 'boolean') throw invalid();
    ids.add(step.id); return { id: step.id, title: step.title, completed: step.completed };
  });
}
export function newTaskStep(id = `task-step-${Date.now()}-${Math.random().toString(36).slice(2)}`): TaskStep {
  return checkedSteps([{ id, title: '', completed: false }])[0];
}
export function normalizedTaskDraft(input: TaskDraft): TaskDraft {
  if (!input || typeof input.title !== 'string' || !input.title.trim()) throw invalid();
  const steps = checkedSteps(input.steps).map(step => {
    if (!step.title.trim()) throw invalid();
    return { ...step, title: step.title.trim() };
  });
  return { title: input.title.trim(), steps };
}
export function reorderTaskStep(input: readonly TaskStep[], id: string, direction: 'up' | 'down'): TaskStep[] {
  const steps = checkedSteps(input); const index = steps.findIndex(step => step.id === id);
  if (index < 0 || (direction !== 'up' && direction !== 'down')) throw invalid();
  const target = index + (direction === 'up' ? -1 : 1);
  if (target >= 0 && target < steps.length) [steps[index], steps[target]] = [steps[target], steps[index]];
  return steps;
}
export function removeTaskStep(input: readonly TaskStep[], id: string): TaskStep[] {
  const steps = checkedSteps(input);
  if (!steps.some(step => step.id === id)) throw invalid();
  return steps.filter(step => step.id !== id);
}
export function setTaskStepCompleted(input: readonly TaskStep[], id: string, completed: boolean): TaskStep[] {
  const steps = checkedSteps(input);
  if (typeof completed !== 'boolean' || !steps.some(step => step.id === id)) throw invalid();
  return steps.map(step => step.id === id ? { ...step, completed } : step);
}
export function taskProgress(input: readonly TaskStep[]) {
  const steps = checkedSteps(input); const completed = steps.filter(step => step.completed).length;
  return { completed, total: steps.length, fraction: steps.length === 0 ? 0 : completed / steps.length };
}
