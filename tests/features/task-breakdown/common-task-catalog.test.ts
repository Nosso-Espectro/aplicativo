import { commonTaskDraft, getCommonTaskCatalog } from '../../../src/features/task-breakdown/common-task-catalog';
import { newTaskStep } from '../../../src/features/task-breakdown/task-model';
it('includes exactly the original local optional models and complete steps', () => {
  const catalog = getCommonTaskCatalog();
  expect(catalog?.revision).toBe('2026-10-14');
  expect(catalog?.items.map(item => [item.id, item.title, item.steps.length])).toEqual([
    ['desk', 'Organizar uma mesa', 4], ['backpack', 'Preparar uma mochila', 4], ['room', 'Organizar uma pequena área do quarto', 4],
  ]);
  expect(catalog?.items[0].steps[3]).toBe('Decidir se quero continuar ou terminar');
});
it('returns independent deeply frozen snapshots', () => {
  const one = getCommonTaskCatalog()!; const two = getCommonTaskCatalog()!;
  expect(one).not.toBe(two); expect(one.items).not.toBe(two.items); expect(one.items[0].steps).not.toBe(two.items[0].steps);
  expect(Object.isFrozen(one)).toBe(true); expect(Object.isFrozen(one.items)).toBe(true);
  expect(Object.isFrozen(one.items[0])).toBe(true); expect(Object.isFrozen(one.items[0].steps)).toBe(true);
});
it('copies new IDs and false progress, never aliases catalog or another copy', () => {
  let index = 0; const factory = () => ({ ...newTaskStep(`fresh-${index++}`), completed: true });
  const one = commonTaskDraft('desk', factory); const two = commonTaskDraft('desk', factory);
  expect(one.steps.every(step => !step.completed)).toBe(true);
  expect(one.steps.some(step => two.steps.some(other => step.id === other.id))).toBe(false);
  one.title = 'Synthetic copy'; one.steps[0].title = 'Changed'; one.steps[0].completed = true;
  expect(two.title).toBe('Organizar uma mesa'); expect(two.steps[0].title).toBe('Escolher uma pequena área da mesa');
  expect(getCommonTaskCatalog()?.items[0].steps[0]).toBe(two.steps[0].title);
});
it.each([null, false, 0, {}, { revision: '', items: [] }, { revision: 'x', items: new Array(3) }])('refuses incomplete resource %#', content => {
  expect(getCommonTaskCatalog(content)).toBeNull(); expect(() => commonTaskDraft('desk', newTaskStep, content)).toThrow('Common task unavailable.');
});
it('refuses reordered, duplicate, sparse or empty steps without mutating caller data', () => {
  const source = JSON.parse(JSON.stringify(getCommonTaskCatalog()));
  source.items[0].steps[0] = ''; expect(getCommonTaskCatalog(source)).toBeNull();
  source.items[0].steps = new Array(4); expect(getCommonTaskCatalog(source)).toBeNull();
  const duplicate = JSON.parse(JSON.stringify(getCommonTaskCatalog())); duplicate.items[1].id = 'desk';
  expect(getCommonTaskCatalog(duplicate)).toBeNull();
  expect(getCommonTaskCatalog({ ...getCommonTaskCatalog(), items: [...getCommonTaskCatalog()!.items].reverse() })).toBeNull();
});
it('does not expose a thrown resource getter or accept unknown route IDs', () => {
  expect(getCommonTaskCatalog({ get revision(): never { throw new Error('private synthetic'); } })).toBeNull();
  for (const id of ['missing', ['desk'], null]) expect(() => commonTaskDraft(id)).toThrow('Common task unavailable.');
});
it('refuses a factory with duplicate or source identities before a task can be saved', () => {
  expect(() => commonTaskDraft('desk', () => newTaskStep('duplicate'))).toThrow();
  expect(() => commonTaskDraft('desk', () => newTaskStep('common-desk-0'))).toThrow('Independent step identity required.');
});
