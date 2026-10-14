import { checkInOptions, checkInQuestions, type CheckInState } from './check-in-model';

export type CheckInTool = 'water' | 'regulation' | 'trusted-contact';
export function checkInSummary(answers: CheckInState['answers']) {
  return checkInQuestions.flatMap(question => {
    const option = checkInOptions(question.id).find(item => item.value === answers[question.id]);
    return option ? [{ id: question.id, question: question.title, answer: option.label }] : [];
  });
}
