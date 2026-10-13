export type TimerSession = {
  phase: 'running' | 'paused' | 'finished';
  durationMs: number; remainingMs: number; deadlineMs: number | null;
};
const maximumDurationMs = 24 * 60 * 60 * 1000;
function isDuration(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 1000 && value <= maximumDurationMs && value % 1000 === 0;
}
function checkedTime(nowMs: number) {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0) throw new Error('Invalid timer clock.');
  return nowMs;
}

export function durationFromInput(minutes: string, seconds: string): number {
  if (typeof minutes !== 'string' || typeof seconds !== 'string') throw new Error('Invalid timer duration.');
  const minuteText = minutes.trim() || '0'; const secondText = seconds.trim() || '0';
  if (!/^\d+$/.test(minuteText) || !/^\d+$/.test(secondText)) throw new Error('Invalid timer duration.');
  const minuteValue = Number(minuteText); const secondValue = Number(secondText);
  const durationMs = (minuteValue * 60 + secondValue) * 1000;
  if (!Number.isSafeInteger(minuteValue) || !Number.isSafeInteger(secondValue) || secondValue > 59 || !isDuration(durationMs)) throw new Error('Invalid timer duration.');
  return durationMs;
}

export function normalizedTimerSession(input: TimerSession | null): TimerSession | null {
  if (input === null) return null;
  if (!input || !isDuration(input.durationMs) || !Number.isSafeInteger(input.remainingMs) || input.remainingMs < 0 || input.remainingMs > input.durationMs) throw new Error('Invalid timer session.');
  const { phase, durationMs, remainingMs, deadlineMs } = input;
  if (phase === 'running') {
    if (remainingMs === 0 || deadlineMs === null || !Number.isSafeInteger(deadlineMs) || deadlineMs < remainingMs) throw new Error('Invalid timer session.');
  } else if (phase === 'paused') {
    if (remainingMs === 0 || deadlineMs !== null) throw new Error('Invalid timer session.');
  } else if (phase === 'finished') {
    if (remainingMs !== 0 || deadlineMs !== null) throw new Error('Invalid timer session.');
  } else throw new Error('Invalid timer session.');
  return { phase, durationMs, remainingMs, deadlineMs };
}

export function startTimer(durationMs: number, nowMs: number): TimerSession {
  if (!isDuration(durationMs)) throw new Error('Invalid timer duration.');
  const deadlineMs = checkedTime(nowMs) + durationMs;
  return normalizedTimerSession({ phase: 'running', durationMs, remainingMs: durationMs, deadlineMs })!;
}

export function timerAt(input: TimerSession | null, nowMs: number): TimerSession | null {
  const session = normalizedTimerSession(input); checkedTime(nowMs);
  if (!session || session.phase !== 'running') return session;
  const remainingMs = Math.min(session.remainingMs, Math.max(0, session.deadlineMs! - nowMs));
  return remainingMs === 0 ? { ...session, phase: 'finished', remainingMs: 0, deadlineMs: null } : { ...session, remainingMs };
}

export function pauseTimer(input: TimerSession, nowMs: number): TimerSession {
  if (normalizedTimerSession(input)?.phase !== 'running') throw new Error('Invalid timer action.');
  const current = timerAt(input, nowMs)!;
  return current.phase === 'finished' ? current : { ...current, phase: 'paused', deadlineMs: null };
}

export function resumeTimer(input: TimerSession, nowMs: number): TimerSession {
  const session = normalizedTimerSession(input);
  if (!session || session.phase !== 'paused') throw new Error('Invalid timer action.');
  return normalizedTimerSession({ ...session, phase: 'running', deadlineMs: checkedTime(nowMs) + session.remainingMs })!;
}

export function timerVisual(input: TimerSession | null, nowMs: number) {
  const session = timerAt(input, nowMs);
  return session && { phase: session.phase, remainingMs: session.remainingMs,
    remainingSeconds: Math.ceil(session.remainingMs / 1000), remainingFraction: session.remainingMs / session.durationMs };
}
