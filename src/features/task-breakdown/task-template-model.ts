import { newTaskStep, normalizedTaskDraft, type TaskDraft } from './task-model';

export type TemplateStep = { id: string; title: string };
export type TemplateDraft = { title: string; steps: TemplateStep[] };

export function normalizedTemplateDraft(input: TemplateDraft): TemplateDraft {
  if (!input || !Array.isArray(input.steps)) throw new Error('Invalid template data.');
  const task = normalizedTaskDraft({ title: input.title, steps: input.steps.map(step => ({ ...step, completed: false })) });
  return { title: task.title, steps: task.steps.map(step => ({ id: step.id, title: step.title })) };
}
export function templateFromTask(input: TaskDraft): TemplateDraft {
  const task = normalizedTaskDraft(input);
  return { title: task.title, steps: task.steps.map(step => ({ id: step.id, title: step.title })) };
}
export function taskFromTemplate(input: TemplateDraft, createStep = newTaskStep): TaskDraft {
  const template = normalizedTemplateDraft(input);
  const steps = template.steps.map(step => ({ ...createStep(), title: step.title, completed: false }));
  if (steps.some(step => template.steps.some(original => original.id === step.id))) throw new Error('Independent step identity required.');
  return normalizedTaskDraft({ title: template.title, steps });
}
