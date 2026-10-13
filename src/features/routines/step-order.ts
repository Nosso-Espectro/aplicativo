import type { RoutineStep } from './routine-model';

export function moveStep(steps: readonly RoutineStep[], id: string, direction: -1 | 1): RoutineStep[] {
  const from = steps.findIndex((step) => step.id === id);
  const to = from + direction;
  const ordered = [...steps];
  if (from < 0 || to < 0 || to >= steps.length) return ordered;
  [ordered[from], ordered[to]] = [ordered[to], ordered[from]];
  return ordered;
}
