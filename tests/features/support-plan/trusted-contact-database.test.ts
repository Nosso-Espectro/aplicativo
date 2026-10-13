/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { openTrustedContactDatabase } from '../../../src/features/support-plan/trusted-contact-database';
import { emptyTrustedContact } from '../../../src/features/support-plan/trusted-contact';
import { openSupportPlanDatabase } from '../../../src/features/support-plan/support-plan-database';
import { emptySupportPlan } from '../../../src/features/support-plan/support-plan';
import { openPreferencesDatabase } from '../../../src/features/communication-profile/preferences-database';
import { emptySupportPreferences } from '../../../src/features/communication-profile/support-preferences';
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
const fixture = { name: 'Pessoa sintética', phone: '+12025550123', message: 'Mensagem sintética' };
let directory: string; let connections: DatabaseSync[]; let failRead: boolean; let failCommit: boolean;
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'tear-contact-test-')); connections = []; failRead = false; failCommit = false;
  jest.mocked(openDatabaseAsync).mockImplementation(async (name) => {
    const sql = new DatabaseSync(join(directory, name)); connections.push(sql);
    const adapter = {
      execAsync: async (statement: string) => { sql.exec(statement); },
      runAsync: async (statement: string, ...params: (string | number | null)[]) => sql.prepare(statement).run(...params),
      getAllAsync: async (statement: string) => {
        if (failRead && statement.startsWith('SELECT name')) throw new Error('synthetic read failure'); return sql.prepare(statement).all();
      },
      closeAsync: async () => { sql.close(); },
      withExclusiveTransactionAsync: async (operation: (tx: SQLiteDatabase) => Promise<void>) => {
        sql.exec('BEGIN');
        try { await operation(adapter as unknown as SQLiteDatabase); if (failCommit) throw new Error('synthetic commit failure'); sql.exec('COMMIT'); }
        catch (error) { sql.exec('ROLLBACK'); throw error; }
      },
    };
    return adapter as unknown as SQLiteDatabase;
  });
});
afterEach(() => { for (const db of connections) { try { db.close(); } catch {} } rmSync(directory, { recursive: true, force: true }); });
it('starts empty, parameterizes free text and reopens a valid local contact — spec004/RF-008', async () => {
  const db = await openTrustedContactDatabase(); expect(await db.read()).toEqual(emptyTrustedContact);
  const saved = await db.save({ ...fixture, name: "  Teste'); DROP TABLE trusted_contact; --  ", phone: '+1 (202) 555-0123', message: '  Mensagem\nLivre  ' });
  expect(saved).toEqual({ name: "Teste'); DROP TABLE trusted_contact; --", phone: '+12025550123', message: 'Mensagem\nLivre' });
  expect(await (await openTrustedContactDatabase()).read()).toEqual(saved);
});
it('edits/removes only one configured contact, with optional name and no defaults', async () => {
  const db = await openTrustedContactDatabase(); await db.save(fixture);
  const changed = { name: '', phone: '+12025550124', message: 'Outra mensagem' };
  expect(await db.save(changed)).toEqual(changed); expect(await db.read()).toEqual(changed);
  expect(connections[0].prepare('SELECT count(*) AS total FROM trusted_contact').get()).toEqual({ total: 1 });
  expect(await db.save(emptyTrustedContact)).toEqual(emptyTrustedContact); expect(await (await openTrustedContactDatabase()).read()).toEqual(emptyTrustedContact);
});
it('rolls back failed edit/removal reads and permits retry without confirmed-data loss', async () => {
  const db = await openTrustedContactDatabase(); const saved = await db.save(fixture);
  failRead = true; await expect(db.save(emptyTrustedContact)).rejects.toThrow(); failRead = false;
  expect(await db.read()).toEqual(saved); expect(await db.save(emptyTrustedContact)).toEqual(emptyTrustedContact);
});
it('does not publish a successful save before commit', async () => {
  const db = await openTrustedContactDatabase(); await db.save(fixture);
  failCommit = true; await expect(db.save({ ...fixture, message: 'Nova mensagem' })).rejects.toThrow(); failCommit = false;
  expect(await db.read()).toEqual(fixture); expect(await db.save({ ...fixture, message: 'Nova mensagem' })).toEqual({ ...fixture, message: 'Nova mensagem' });
});
it('queues operations and reads only committed contact/message pairs', async () => {
  const db = await openTrustedContactDatabase();
  const first = db.save(fixture); const readFirst = db.read(); const secondValue = { ...fixture, phone: '+12025550124', message: 'Segundo' };
  const second = db.save(secondValue); const readSecond = db.read();
  expect(await first).toEqual(fixture); expect(await readFirst).toEqual(fixture); expect(await second).toEqual(secondValue); expect(await readSecond).toEqual(secondValue);
});
it('rejects invalid input/corrupt rows generically and preserves confirmed data', async () => {
  const db = await openTrustedContactDatabase(); await db.save(fixture);
  await expect(db.save({ ...fixture, phone: 'private invalid phone' })).rejects.toThrow('Invalid trusted contact.'); expect(await db.read()).toEqual(fixture);
  await expect(db.save({ ...fixture, message: '\uD800' })).rejects.toThrow('Invalid trusted contact.');
  connections[0].prepare('UPDATE trusted_contact SET phone = ?').run('invalid'); await expect(db.read()).rejects.toThrow('Invalid trusted contact.');
  expect(await db.save(fixture)).toEqual(fixture);
});
it('refuses a future schema without downgrading or clearing content', async () => {
  const db = await openTrustedContactDatabase(); await db.save(fixture); connections[0].exec('PRAGMA user_version=2;');
  await expect(openTrustedContactDatabase()).rejects.toThrow('Trusted contact storage unavailable.');
  expect(connections[0].prepare('PRAGMA user_version').get()).toEqual({ user_version: 2 }); expect(await db.read()).toEqual(fixture);
});
it('isolates deletion from the existing plan and profile without copying them into the contact', async () => {
  const profile = await openPreferencesDatabase(); const support = await profile.saveSupport({ ...emptySupportPreferences, sound: 'Som sintético' });
  const plans = await openSupportPlanDatabase(); const plan = await plans.save({ ...emptySupportPlan, instructions: 'Orientação sintética', profileFields: ['sound'] });
  const contacts = await openTrustedContactDatabase(); await contacts.save(fixture); await contacts.save(emptyTrustedContact);
  expect(await plans.read()).toEqual(plan); expect(await profile.readSupport()).toEqual(support);
  expect(await contacts.read()).toEqual(emptyTrustedContact);
});
