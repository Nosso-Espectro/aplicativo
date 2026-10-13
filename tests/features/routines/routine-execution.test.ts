import { routineExecution } from '../../../src/features/routines/routine-execution';
const steps = ['a', 'b', 'c'].map((id) => ({ id, title: id, imageUri: null, completed: false }));
it('shows only the first two pending steps in saved order', () => {
  const result = routineExecution([steps[0], { ...steps[1], completed: true }, steps[2]]);
  expect(result.current).toEqual(steps[0]); expect(result.next).toEqual(steps[2]);
  expect(result.canGoBack).toBe(false); expect(result.done).toBe(false);
});
it('distinguishes empty from finished and permits going back from completion', () => {
  expect(routineExecution([])).toMatchObject({ current: null, next: null, done: false, canGoBack: false });
  expect(routineExecution(steps.map((step) => ({ ...step, completed: true })))).toMatchObject({ current: null, next: null, done: true, canGoBack: true, index: 3 });
});
it('reconciles reorder and removed IDs by current saved content rather than a stored index', () => {
  const result = routineExecution([{ ...steps[2], completed: true }, steps[1]]);
  expect(result.current?.id).toBe('b'); expect(result.next).toBeNull(); expect(result.canGoBack).toBe(true);
});
