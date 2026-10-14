/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { openScriptDatabase } from '../../../src/features/communication-scripts/script-database';
import { draftFromInitialScript, scriptFavorite } from '../../../src/features/communication-scripts/personal-script-model';
import { initialScripts } from '../../../src/features/communication-scripts/script-catalog';
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
let directory: string; let connections: DatabaseSync[]; let failCommit: boolean; let failReadback: boolean;
const draft = { text: 'Script sintético', categoryId: 'other' as const };
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'tear-script-db-')); connections = []; failCommit = false; failReadback = false;
  jest.mocked(openDatabaseAsync).mockImplementation(async name => {
    expect(name).toBe('tear-communication-scripts.db');
    const sql = new DatabaseSync(join(directory, name)); connections.push(sql); let written = false;
    const adapter = {
      execAsync: async (statement: string) => { sql.exec(statement); },
      runAsync: async (statement: string, ...params: (string | number | null)[]) => { written = true; return sql.prepare(statement).run(...params); },
      getAllAsync: async (statement: string) => { if (written && failReadback) throw new Error('synthetic readback failure'); return sql.prepare(statement).all(); },
      closeAsync: async () => sql.close(),
      withExclusiveTransactionAsync: async (operation: (tx: SQLiteDatabase) => Promise<void>) => {
        sql.exec('BEGIN'); written = false;
        try { await operation(adapter as unknown as SQLiteDatabase); if (failCommit) throw new Error('synthetic commit failure'); sql.exec('COMMIT'); }
        catch (error) { sql.exec('ROLLBACK'); throw error; }
      },
    }; return adapter as unknown as SQLiteDatabase;
  });
});
afterEach(() => { for (const sql of connections) { try { sql.close(); } catch {} } rmSync(directory, { recursive: true, force: true }); jest.restoreAllMocks(); });
it('starts empty and restores scripts, categories, identities, revisions and favorites after reopening offline', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  const db = await openScriptDatabase(); expect(await db.read()).toEqual({ personal: [], favorites: [] });
  const saved = await db.save(draft); const script = saved.personal[0]; expect(saved.createdScriptId).toBe(script.id);
  await db.setFavorite({ source: 'personal', ...script }, true, 0);
  const workspace = await db.setFavorite({ source: 'initial', id: 'ask-help' }, true, 0);
  connections[0].close(); expect(await (await openScriptDatabase()).read()).toEqual(workspace);
  expect(fetch).not.toHaveBeenCalled();
});
it('edits only a copied personal script, preserves initial content and order and removes only its own favorite', async () => {
  const original = initialScripts[0]; const db = await openScriptDatabase();
  const first = (await db.save(draftFromInitialScript(original))).personal[0];
  const second = (await db.save(draft)).personal[1];
  await db.setFavorite({ source: 'initial', id: original.id }, true, 0);
  await db.setFavorite({ source: 'personal', ...first }, true, 0);
  const edited = await db.save({ text: 'Cópia alterada', categoryId: 'help' }, first);
  expect(edited.personal.map(item => item.id)).toEqual([first.id, second.id]);
  expect(edited.personal[0].revision).toBe(2); expect(original.text).toBe('Poderia me ajudar, por favor?');
  const removed = await db.remove(edited.personal[0]); expect(removed.personal).toEqual([second]);
  expect(removed.favorites).toEqual([{ source: 'initial', id: original.id, selected: true, revision: 1 }]);
});
it('refuses stale edits/removals/favorites and never resurrects a deleted script', async () => {
  const db = await openScriptDatabase(); const script = (await db.save(draft)).personal[0];
  const current = (await db.save({ ...draft, text: 'Editado' }, script)).personal[0];
  await expect(db.save(draft, script)).rejects.toThrow(); await expect(db.remove(script)).rejects.toThrow();
  await expect(db.setFavorite({ source: 'personal', ...script }, true, 0)).rejects.toThrow();
  await db.remove(current); await expect(db.save(draft, current)).rejects.toThrow();
  await expect(db.setFavorite({ source: 'personal', ...current }, true, 0)).rejects.toThrow(); expect((await db.read()).personal).toEqual([]);
});
it('tracks deselected favorite revisions so stale on/off actions cannot pass after an ABA cycle', async () => {
  const db = await openScriptDatabase(); const ref = { source: 'initial' as const, id: 'ask-help' };
  const selected = await db.setFavorite(ref, true, 0); expect(scriptFavorite(selected, 'initial', ref.id)?.selected).toBe(true);
  const deselected = await db.setFavorite(ref, false, 1); expect(deselected.favorites[0]).toMatchObject({ selected: false, revision: 2 });
  await expect(db.setFavorite(ref, true, 0)).rejects.toThrow('Favorite changed.');
  await expect(db.setFavorite(ref, false, 1)).rejects.toThrow('Favorite changed.');
  expect((await db.setFavorite(ref, true, 2)).favorites[0]).toMatchObject({ selected: true, revision: 3 });
});
it.each(['commit', 'readback'])('rolls back failed %s of creation, editing, removal and favorite changes and permits explicit retry', async failure => {
  const db = await openScriptDatabase(); const script = (await db.save(draft)).personal[0];
  const initial = await db.setFavorite({ source: 'personal', ...script }, true, 0);
  if (failure === 'commit') failCommit = true; else failReadback = true;
  await expect(db.save(draft)).rejects.toThrow(); await expect(db.save({ ...draft, text: 'Não confirmado' }, script)).rejects.toThrow();
  await expect(db.remove(script)).rejects.toThrow(); await expect(db.setFavorite({ source: 'personal', ...script }, false, 1)).rejects.toThrow();
  failCommit = false; failReadback = false; expect(await db.read()).toEqual(initial);
  expect((await db.save(draft)).personal).toHaveLength(2);
});
it('serializes saves and reads and safely observes changes from another connection without losing independent scripts', async () => {
  const db = await openScriptDatabase(); const saved = db.save(draft); const reading = db.read();
  expect((await reading).personal).toEqual((await saved).personal);
  const other = await openScriptDatabase(); const second = (await other.save({ ...draft, text: 'Outro' })).personal[1];
  const first = (await db.read()).personal[0]; await db.save({ ...draft, text: 'Editado' }, first);
  expect((await db.read()).personal[1]).toEqual(second);
});
it('refuses overflow, future schemas and missing tables without resetting confirmed user data', async () => {
  const db = await openScriptDatabase(); const script = (await db.save(draft)).personal[0];
  connections[0].prepare('UPDATE personal_scripts SET revision=?').run(Number.MAX_SAFE_INTEGER);
  const current = (await db.read()).personal[0]; await expect(db.save(draft, current)).rejects.toThrow('Invalid script revision.');
  connections[0].exec('PRAGMA user_version=2'); await expect(openScriptDatabase()).rejects.toThrow('Script storage unavailable.');
  await expect(db.read()).rejects.toThrow('Unsupported script schema.');
  connections[0].exec('PRAGMA user_version=1; DROP TABLE script_favorites');
  await expect(openScriptDatabase()).rejects.toThrow('Script storage unavailable.');
  expect(connections[0].prepare('SELECT id FROM personal_scripts').get()).toEqual({ id: script.id });
  expect(connections[0].prepare("SELECT name FROM sqlite_master WHERE name='script_favorites'").all()).toEqual([]);
});
it('rejects corruption and orphan favorite identities rather than silently repairing or exposing raw contents', async () => {
  const db = await openScriptDatabase(); const script = (await db.save(draft)).personal[0];
  connections[0].prepare('UPDATE personal_scripts SET text=?').run('  '); await expect(db.read()).rejects.toThrow();
  connections[0].prepare('UPDATE personal_scripts SET text=?').run(script.text);
  connections[0].exec("INSERT INTO script_favorites VALUES('personal','missing',1,1)"); await expect(db.read()).rejects.toThrow();
  connections[0].exec("DELETE FROM script_favorites; INSERT INTO script_favorites VALUES('initial','absent',1,1)");
  await expect(db.read()).rejects.toThrow();
});
