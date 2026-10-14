/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { openTimerDatabase } from '../../../src/features/transition-timer/timer-database';
import { openProgressAlertDatabase } from '../../../src/features/transition-timer/progress-alert-database';
import { emptyProgressAlerts, type ProgressAlertPreferences } from '../../../src/features/transition-timer/progress-alerts';
import { createProgressAlertCoordinator } from '../../../src/features/transition-timer/progress-alert-coordinator';
import type { ProgressAlertEngine } from '../../../src/features/transition-timer/expo-progress-alert-engine';
import * as engineModule from '../../../src/features/transition-timer/expo-progress-alert-engine';
import { createElement, StrictMode, useEffect } from 'react';
import { AppState, Text, type AppStateStatus } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';
import { TransitionTimerProvider, useTransitionTimer } from '../../../src/features/transition-timer/TransitionTimerProvider';
import { ProgressAlertsProvider, useProgressAlerts } from '../../../src/features/transition-timer/ProgressAlertsProvider';
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
let directory: string; let connections: DatabaseSync[]; let failReadback: boolean; let failCommit: boolean;
const enabled: ProgressAlertPreferences = { enabled: true, marks: [10, 5, 2], systemNotifications: true };
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'tear-alert-db-')); connections = []; failReadback = false; failCommit = false;
  jest.mocked(openDatabaseAsync).mockImplementation(async name => {
    const sql = new DatabaseSync(join(directory, name)); connections.push(sql); let written = false;
    const adapter = {
      execAsync: async (statement: string) => { sql.exec(statement); },
      runAsync: async (statement: string, ...params: (string | number | null)[]) => { written = true; return sql.prepare(statement).run(...params); },
      getAllAsync: async (statement: string) => { if (written && failReadback) throw new Error('Synthetic readback failure'); return sql.prepare(statement).all(); },
      closeAsync: async () => sql.close(),
      withExclusiveTransactionAsync: async (operation: (tx: SQLiteDatabase) => Promise<void>) => {
        sql.exec('BEGIN'); written = false;
        try { await operation(adapter as unknown as SQLiteDatabase); if (failCommit) throw new Error('Synthetic commit failure'); sql.exec('COMMIT'); }
        catch (error) { sql.exec('ROLLBACK'); throw error; }
      },
    };
    return adapter as unknown as SQLiteDatabase;
  });
});
afterEach(() => { for (const db of connections) { try { db.close(); } catch {} } rmSync(directory, { recursive: true, force: true }); });
it('starts with empty private preferences and restores choices from the same file offline without touching timer', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  try {
    const db = await openProgressAlertDatabase(); const initial = await db.read();
    expect(initial).toMatchObject({ session: null, sessionNumber: null, revision: 0, preferences: emptyProgressAlerts, delivered: [], pending: [] });
    const saved = await db.savePreferences(enabled, initial.revision); connections[0].close();
    const reopened = await openProgressAlertDatabase(); expect(await reopened.read()).toEqual(saved);
    expect((await reopened.read()).session).toBeNull(); expect(fetch).not.toHaveBeenCalled();
  } finally { fetch.mockRestore(); }
});
it.each(['running', 'paused'] as const)('migrates schema1 %s sessions intact with one stable identity and disabled alerts', async phase => {
  const sql = new DatabaseSync(join(directory, 'tear-transition-timer.db'));
  sql.exec(`CREATE TABLE timer_session (id INTEGER PRIMARY KEY, phase TEXT, duration_ms INTEGER, remaining_ms INTEGER, deadline_ms INTEGER); PRAGMA user_version=1;`);
  sql.prepare('INSERT INTO timer_session VALUES (1, ?, 1200000, 900000, ?)').run(phase, phase === 'running' ? 901000 : null); sql.close();
  const db = await openProgressAlertDatabase(); const snapshot = await db.read();
  expect(snapshot).toMatchObject({ sessionNumber: 1, preferences: emptyProgressAlerts, session: { phase, durationMs: 1200000, remainingMs: 900000, deadlineMs: phase === 'running' ? 901000 : null } });
  expect(connections[0].prepare('PRAGMA user_version').get()).toEqual({ user_version: 2 });
});
it('retains identity and delivered marks across pause/resume but gives a new timer a new identity', async () => {
  const timer = await openTimerDatabase(); const alerts = await openProgressAlertDatabase();
  let snapshot = await alerts.savePreferences(enabled, 0);
  const started = await timer.act({ type: 'start', durationMs: 1200000 }, 1000, null); snapshot = await alerts.read();
  snapshot = await alerts.markDelivered(10, snapshot.sessionNumber!, 601000, snapshot.revision); expect(snapshot.delivered).toEqual([10]);
  await expect(alerts.markDelivered(10, snapshot.sessionNumber!, 601000, snapshot.revision)).rejects.toThrow('Timer alert unavailable.');
  const paused = await timer.act({ type: 'pause' }, 602000, started); const resumed = await timer.act({ type: 'resume' }, 700000, paused);
  expect(await alerts.read()).toMatchObject({ sessionNumber: snapshot.sessionNumber, delivered: [10] });
  await timer.act({ type: 'cancel' }, 700000, resumed); await timer.act({ type: 'start', durationMs: 1200000 }, 700000, null);
  const next = await alerts.read(); expect(next.sessionNumber).toBe(snapshot.sessionNumber! + 1); expect(next.delivered).toEqual([]);
  await expect(alerts.markDelivered(5, snapshot.sessionNumber!, 1700000, next.revision)).rejects.toThrow();
});
it('reserves only consented future requests and keeps ownership across cancellation until explicit acknowledgement', async () => {
  const timer = await openTimerDatabase(); const alerts = await openProgressAlertDatabase();
  const started = await timer.act({ type: 'start', durationMs: 1200000 }, 1000, null);
  let current = await alerts.read(); await expect(alerts.reserve(10, 601000, 1000, current.revision)).rejects.toThrow();
  current = await alerts.savePreferences(enabled, current.revision);
  current = await alerts.reserve(10, 601000, 1000, current.revision);
  const [owned] = current.pending; expect(owned).toMatchObject({ minutes: 10, sessionNumber: current.sessionNumber, atMs: 601000 });
  await expect(alerts.reserve(10, 601000, 1000, current.revision)).rejects.toThrow();
  await timer.act({ type: 'cancel' }, 2000, started); current = await alerts.read();
  expect(current.session).toBeNull(); expect(current.pending).toEqual([owned]);
  await expect(alerts.forget('other-application-id', current.revision)).rejects.toThrow('Owned timer alert unavailable.');
  current = await alerts.forget(owned.identifier, current.revision); expect(current.pending).toEqual([]);
});
it.each(['readback', 'commit'])('rolls back failed %s without confirming preferences or losing pending ownership', async failure => {
  const alerts = await openProgressAlertDatabase(); const timer = await openTimerDatabase();
  await timer.act({ type: 'start', durationMs: 1200000 }, 1000, null);
  const configured = await alerts.savePreferences(enabled, (await alerts.read()).revision);
  const initial = await alerts.reserve(10, 601000, 1000, configured.revision);
  if (failure === 'readback') failReadback = true; else failCommit = true;
  await expect(alerts.savePreferences(emptyProgressAlerts, initial.revision)).rejects.toThrow();
  await expect(alerts.forget(initial.pending[0].identifier, initial.revision)).rejects.toThrow();
  failReadback = false; failCommit = false;
  expect(await alerts.read()).toEqual(initial);
  const disabled = await alerts.savePreferences(emptyProgressAlerts, initial.revision);
  expect(disabled.preferences).toEqual(emptyProgressAlerts); expect(disabled.pending).toEqual(initial.pending);
  expect((await alerts.forget(initial.pending[0].identifier, disabled.revision)).pending).toEqual([]);
});
it('rolls back a failed migration and preserves the schema1 timer until a successful retry', async () => {
  const sql = new DatabaseSync(join(directory, 'tear-transition-timer.db'));
  sql.exec(`CREATE TABLE timer_session (id INTEGER PRIMARY KEY, phase TEXT, duration_ms INTEGER, remaining_ms INTEGER, deadline_ms INTEGER);
    INSERT INTO timer_session VALUES (1, 'paused', 1200000, 900000, NULL); PRAGMA user_version=1;`);
  failCommit = true; await expect(openProgressAlertDatabase()).rejects.toThrow('Timer storage unavailable.'); failCommit = false;
  expect(sql.prepare('PRAGMA user_version').get()).toEqual({ user_version: 1 });
  expect(sql.prepare("SELECT name FROM sqlite_master WHERE name = 'timer_alert_state'").all()).toEqual([]);
  expect(sql.prepare('SELECT remaining_ms FROM timer_session').get()).toEqual({ remaining_ms: 900000 }); sql.close();
  expect((await (await openProgressAlertDatabase()).read()).session?.phase).toBe('paused');
});
it('rejects stale revisions across both timer actions and preference updates', async () => {
  const alerts = await openProgressAlertDatabase(); const timer = await openTimerDatabase(); const old = await alerts.read();
  await timer.act({ type: 'start', durationMs: 1200000 }, 1000, null);
  await expect(alerts.savePreferences(enabled, old.revision)).rejects.toThrow('Timer alerts changed.');
  const current = await alerts.read(); const saved = await alerts.savePreferences(enabled, current.revision);
  await expect(alerts.savePreferences(emptyProgressAlerts, current.revision)).rejects.toThrow(); expect(await alerts.read()).toEqual(saved);
});
it('rejects cancellation of a different identity even when the new timer has identical values', async () => {
  const timer = await openTimerDatabase(); const alerts = await openProgressAlertDatabase();
  const first = await timer.act({ type: 'start', durationMs: 1200000 }, 1000, null, null);
  const original = await alerts.read(); await timer.act({ type: 'cancel' }, 1000, first, original.sessionNumber);
  const second = await timer.act({ type: 'start', durationMs: 1200000 }, 1000, null, null);
  expect(second).toEqual(first);
  await expect(timer.act({ type: 'cancel' }, 1000, first, original.sessionNumber)).rejects.toThrow('Timer session changed.');
  expect(await timer.read()).toEqual(second);
});
it('rejects past requests, invalid choices and missing metadata rather than recreating identity', async () => {
  const alerts = await openProgressAlertDatabase(); const current = await alerts.read();
  await expect(alerts.savePreferences({ ...enabled, marks: [3] } as unknown as ProgressAlertPreferences, current.revision)).rejects.toThrow();
  const timer = await openTimerDatabase(); await timer.act({ type: 'start', durationMs: 1200000 }, 1000, null);
  const saved = await alerts.savePreferences(enabled, (await alerts.read()).revision);
  await expect(alerts.reserve(10, 601000, 601000, saved.revision)).rejects.toThrow();
  connections[0].exec('DELETE FROM timer_alert_state'); await expect(openProgressAlertDatabase()).rejects.toThrow('Timer storage unavailable.');
});
it('refuses future schema without downgrading or clearing the session', async () => {
  const timer = await openTimerDatabase(); const saved = await timer.act({ type: 'start', durationMs: 10000 }, 1000, null);
  connections[0].exec('PRAGMA user_version=3'); await expect(openProgressAlertDatabase()).rejects.toThrow();
  expect(connections[0].prepare('PRAGMA user_version').get()).toEqual({ user_version: 3 }); expect(await timer.read()).toEqual(saved);
});

