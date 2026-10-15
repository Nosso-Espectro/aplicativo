import { checkInOptions, checkInQuestions, type CheckInState } from '../sensory-check-in/check-in-model';

export type HistoryContent =
  | { type: 'check-in'; answers: CheckInState['answers'] }
  | { type: 'routine'; name: string; steps: number };
export type HistoryRecord = HistoryContent & { id: string; savedAt: number };
export type HistoryFilter = 'all' | HistoryContent['type'];

export function historyContent(input: unknown): HistoryContent {
  if (!input || typeof input !== 'object') throw new Error('Invalid history content.');
  const value = input as Record<string, unknown>;
  if (value.type === 'routine') {
    if (typeof value.name !== 'string' || !value.name.trim() || !Number.isSafeInteger(value.steps) || (value.steps as number) < 1) {
      throw new Error('Invalid routine snapshot.');
    }
    return { type: 'routine', name: value.name.trim(), steps: value.steps as number };
  }
  if (value.type !== 'check-in' || !value.answers || typeof value.answers !== 'object' || Array.isArray(value.answers)) {
    throw new Error('Invalid check-in snapshot.');
  }
  const answers: CheckInState['answers'] = {};
  for (const [id, answer] of Object.entries(value.answers)) {
    const question = checkInQuestions.find(item => item.id === id);
    const option = question && checkInOptions(question.id).find(item => item.value === answer);
    if (!question || !option) throw new Error('Invalid saved answer.');
    answers[question.id] = option.value;
  }
  if (Object.keys(answers).length === 0) throw new Error('Empty check-in snapshot.');
  return { type: 'check-in', answers };
}

export function historyRecord(input: unknown): HistoryRecord {
  if (!input || typeof input !== 'object') throw new Error('Invalid history record.');
  const value = input as Record<string, unknown>;
  if (typeof value.id !== 'string' || !/^[a-zA-Z0-9-]{1,100}$/.test(value.id)
    || !Number.isSafeInteger(value.savedAt) || (value.savedAt as number) < 0 || (value.savedAt as number) > 8640000000000000) {
    throw new Error('Invalid history identity.');
  }
  return { ...historyContent(value), id: value.id, savedAt: value.savedAt as number };
}

export function newHistoryRecord(content: HistoryContent): HistoryRecord {
  return historyRecord({ ...content, id: `history-${Date.now()}-${Math.random().toString(36).slice(2)}`, savedAt: Date.now() });
}
