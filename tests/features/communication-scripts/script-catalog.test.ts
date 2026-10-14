import { initialScripts, scriptCategories, scriptsInCategory } from '../../../src/features/communication-scripts/script-catalog';
it('contains the five original texts in the required categories with stable unique ids', () => {
  expect(initialScripts.map(item => item.text)).toEqual([
    'Poderia me ajudar, por favor?', 'Preciso de mais tempo para responder.',
    'Você pode explicar de outra forma, por favor?', 'Preciso encerrar esta conversa agora.',
    'Estou com sobrecarga e preciso de uma pausa.',
  ]);
  expect(new Set(initialScripts.map(item => item.id)).size).toBe(5);
  expect(initialScripts.map(item => item.categoryId)).toEqual(scriptCategories.map(item => item.id));
});
it('filters without changing text, order or the original catalog and supports an empty category', () => {
  expect(scriptsInCategory(initialScripts, 'all')).toEqual(initialScripts);
  for (const category of scriptCategories) expect(scriptsInCategory(initialScripts, category.id)).toEqual(initialScripts.filter(item => item.categoryId === category.id));
  expect(scriptsInCategory([], 'help')).toEqual([]);
  expect(scriptsInCategory(initialScripts.slice(0, 1), 'time')).toEqual([]);
});
