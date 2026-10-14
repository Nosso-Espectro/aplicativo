export const checkInQuestions = [
  { id: 'thirst', title: 'Você está com sede?' },
  { id: 'hunger', title: 'Você está com fome?' },
  { id: 'pain', title: 'Você está sentindo dor?' },
  { id: 'tiredness', title: 'Você está com cansaço?' },
  { id: 'noise', title: 'O ruído está incomodando você?' },
  { id: 'light', title: 'A luz está incomodando você?' },
  { id: 'temperature', title: 'Como está a temperatura para você?' },
  { id: 'alone', title: 'Você está com vontade de ficar sozinho?' },
] as const;
export type QuestionId = typeof checkInQuestions[number]['id'];
export type CheckInAnswer = 'yes' | 'no' | 'unknown' | 'cold' | 'comfortable' | 'hot';
const binaryOptions = [
  { value: 'yes', label: 'Sim' }, { value: 'no', label: 'Não' }, { value: 'unknown', label: 'Não sei' },
] as const;
const temperatureOptions = [
  { value: 'cold', label: 'Frio' }, { value: 'comfortable', label: 'Confortável' },
  { value: 'hot', label: 'Calor' }, { value: 'unknown', label: 'Não sei' },
] as const;
export function checkInOptions(id: QuestionId) {
  return id === 'temperature' ? temperatureOptions : binaryOptions;
}
export type CheckInState = { index: number; answers: Partial<Record<QuestionId, CheckInAnswer>>; finished: boolean };
export function emptyCheckIn(): CheckInState { return { index: 0, answers: {}, finished: false }; }
export type CheckInAction =
  | { type: 'answer'; question: QuestionId; value: CheckInAnswer }
  | { type: 'next' | 'skip' | 'previous'; question: QuestionId }
  | { type: 'reset' };

export function checkInReducer(state: CheckInState, action: CheckInAction): CheckInState {
  if (action.type === 'reset') return emptyCheckIn();
  const question = checkInQuestions[state.index];
  // Ignore events from a previous screen, including rapid duplicate presses.
  if (state.finished || !question || action.question !== question.id) return state;
  if (action.type === 'answer') {
    if (!checkInOptions(question.id).some(option => option.value === action.value)) return state;
    return { ...state, answers: { ...state.answers, [question.id]: action.value } };
  }
  if (action.type === 'previous') return state.index === 0 ? state : { ...state, index: state.index - 1 };
  if (action.type === 'next' && !state.answers[question.id]) return state;
  const answers = { ...state.answers };
  if (action.type === 'skip') delete answers[question.id];
  if (state.index === checkInQuestions.length - 1) return { ...state, answers, finished: true };
  return { ...state, index: state.index + 1, answers };
}
