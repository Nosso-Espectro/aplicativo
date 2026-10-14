import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { normalizedScriptDraft, resolveScript, scriptFavorite, scriptIdentity, scriptRevision,
  type SavedPersonalScript, type ScriptDraft, type ScriptFavorite, type ScriptReference, type ScriptWorkspace } from './personal-script-model';

async function readWorkspace(db: SQLiteDatabase): Promise<ScriptWorkspace> {
  const [{ user_version: version }] = await db.getAllAsync<{ user_version: number }>('PRAGMA user_version');
  if (version !== 1) throw new Error('Unsupported script schema.');
  const rows = await db.getAllAsync<{ id: string; text: string; category_id: ScriptDraft['categoryId']; revision: number }>('SELECT id,text,category_id,revision FROM personal_scripts ORDER BY rowid');
  const personal: SavedPersonalScript[] = rows.map(row => {
    const draft = normalizedScriptDraft({ text: row.text, categoryId: row.category_id });
    if (draft.text !== row.text) throw new Error('Invalid stored script.');
    return { ...draft, id: scriptIdentity(row.id), revision: scriptRevision(row.revision) };
  });
  const states = await db.getAllAsync<{ source: ScriptFavorite['source']; id: string; selected: number; revision: number }>('SELECT source,id,selected,revision FROM script_favorites ORDER BY source,id');
  const favorites = states.map(row => {
    if (!['initial', 'personal'].includes(row.source) || ![0, 1].includes(row.selected)) throw new Error('Invalid script favorite.');
    const id = scriptIdentity(row.id);
    const ref: ScriptReference = row.source === 'initial' ? { source: 'initial', id } : { source: 'personal', id,
      revision: personal.find(item => item.id === id)?.revision ?? 0 };
    resolveScript({ personal, favorites: [] }, ref);
    return { source: row.source, id, selected: row.selected === 1, revision: scriptRevision(row.revision) };
  });
  return { personal, favorites };
}
export async function openScriptDatabase() {
  const db = await openDatabaseAsync('tear-communication-scripts.db');
  try {
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.withExclusiveTransactionAsync(async tx => {
      const [{ user_version: version }] = await tx.getAllAsync<{ user_version: number }>('PRAGMA user_version');
      if (version !== 0 && version !== 1) throw new Error('Unsupported script schema.');
      if (version === 0) await tx.execAsync(`CREATE TABLE personal_scripts (
        id TEXT PRIMARY KEY NOT NULL,text TEXT NOT NULL,category_id TEXT NOT NULL,revision INTEGER NOT NULL CHECK(revision>=1)
      ); CREATE TABLE script_favorites (
        source TEXT NOT NULL CHECK(source IN ('initial','personal')),id TEXT NOT NULL,
        selected INTEGER NOT NULL CHECK(selected IN (0,1)),revision INTEGER NOT NULL CHECK(revision>=1),PRIMARY KEY(source,id)
      ); PRAGMA user_version=1;`);
      await readWorkspace(tx);
    });
  } catch { await db.closeAsync(); throw new Error('Script storage unavailable.'); }
  let pending: Promise<unknown> = Promise.resolve();
  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const next = pending.then(operation); pending = next.catch(() => undefined); return next;
  }
  function change(operation: (tx: SQLiteDatabase, current: ScriptWorkspace) => Promise<string | void>) {
    return enqueue(async () => {
      let confirmed!: ScriptWorkspace;
      await db.withExclusiveTransactionAsync(async tx => {
        const id = await operation(tx, await readWorkspace(tx));
        confirmed = { ...await readWorkspace(tx), ...(id ? { createdScriptId: id } : {}) };
      });
      return confirmed;
    });
  }
  return {
    read: () => enqueue(async () => {
      let confirmed!: ScriptWorkspace;
      await db.withExclusiveTransactionAsync(async tx => { confirmed = await readWorkspace(tx); });
      return confirmed;
    }),
    save: (input: ScriptDraft, expected: { id: string; revision: number } | null = null) => change(async (tx, current) => {
      const draft = normalizedScriptDraft(input);
      if (expected) {
        const script = resolveScript(current, { source: 'personal', ...expected }) as SavedPersonalScript;
        const revision = scriptRevision(script.revision + 1);
        await tx.runAsync('UPDATE personal_scripts SET text=?,category_id=?,revision=? WHERE id=?', draft.text, draft.categoryId, revision, script.id);
      } else {
        const id = scriptIdentity(`script-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        await tx.runAsync('INSERT INTO personal_scripts(id,text,category_id,revision) VALUES(?,?,?,1)', id, draft.text, draft.categoryId);
        return id;
      }
    }),
    remove: (expected: { id: string; revision: number }) => change(async (tx, current) => {
      const script = resolveScript(current, { source: 'personal', ...expected });
      await tx.runAsync("DELETE FROM script_favorites WHERE source='personal' AND id=?", script.id);
      await tx.runAsync('DELETE FROM personal_scripts WHERE id=?', script.id);
    }),
    setFavorite: (ref: ScriptReference, selected: boolean, expectedRevision: number) => change(async (tx, current) => {
      const script = resolveScript(current, ref);
      if (typeof selected !== 'boolean') throw new Error('Invalid favorite choice.');
      const favorite = scriptFavorite(current, ref.source, script.id);
      if ((favorite?.revision ?? 0) !== scriptRevision(expectedRevision, 0)) throw new Error('Favorite changed.');
      const revision = scriptRevision((favorite?.revision ?? 0) + 1);
      // Retain deselected revisions so stale toggles cannot pass after an on/off cycle.
      await tx.runAsync(`INSERT INTO script_favorites(source,id,selected,revision) VALUES(?,?,?,?)
        ON CONFLICT(source,id) DO UPDATE SET selected=excluded.selected,revision=excluded.revision`, ref.source, script.id, selected ? 1 : 0, revision);
    }),
  };
}
export type ScriptDatabase = Awaited<ReturnType<typeof openScriptDatabase>>;
