import { progressMarks, type ProgressMark } from './progress-alerts';

export type OwnedProgressNotification = { identifier: string; sessionNumber: number; minutes: ProgressMark; atMs: number };
export function normalizedProgressNotification(input: OwnedProgressNotification): OwnedProgressNotification {
  if (!input || !Number.isSafeInteger(input.sessionNumber) || input.sessionNumber < 1 || !progressMarks.includes(input.minutes)
    || !Number.isSafeInteger(input.atMs) || input.atMs < 0 || typeof input.identifier !== 'string') throw new Error('Invalid owned notification.');
  const match = input.identifier.match(new RegExp(`^tear-transition-${input.sessionNumber}-${input.minutes}-([0-9]+)$`));
  if (!match || !Number.isSafeInteger(Number(match[1]))) throw new Error('Invalid owned notification.');
  return { identifier: input.identifier, sessionNumber: input.sessionNumber, minutes: input.minutes, atMs: input.atMs };
}
