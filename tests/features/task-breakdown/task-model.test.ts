import { newTaskStep, normalizedTaskDraft, removeTaskStep, reorderTaskStep, setTaskStepCompleted, taskProgress, type TaskDraft } from '../../../src/features/task-breakdown/task-model';
const steps = [{ id: 'step-a', title: 'Etapa A', completed: true }, { id: 'step-b', title: 'Etapa B', completed: false }];

it('creates an explicit blank step without inferring content or completion', () => {
  expect(newTaskStep('synthetic-step')).toEqual({ id: 'synthetic-step', title: '', completed: false });
});
it('normalizes only explicit required titles, clones state and accepts a principal task without steps', () => {
  expect(normalizedTaskDraft({ title: '  Tarefa sintética  ', steps: [] })).toEqual({ title: 'Tarefa sintética', steps: [] });
  const draft = { title: 'Tarefa', steps }; const saved = normalizedTaskDraft(draft);
  saved.steps[0].title = 'Outra etapa'; expect(draft.steps).toEqual(steps); expect(draft.steps[0].title).toBe('Etapa A');
});
it('reorders and handles boundaries without changing identities, titles or completion, including unfinished drafts', () => {
  expect(reorderTaskStep(steps, 'step-b', 'up')).toEqual([steps[1], steps[0]]);
  expect(reorderTaskStep(steps, 'step-a', 'up')).toEqual(steps);
  expect(reorderTaskStep([newTaskStep('a'), newTaskStep('b')], 'a', 'down').map(step => step.id)).toEqual(['b', 'a']);
  expect(steps[0].completed).toBe(true);
});
it('derives reversible completion without making an empty task falsely complete', () => {
  expect(taskProgress([])).toEqual({ completed: 0, total: 0, fraction: 0 });
  expect(taskProgress(steps)).toEqual({ completed: 1, total: 2, fraction: 0.5 });
  const done = setTaskStepCompleted(steps, 'step-b', true);
  expect(taskProgress(done).fraction).toBe(1); expect(taskProgress(setTaskStepCompleted(done, 'step-a', false)).fraction).toBe(0.5);
  expect(steps[1].completed).toBe(false);
});
it('removes only the targeted step and recalculates while preserving the others', () => {
  expect(removeTaskStep(steps, 'step-a')).toEqual([steps[1]]);
  expect(taskProgress(removeTaskStep(steps, 'step-a'))).toEqual({ completed: 0, total: 1, fraction: 0 });
  expect(steps).toHaveLength(2);
});
it('rejects empty saved titles, malformed data, duplicate identities and stale step targets generically', () => {
  const invalid = [{ title: ' ', steps: [] }, { title: 'Tarefa', steps: [newTaskStep('a')] },
    { title: 'Tarefa', steps: [steps[0], steps[0]] }, { title: 'Tarefa', steps: [{ ...steps[0], completed: 'true' }] }];
  for (const draft of invalid) expect(() => normalizedTaskDraft(draft as TaskDraft)).toThrow('Invalid task data.');
  expect(() => reorderTaskStep(steps, 'removed', 'up')).toThrow();
  expect(() => removeTaskStep(steps, 'removed')).toThrow();
  expect(() => setTaskStepCompleted(steps, 'removed', true)).toThrow();
});