it('consumes passed marks during pause/reopening without emitting or replaying after clock rollback', async () => {
  const timer = await openTimerDatabase(); const alerts = await openProgressAlertDatabase();
  const started = await timer.act({ type: 'start', durationMs: 1200000 }, 1000, null);
  await alerts.savePreferences(enabled, (await alerts.read()).revision);
  await timer.act({ type: 'pause' }, 950000, started);
  const consumed = await alerts.consumeElapsed(950000, (await alerts.read()).revision);
  expect(consumed.delivered).toEqual([10, 5]);
  const reopened = await openProgressAlertDatabase(); expect((await reopened.read()).delivered).toEqual([10, 5]);
  expect((await reopened.consumeElapsed(1000, consumed.revision)).delivered).toEqual([10, 5]);
});
it('consumes known current ownership even before its deadline, preserving ownership until native cancellation', async () => {
  const timer = await openTimerDatabase(); const alerts = await openProgressAlertDatabase();
  await timer.act({ type: 'start', durationMs: 1200000 }, 1000, null);
  let current = await alerts.savePreferences(enabled, (await alerts.read()).revision);
  current = await alerts.reserve(10, 601000, 1000, current.revision);
  current = await alerts.consumeOwned(current.pending[0].identifier, current.revision);
  expect(current.delivered).toEqual([10]); expect(current.pending).toHaveLength(1);
  await expect(alerts.consumeOwned('foreign-id', current.revision)).rejects.toThrow();
});
it('does not consume a previous-session notification into a new timer', async () => {
  const timer = await openTimerDatabase(); const alerts = await openProgressAlertDatabase();
  const started = await timer.act({ type: 'start', durationMs: 1200000 }, 1000, null);
  let current = await alerts.savePreferences(enabled, (await alerts.read()).revision);
  current = await alerts.reserve(10, 601000, 1000, current.revision);
  await timer.act({ type: 'cancel' }, 1000, started);
  await timer.act({ type: 'start', durationMs: 1200000 }, 1000, null);
  const next = await alerts.read();
  await expect(alerts.consumeOwned(current.pending[0].identifier, next.revision)).rejects.toThrow();
  expect(await alerts.read()).toEqual(next);
});

