import { checkInSummary } from '../../../src/features/sensory-check-in/check-in-summary';
import { checkInQuestions, type CheckInState } from '../../../src/features/sensory-check-in/check-in-model';

it('derives only supplied answers in question order without mutating or interpreting them', () => {
  const answers: CheckInState['answers'] = { temperature: 'hot', hunger: 'unknown', thirst: 'no' };
  const summary = checkInSummary(answers);
  expect(summary).toEqual([
    { id: 'thirst', question: checkInQuestions[0].title, answer: 'Não' },
    { id: 'hunger', question: checkInQuestions[1].title, answer: 'Não sei' },
    { id: 'temperature', question: checkInQuestions[6].title, answer: 'Calor' },
  ]);
  expect(answers).toEqual({ temperature: 'hot', hunger: 'unknown', thirst: 'no' });
});
it('returns no answers for an empty session and never infers skipped answers', () => {
  expect(checkInSummary({})).toEqual([]);
  expect(checkInSummary({ alone: 'yes' })).toEqual([{ id: 'alone', question: checkInQuestions[7].title, answer: 'Sim' }]);
});
it('omits unknown items, malformed responses and answers from an incompatible scale without exposing raw data', () => {
  const malformed = { temperature: 'yes', thirst: 'hot', hunger: 'synthetic invalid value', pain: 'no', extra: 'yes' } as unknown as CheckInState['answers'];
  expect(checkInSummary(malformed)).toEqual([{ id: 'pain', question: checkInQuestions[2].title, answer: 'Não' }]);
});
