import { normalizedTemplateDraft, taskFromTemplate, templateFromTask } from '../../../src/features/task-breakdown/task-template-model';
const source = { title: '  Tarefa sintética  ', steps: [{ id: 'source-a', title: '  Uma  ', completed: true }, { id: 'source-b', title: 'Duas', completed: false }] };
it('saves normalized ordered content without retaining progress or source references', () => {
  const result = templateFromTask(source);
  expect(result).toEqual({ title: 'Tarefa sintética', steps: [{ id: 'source-a', title: 'Uma' }, { id: 'source-b', title: 'Duas' }] });
  result.steps[0].title = 'Modelo editado'; expect(source.steps[0].title).toBe('  Uma  ');
  expect(source.steps[0].completed).toBe(true);
});
it('creates independent copies with fresh step identities and no completed steps', () => {
  const template = templateFromTask(source); let counter = 0;
  const createStep = () => ({ id: `copy-${++counter}`, title: '', completed: true });
  const first = taskFromTemplate(template, createStep); const second = taskFromTemplate(template, createStep);
  expect(first.steps.map(step => [step.id, step.title, step.completed])).toEqual([['copy-1', 'Uma', false], ['copy-2', 'Duas', false]]);
  first.title = 'Cópia editada'; first.steps[0].title = 'Nova etapa'; first.steps[0].completed = true;
  expect(second.steps[0]).toEqual({ id: 'copy-3', title: 'Uma', completed: false });
  expect(template.steps[0]).toEqual({ id: 'source-a', title: 'Uma' });
});
it('supports a named empty model and task without invented steps or completion', () => {
  const template = templateFromTask({ title: 'Vazia', steps: [] });
  expect(taskFromTemplate(template)).toEqual({ title: 'Vazia', steps: [] });
});
it('validates titles and unique step IDs and strips foreign fields', () => {
  expect(() => normalizedTemplateDraft({ title: ' ', steps: [] })).toThrow();
  expect(() => normalizedTemplateDraft({ title: 'Teste', steps: [{ id: 'a', title: '' }] })).toThrow();
  expect(() => normalizedTemplateDraft({ title: 'Teste', steps: [{ id: 'a', title: 'Uma' }, { id: 'a', title: 'Outra' }] })).toThrow();
  expect(normalizedTemplateDraft(source)).toEqual(templateFromTask(source));
});
it('rejects reused source identities and duplicate factory identities', () => {
  const template = templateFromTask(source);
  expect(() => taskFromTemplate(template, () => ({ id: 'source-a', title: '', completed: false }))).toThrow('Independent step identity required.');
  expect(() => taskFromTemplate(template, () => ({ id: 'duplicate', title: '', completed: false }))).toThrow();
});
it('does not mutate the original template when normalizing an edit', () => {
  const template = templateFromTask(source); const edit = normalizedTemplateDraft(template);
  edit.steps.reverse(); edit.steps[0].title = 'Alterada';
  expect(template.steps.map(step => step.title)).toEqual(['Uma', 'Duas']);
});