function fakeEngine() {
  const scheduled = new Set<string>(); const presented = new Set<string>();
  const engine: ProgressAlertEngine = {
    permission: jest.fn(async () => true), requestPermission: jest.fn(async () => true),
    inspect: jest.fn(async entries => ({ scheduled: entries.filter(entry => scheduled.has(entry.identifier)).map(entry => entry.identifier), presented: entries.filter(entry => presented.has(entry.identifier)).map(entry => entry.identifier) })),
    schedule: jest.fn(async entry => { scheduled.add(entry.identifier); }),
    cancel: jest.fn(async entry => { scheduled.delete(entry.identifier); presented.delete(entry.identifier); }),
    onReceived: jest.fn(() => () => {}), dispose: jest.fn(),
  };
  return { engine, scheduled, presented };
}
async function coordinatorFixture() {
  const timer = await openTimerDatabase(); const alerts = await openProgressAlertDatabase();
  const session = await timer.act({ type: 'start', durationMs: 1200000 }, 1000, null);
  const native = fakeEngine(); const factory = jest.fn(() => native.engine); let now = 1000;
  const coordinator = createProgressAlertCoordinator(alerts, factory, () => now);
  return { timer, alerts, session, native, factory, coordinator, setTime: (value: number) => { now = value; } };
}
it('keeps visual-only restoration independent of native capability and never requests permission automatically', async () => {
  const fixture = await coordinatorFixture(); const { coordinator, alerts, factory, native } = fixture;
  await coordinator.reconcile(); expect(factory).not.toHaveBeenCalled();
  await coordinator.save({ ...enabled, systemNotifications: false }, (await alerts.read()).revision);
  fixture.setTime(602000); await coordinator.reconcile();
  expect(factory).not.toHaveBeenCalled(); expect((await alerts.read()).delivered).toEqual([10]);
  expect(native.engine.requestPermission).not.toHaveBeenCalled(); coordinator.dispose();
});
it('requires explicit system consent and persists every intent before scheduling, retaining IDs on repeat', async () => {
  const { coordinator, alerts, native } = await coordinatorFixture(); const initial = await alerts.read();
  await expect(coordinator.save(enabled, initial.revision)).rejects.toThrow('Timer alerts unavailable.');
  expect(await alerts.read()).toEqual(initial);
  await coordinator.requestSystemPermission();
  jest.mocked(native.engine.schedule).mockImplementation(async entry => {
    expect((await alerts.read()).pending).toContainEqual(entry); native.scheduled.add(entry.identifier);
  });
  const saved = await coordinator.save(enabled, initial.revision, true);
  expect(saved.pending).toHaveLength(3); expect(native.engine.schedule).toHaveBeenCalledTimes(3);
  await coordinator.reconcile(); expect(native.engine.schedule).toHaveBeenCalledTimes(3);
  expect(native.engine.requestPermission).toHaveBeenCalledTimes(1); coordinator.dispose();
});
it('keeps ownership and confirmed preferences after cancel failure, then disables only after retry acknowledges cancellation', async () => {
  const { coordinator, alerts, native } = await coordinatorFixture();
  const saved = await coordinator.save(enabled, (await alerts.read()).revision, true);
  jest.mocked(native.engine.cancel).mockRejectedValueOnce(new Error('synthetic secret failure'));
  await expect(coordinator.save(emptyProgressAlerts, saved.revision)).rejects.toThrow('Timer alerts unavailable.');
  expect(await alerts.read()).toEqual(saved);
  const disabled = await coordinator.save(emptyProgressAlerts, saved.revision);
  expect(disabled.preferences).toEqual(emptyProgressAlerts); expect(disabled.pending).toEqual([]);
  expect(native.scheduled.size).toBe(0); coordinator.dispose();
});
it('recovers uncertain scheduling after reopening with the same reserved ID rather than duplicating it', async () => {
  const { coordinator, alerts, native } = await coordinatorFixture();
  jest.mocked(native.engine.schedule).mockImplementationOnce(async entry => { native.scheduled.add(entry.identifier); throw new Error('unknown RPC result'); });
  await expect(coordinator.save(enabled, (await alerts.read()).revision, true)).rejects.toThrow();
  const owned = await alerts.read(); expect(owned.pending).toHaveLength(3); coordinator.dispose();
  const restored = createProgressAlertCoordinator(await openProgressAlertDatabase(), () => native.engine, () => 1000);
  expect((await restored.reconcile()).pending).toEqual(owned.pending);
  expect(native.engine.schedule).toHaveBeenCalledTimes(3); restored.dispose();
});
it('consumes passed/presented IDs and cancels them without claiming delivery or scheduling a catch-up burst', async () => {
  const fixture = await coordinatorFixture(); const { coordinator, alerts, native } = fixture;
  const saved = await coordinator.save(enabled, (await alerts.read()).revision, true);
  native.presented.add(saved.pending.find(entry => entry.minutes === 10)!.identifier);
  fixture.setTime(950000); const current = await coordinator.reconcile();
  expect(current.delivered).toEqual([10, 5]); expect(current.pending.map(entry => entry.minutes)).toEqual([2]);
  fixture.setTime(1000); await coordinator.reconcile(); expect(native.engine.schedule).toHaveBeenCalledTimes(3);
  coordinator.dispose();
});
it('cancels only owned IDs when permission is revoked, preserving local configuration for explicit retry', async () => {
  const { coordinator, alerts, native } = await coordinatorFixture();
  await coordinator.save(enabled, (await alerts.read()).revision, true);
  native.scheduled.add('foreign'); jest.mocked(native.engine.permission).mockResolvedValue(false);
  await expect(coordinator.reconcile()).rejects.toThrow();
  expect((await alerts.read()).preferences).toEqual(enabled); expect((await alerts.read()).pending).toEqual([]);
  expect(native.scheduled).toEqual(new Set(['foreign'])); coordinator.dispose();
});
it('rejects stale revisions after native awaits and keeps ownership for subsequent cleanup', async () => {
  const { coordinator, alerts, timer, session, native } = await coordinatorFixture();
  const saved = await coordinator.save(enabled, (await alerts.read()).revision, true);
  jest.mocked(native.engine.cancel).mockImplementationOnce(async entry => {
    native.scheduled.delete(entry.identifier); await timer.act({ type: 'pause' }, 1000, session, saved.sessionNumber);
  });
  await expect(coordinator.save(emptyProgressAlerts, saved.revision)).rejects.toThrow();
  expect((await alerts.read()).pending).toEqual(saved.pending); expect((await alerts.read()).preferences).toEqual(enabled);
  await coordinator.reconcile(); expect((await alerts.read()).pending).toEqual([]); coordinator.dispose();
});
it.each(['readback', 'commit'])('rolls back consumption on %s failure without losing ownership or recording a false decision', async failure => {
  const fixture = await coordinatorFixture(); const { coordinator, alerts } = fixture;
  const saved = await coordinator.save(enabled, (await alerts.read()).revision, true);
  if (failure === 'readback') failReadback = true; else failCommit = true;
  await expect(alerts.consumeOwned(saved.pending[0].identifier, saved.revision)).rejects.toThrow();
  await expect(alerts.consumeElapsed(950000, saved.revision)).rejects.toThrow();
  failReadback = false; failCommit = false;
  expect(await alerts.read()).toEqual(saved); coordinator.dispose();
});
it('does not overtake an uncertain RPC with a disable action or forget its ID before cancellation', async () => {
  const { coordinator, alerts, native } = await coordinatorFixture();
  let finish!: () => void; let reached!: () => void;
  const entered = new Promise<void>(resolve => { reached = resolve; });
  jest.mocked(native.engine.schedule).mockImplementationOnce(async entry => {
    reached(); await new Promise<void>(resolve => { finish = resolve; }); native.scheduled.add(entry.identifier);
  });
  const saving = coordinator.save(enabled, (await alerts.read()).revision, true); await entered;
  const pending = await alerts.read(); const disabling = coordinator.save(emptyProgressAlerts, pending.revision);
  await Promise.resolve(); expect(native.engine.cancel).not.toHaveBeenCalled();
  expect((await alerts.read()).pending).toEqual(pending.pending);
  finish(); await saving; const disabled = await disabling;
  expect(disabled.pending).toEqual([]); expect(disabled.preferences).toEqual(emptyProgressAlerts);
  expect(native.scheduled.size).toBe(0); coordinator.dispose();
});
it('cancels an obsolete schedule that completes after the timer changes, retaining other intents for retry', async () => {
  const { coordinator, alerts, native, timer, session } = await coordinatorFixture();
  jest.mocked(native.engine.schedule).mockImplementationOnce(async entry => {
    native.scheduled.add(entry.identifier); await timer.act({ type: 'pause' }, 1000, session, entry.sessionNumber);
  });
  await expect(coordinator.save(enabled, (await alerts.read()).revision, true)).rejects.toThrow();
  expect(native.scheduled.size).toBe(0); expect((await alerts.read()).pending).toHaveLength(2);
  expect((await alerts.read()).session?.phase).toBe('paused');
  await coordinator.reconcile(); expect((await alerts.read()).pending).toEqual([]); coordinator.dispose();
});
it('does not publish changes or forget ownership after disposal during an in-flight cancellation', async () => {
  const { coordinator, alerts, native } = await coordinatorFixture();
  const saved = await coordinator.save(enabled, (await alerts.read()).revision, true);
  jest.mocked(native.engine.cancel).mockImplementationOnce(async () => { coordinator.dispose(); });
  await expect(coordinator.save(emptyProgressAlerts, saved.revision)).rejects.toThrow();
  expect(await alerts.read()).toEqual(saved); expect(native.engine.dispose).toHaveBeenCalledTimes(1);
  await expect(coordinator.reconcile()).rejects.toThrow();
});
it('ignores foreign or old-session received IDs and consumes current owned callbacks at most once', async () => {
  const { coordinator, alerts, native } = await coordinatorFixture();
  const saved = await coordinator.save(enabled, (await alerts.read()).revision, true);
  expect(await coordinator.received('foreign')).toEqual(saved);
  const id = saved.pending.find(entry => entry.minutes === 10)!.identifier;
  const consumed = await coordinator.received(id); expect(consumed.delivered).toEqual([10]);
  expect(consumed.pending.map(entry => entry.minutes)).toEqual([2, 5]);
  expect(await coordinator.received(id)).toEqual(consumed);
  expect(native.engine.schedule).toHaveBeenCalledTimes(3); coordinator.dispose();
});

