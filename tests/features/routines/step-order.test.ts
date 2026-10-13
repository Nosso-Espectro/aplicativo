import { moveStep } from '../../../src/features/routines/step-order';
const steps = [
  { id: 'a', title: 'Uma', imageUri: 'file:///private/test.png', completed: true },
  { id: 'b', title: 'Duas', imageUri: null, completed: false },
  { id: 'c', title: 'Três', imageUri: null, completed: false },
];
it('moves in both directions without mutating the original or altering step content/status', () => {
  const moved = moveStep(steps, 'a', 1);
  expect(moved).toEqual([steps[1], steps[0], steps[2]]);
  expect(moveStep(moved, 'a', -1)).toEqual(steps);
  expect(steps.map((step) => step.id)).toEqual(['a', 'b', 'c']);
  expect(moved[1]).toBe(steps[0]);
});
it('does not wrap beyond either end or move an unknown ID', () => {
  expect(moveStep(steps, 'a', -1)).toEqual(steps);
  expect(moveStep(steps, 'c', 1)).toEqual(steps);
  expect(moveStep(steps, 'unknown', 1)).toEqual(steps);
});
it('handles empty and single-step routines', () => {
  expect(moveStep([], 'a', 1)).toEqual([]);
  expect(moveStep([steps[0]], 'a', 1)).toEqual([steps[0]]);
});
