import { newTaskStep, type TaskDraft } from './task-model';
import { taskFromTemplate } from './task-template-model';

export type CommonTask = Readonly<{ id: string; title: string; steps: readonly string[] }>;
export type CommonTaskCatalog = Readonly<{ revision: string; items: readonly CommonTask[] }>;
const packaged: CommonTaskCatalog = {
  revision: '2026-10-14',
  items: [
    { id: 'desk', title: 'Organizar uma mesa', steps: ['Escolher uma pequena área da mesa', 'Separar objetos que quero guardar', 'Colocar esses objetos nos lugares escolhidos', 'Decidir se quero continuar ou terminar'] },
    { id: 'backpack', title: 'Preparar uma mochila', steps: ['Listar o que quero levar', 'Separar os itens da lista', 'Colocar os itens na mochila', 'Conferir se quero acrescentar ou retirar algo'] },
    { id: 'room', title: 'Organizar uma pequena área do quarto', steps: ['Escolher uma área do quarto', 'Separar objetos que quero guardar', 'Guardar o que escolhi', 'Decidir se quero continuar ou terminar'] },
  ],
};
const ids = ['desk', 'backpack', 'room'];
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
export function getCommonTaskCatalog(value: unknown = packaged): CommonTaskCatalog | null {
  try {
    if (!record(value)) return null;
    const { revision, items } = value;
    if (!text(revision) || !Array.isArray(items) || items.length !== ids.length) return null;
    const checked = Array.from(items).map((item, index): CommonTask | null => {
      if (!record(item)) return null;
      const { id, title, steps } = item;
      if (id !== ids[index] || !text(title) || !Array.isArray(steps) || steps.length !== 4) return null;
      const copied = Array.from(steps);
      if (!copied.every(text)) return null;
      return Object.freeze({ id: ids[index], title, steps: Object.freeze(copied) });
    });
    if (checked.some(item => item === null)) return null;
    return Object.freeze({ revision, items: Object.freeze(checked.filter((item): item is CommonTask => item !== null)) });
  } catch { return null; }
}
export function commonTaskDraft(id: unknown, createStep = newTaskStep, content: unknown = packaged): TaskDraft {
  const item = getCommonTaskCatalog(content)?.items.find(item => item.id === id);
  if (!item) throw new Error('Common task unavailable.');
  return taskFromTemplate({ title: item.title, steps: item.steps.map((title, index) => ({ id: `common-${item.id}-${index}`, title })) }, createStep);
}