let alertsContext: ReturnType<typeof useProgressAlerts>;
let timerContext: ReturnType<typeof useTransitionTimer>;
function ProviderProbe() {
  const alerts = useProgressAlerts(); const timer = useTransitionTimer();
  useEffect(() => { alertsContext = alerts; timerContext = timer; }, [alerts, timer]);
  return createElement(Text, null, alerts?.loading ? 'Loading' : 'Ready');
}
async function providerFixture(preferences = { ...enabled, systemNotifications: false }, strict = false, nowMs = 1000) {
  jest.useFakeTimers({ now: 1000 }); alertsContext = null;
  const timer = await openTimerDatabase(); const alerts = await openProgressAlertDatabase();
  await timer.actVersioned({ type: 'start', durationMs: 1200000 }, 1000, await timer.readVersioned());
  await alerts.savePreferences(preferences, (await alerts.read()).revision);
  jest.setSystemTime(nowMs);
  const native = fakeEngine(); const factory = jest.spyOn(engineModule, 'createExpoProgressAlertEngine').mockReturnValue(native.engine);
  const listeners = new Set<(state: AppStateStatus) => void>();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, callback) => {
    listeners.add(callback); return { remove: () => { listeners.delete(callback); } };
  });
  const tree = createElement(TransitionTimerProvider, null, createElement(ProgressAlertsProvider, null, createElement(ProviderProbe)));
  const view = render(strict ? createElement(StrictMode, null, tree) : tree);
  await act(async () => {}); await waitFor(() => expect(alertsContext?.loading).toBe(false));
  await waitFor(() => expect(alertsContext?.busy).toBe(false));
  return { ...native, factory, timer, alerts, view, listeners,
    changeState: async (state: AppStateStatus) => { await act(async () => { for (const callback of listeners) callback(state); }); },
    cleanup: () => { view.unmount(); jest.restoreAllMocks(); jest.useRealTimers(); },
  };
}
it('mounts a StrictMode visual-only provider without native capability or permission and suppresses clock jumps', async () => {
  const fixture = await providerFixture(undefined, true);
  try {
    expect(fixture.factory).not.toHaveBeenCalled();
    await act(async () => { jest.advanceTimersByTime(1000); });
    await act(async () => { jest.setSystemTime(600000); });
    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(alertsContext?.visualMark).toBeNull(); // wall-clock jump, not a continuous crossing
    await act(async () => { jest.setSystemTime(900000); });
    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(alertsContext?.visualMark).toBeNull();
    expect(fixture.factory).not.toHaveBeenCalled();
  } finally { fixture.cleanup(); }
});
it('publishes a current foreground milestone only after persisting the decision and does not write on ordinary ticks', async () => {
  const fixture = await providerFixture(undefined, true, 599000);
  try {
    const initial = await fixture.alerts.read();
    await act(async () => { jest.advanceTimersByTime(1000); });
    expect((await fixture.alerts.read()).revision).toBe(initial.revision);
    await act(async () => { jest.advanceTimersByTime(1000); });
    await waitFor(() => expect(alertsContext?.busy).toBe(false));
    expect(alertsContext?.visualMark).toBe(10); expect((await fixture.alerts.read()).delivered).toEqual([10]);
    const consumed = await fixture.alerts.read();
    await act(async () => { jest.advanceTimersByTime(1000); });
    expect((await fixture.alerts.read()).revision).toBe(consumed.revision); expect(fixture.factory).not.toHaveBeenCalled();
  } finally { fixture.cleanup(); }
});
it('consumes background milestones on return without visual replay or native permission', async () => {
  const fixture = await providerFixture();
  try {
    await fixture.changeState('background');
    await act(async () => { jest.advanceTimersByTime(700000); });
    await fixture.changeState('active'); await waitFor(() => expect(alertsContext?.busy).toBe(false));
    expect(alertsContext?.visualMark).toBeNull(); expect((await fixture.alerts.read()).delivered).toEqual([10]);
    expect(fixture.factory).not.toHaveBeenCalled();
  } finally { fixture.cleanup(); }
});
it('keeps explicit permission separate from visual preferences and clears listeners on unmount', async () => {
  const fixture = await providerFixture();
  try {
    await act(async () => { expect(await alertsContext!.requestSystemPermission()).toBe(true); });
    expect(fixture.engine.requestPermission).toHaveBeenCalledTimes(1);
    await act(async () => { expect(await alertsContext!.save(enabled, true)).toBe(true); });
    expect(fixture.engine.schedule).toHaveBeenCalledTimes(3);
    expect(fixture.engine.onReceived).toHaveBeenCalledTimes(1);
    fixture.view.unmount(); expect(fixture.listeners.size).toBe(0); expect(fixture.engine.dispose).toHaveBeenCalledTimes(1);
  } finally { fixture.cleanup(); }
});
it('preserves timer actions while a native notification RPC is pending and cleans up obsolete intents afterwards', async () => {
  const fixture = await providerFixture();
  try {
    let finish!: () => void; let reached!: () => void;
    const entered = new Promise<void>(resolve => { reached = resolve; });
    jest.mocked(fixture.engine.schedule).mockImplementationOnce(async entry => {
      reached(); await new Promise<void>(resolve => { finish = resolve; }); fixture.scheduled.add(entry.identifier);
    });
    let saving!: Promise<boolean>;
    await act(async () => { saving = alertsContext!.save(enabled, true); await entered; });
    expect(alertsContext?.busy).toBe(true);
    await act(async () => { await timerContext.act({ type: 'pause' }); });
    expect(timerContext.session?.phase).toBe('paused'); expect(timerContext.busy).toBe(false);
    await act(async () => { finish(); await saving; });
    await waitFor(() => expect(alertsContext?.busy).toBe(false));
    expect(fixture.scheduled.size).toBe(0); expect((await fixture.alerts.read()).pending).toEqual([]);
  } finally { fixture.cleanup(); }
});
it('does not publish a foreground notice when the local decision fails to commit, and retry consumes it without replay', async () => {
  const fixture = await providerFixture(undefined, false, 599000);
  try {
    await act(async () => { jest.advanceTimersByTime(1000); }); failCommit = true;
    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(alertsContext?.error).toBe(true); expect(alertsContext?.visualMark).toBeNull();
    failCommit = false; expect((await fixture.alerts.read()).delivered).toEqual([]);
    await act(async () => { alertsContext!.retry(); }); await waitFor(() => expect(alertsContext?.busy).toBe(false));
    expect((await fixture.alerts.read()).delivered).toEqual([10]); expect(alertsContext?.visualMark).toBeNull();
  } finally { failCommit = false; fixture.cleanup(); }
});
it('shows one current committed native callback crossing and ignores duplicate or detached callbacks', async () => {
  const fixture = await providerFixture(enabled, false, 599000);
  try {
    await act(async () => { jest.advanceTimersByTime(1000); });
    const id = (await fixture.alerts.read()).pending.find(entry => entry.minutes === 10)!.identifier;
    const received = jest.mocked(fixture.engine.onReceived).mock.calls[0][1];
    const ownGetter = jest.mocked(fixture.engine.onReceived).mock.calls[0][0];
    expect(ownGetter().some(entry => entry.identifier === id)).toBe(true);
    jest.spyOn(performance, 'now').mockReturnValue(2000); jest.setSystemTime(601000);
    await act(async () => { received(id); received(id); });
    await waitFor(() => expect(alertsContext?.snapshot?.pending).toHaveLength(2));
    expect(alertsContext?.visualMark).toBe(10); expect((await fixture.alerts.read()).delivered).toEqual([10]);
    expect(ownGetter().some(entry => entry.identifier === id)).toBe(false);
    const saved = await fixture.alerts.read(); fixture.view.unmount();
    await act(async () => { received(id); }); expect(await fixture.alerts.read()).toEqual(saved);
  } finally { fixture.cleanup(); }
});
