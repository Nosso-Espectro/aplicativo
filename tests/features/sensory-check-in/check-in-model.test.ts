import { checkInOptions, checkInQuestions, checkInReducer, emptyCheckIn, type CheckInAction } from '../../../src/features/sensory-check-in/check-in-model';

it('starts empty and contains the eight approved items with exact scales', () => {
  expect(emptyCheckIn()).toEqual({ index: 0, answers: {}, finished: false });
  expect(checkInQuestions.map(item => item.id)).toEqual(['thirst', 'hunger', 'pain', 'tiredness', 'noise', 'light', 'temperature', 'alone']);
  for (const item of checkInQuestions) {
    expect(checkInOptions(item.id).map(option => option.label)).toEqual(item.id === 'temperature'
      ? ['Frio', 'Confortável', 'Calor', 'Não sei'] : ['Sim', 'Não', 'Não sei']);
  }
});
it('requires a selected answer to continue but allows every question to be skipped', () => {
  let state = emptyCheckIn();
  expect(checkInReducer(state, { type: 'next', question: 'thirst' })).toBe(state);
  for (const question of checkInQuestions) state = checkInReducer(state, { type: 'skip', question: question.id });
  expect(state.finished).toBe(true); expect(state.answers).toEqual({});
});
it('changes only the chosen item, keeps answers when returning and deletes a skipped previous answer', () => {
  const original = emptyCheckIn();
  let state = checkInReducer(original, { type: 'answer', question: 'thirst', value: 'yes' });
  state = checkInReducer(state, { type: 'next', question: 'thirst' });
  state = checkInReducer(state, { type: 'answer', question: 'hunger', value: 'unknown' });
  state = checkInReducer(state, { type: 'previous', question: 'hunger' });
  expect(state.answers).toEqual({ thirst: 'yes', hunger: 'unknown' });
  state = checkInReducer(state, { type: 'answer', question: 'thirst', value: 'no' });
  state = checkInReducer(state, { type: 'skip', question: 'thirst' });
  expect(state.answers).toEqual({ hunger: 'unknown' }); expect(original.answers).toEqual({});
});
it('rejects incompatible answers and stale or rapid duplicate screen events', () => {
  const state = emptyCheckIn();
  expect(checkInReducer(state, { type: 'answer', question: 'thirst', value: 'cold' })).toBe(state);
  expect(checkInReducer(state, { type: 'answer', question: 'hunger', value: 'yes' })).toBe(state);
  expect(checkInReducer(state, { type: 'answer', question: 'thirst', value: 'synthetic invalid value' } as unknown as CheckInAction)).toBe(state);
  const next = checkInReducer(state, { type: 'skip', question: 'thirst' });
  expect(checkInReducer(next, { type: 'skip', question: 'thirst' })).toBe(next);
  expect(checkInReducer(next, { type: 'previous', question: 'thirst' })).toBe(next);
});
it('supports temperature independently, freezes answers for the summary and clears them on reset', () => {
  let state = emptyCheckIn();
  for (const question of checkInQuestions.slice(0, 6)) {
    state = checkInReducer(state, { type: 'answer', question: question.id, value: 'unknown' });
    state = checkInReducer(state, { type: 'next', question: question.id });
  }
  expect(checkInReducer(state, { type: 'answer', question: 'temperature', value: 'yes' })).toBe(state);
  state = checkInReducer(state, { type: 'answer', question: 'temperature', value: 'comfortable' });
  state = checkInReducer(state, { type: 'next', question: 'temperature' });
  state = checkInReducer(state, { type: 'answer', question: 'alone', value: 'no' });
  expect(Object.keys(state.answers)).toHaveLength(8);
  const finished = checkInReducer(state, { type: 'next', question: 'alone' });
  expect(finished.answers).toEqual(state.answers); expect(finished.finished).toBe(true);
  expect(checkInReducer(finished, { type: 'answer', question: 'alone', value: 'yes' })).toBe(finished);
  expect(checkInReducer(state, { type: 'reset' })).toEqual(emptyCheckIn());
  expect(checkInReducer(finished, { type: 'reset' })).toEqual(emptyCheckIn());
});
