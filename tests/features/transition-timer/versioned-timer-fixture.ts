import type { TimerAction, VersionedTimerSession } from '../../../src/features/transition-timer/timer-database';
import type { TimerSession } from '../../../src/features/transition-timer/visual-timer';

export function versionedTimerFixture(read: () => Promise<TimerSession | null>,
  operation: (action: TimerAction, nowMs: number, expected: TimerSession | null) => Promise<TimerSession | null>) {
  let counter = 0;
  async function readVersioned() {
    const session = await read();
    if (session && counter === 0) counter = 1;
    return { session, sessionNumber: session ? counter : null };
  }
  return {
    read, act: operation, readVersioned,
    actVersioned: async (action: TimerAction, nowMs: number, expected: VersionedTimerSession) => {
      // Mirror the identity guard; storage behavior is tested separately with real SQLite.
      if ((await readVersioned()).sessionNumber !== expected.sessionNumber) throw new Error('Timer session changed.');
      const session = await operation(action, nowMs, expected.session);
      if (action.type === 'start') counter += 1;
      return { session, sessionNumber: session ? counter : null };
    },
  };
}
