import type { RoutineStep } from './routine-model';

export type ProgressAction = 'complete' | 'previous' | 'restart';
export function routineExecution(steps: readonly RoutineStep[]) {
  const pending = steps.findIndex((step) => !step.completed);
  const index = pending < 0 ? steps.length : pending;
  return {
    current: steps[index] ?? null,
    next: steps.slice(index + 1).find((step) => !step.completed) ?? null,
    index,
    done: steps.length > 0 && pending < 0,
    canGoBack: index > 0,
  };
}
