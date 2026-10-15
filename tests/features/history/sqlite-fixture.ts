/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { SQLiteDatabase } from 'expo-sqlite';

export function historySQLiteFixture() {
  const directory = mkdtempSync(join(tmpdir(), 'tear-history-'));
  const connections: DatabaseSync[] = [];
  let failReadAfterWrite = false;
  let commitGate: Promise<void> | null = null;
  let waiting = false;
  let committed = false;
  return {
    connections,
    failResult(value: boolean) { failReadAfterWrite = value; },
    delayCommit(gate: Promise<void>) { commitGate = gate; waiting = false; committed = false; },
    isWaiting: () => waiting,
    isCommitted: () => committed,
    async open(name: string): Promise<SQLiteDatabase> {
      const sql = new DatabaseSync(join(directory, name)); connections.push(sql);
      let written = false;
      const adapter = {
        execAsync: async (statement: string) => sql.exec(statement),
        runAsync: async (statement: string, ...params: (string | number | null)[]) => {
          const result = sql.prepare(statement).run(...params); written = true; return result;
        },
        getAllAsync: async (statement: string, ...params: (string | number | null)[]) => {
          if (written && failReadAfterWrite) throw new Error('synthetic private result failure');
          return sql.prepare(statement).all(...params);
        },
        closeAsync: async () => sql.close(),
        withExclusiveTransactionAsync: async (operation: (tx: SQLiteDatabase) => Promise<void>) => {
          sql.exec('BEGIN'); written = false;
          try {
            await operation(adapter as unknown as SQLiteDatabase);
            if (written && commitGate) { waiting = true; await commitGate; }
            sql.exec('COMMIT'); if (written) committed = true;
          } catch (error) { sql.exec('ROLLBACK'); throw error; }
        },
      };
      return adapter as unknown as SQLiteDatabase;
    },
    close() {
      for (const sql of connections) { try { sql.close(); } catch {} }
      rmSync(directory, { recursive: true, force: true });
    },
  };
}
