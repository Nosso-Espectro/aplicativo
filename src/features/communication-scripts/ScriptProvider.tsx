import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { openScriptDatabase, type ScriptDatabase } from './script-database';
import { normalizedScriptDraft, scriptFavorite, type SavedPersonalScript, type ScriptDraft, type ScriptReference, type ScriptWorkspace } from './personal-script-model';
type ContextValue = ScriptWorkspace & {
  loading: boolean; busy: boolean; error: string | null; retry(): void;
  save(draft: ScriptDraft, expected: { id: string; revision: number } | null): Promise<SavedPersonalScript | null>;
  remove(script: SavedPersonalScript): Promise<boolean>;
  favorite(ref: ScriptReference, selected: boolean): Promise<boolean>;
};
const Context = createContext<ContextValue | null>(null);
export function ScriptProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<ScriptWorkspace>({ personal: [], favorites: [] });
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null); const [attempt, setAttempt] = useState(0);
  const database = useRef<Promise<ScriptDatabase> | null>(null);
  const owner = useRef<object | null>(null); const inFlight = useRef(false);
  useEffect(() => {
    const token = {}; owner.current = token;
    void (async () => {
      try {
        database.current ??= openScriptDatabase(); const saved = await (await database.current).read();
        if (owner.current === token) { setWorkspace(saved); setError(null); }
      } catch {
        if (owner.current === token) { database.current = null; setError('Não foi possível abrir os scripts pessoais. Tente novamente.'); }
      } finally { if (owner.current === token) setLoading(false); }
    })();
    return () => { if (owner.current === token) owner.current = null; };
  }, [attempt]);
  async function change(operation: (db: ScriptDatabase) => Promise<ScriptWorkspace>) {
    const token = owner.current;
    if (!token || !database.current || loading || error || inFlight.current) return null;
    inFlight.current = true; setBusy(true);
    try {
      const saved = await operation(await database.current);
      if (owner.current !== token) return null;
      setWorkspace({ personal: saved.personal, favorites: saved.favorites }); return saved;
    } catch { throw new Error('Script change unavailable.'); }
    finally { inFlight.current = false; if (owner.current === token) setBusy(false); }
  }
  return <Context.Provider value={{ ...workspace, loading, busy, error,
    retry: () => { if (inFlight.current) return; setLoading(true); setAttempt(value => value + 1); },
    save: async (input, expected) => {
      const draft = normalizedScriptDraft(input); const captured = expected ? { ...expected } : null;
      const saved = await change(db => db.save(draft, captured));
      return saved?.personal.find(script => script.id === (captured?.id ?? saved.createdScriptId)) ?? null;
    },
    remove: async script => { const expected = { id: script.id, revision: script.revision }; return Boolean(await change(db => db.remove(expected))); },
    favorite: async (ref, selected) => {
      const captured = { ...ref }; const revision = scriptFavorite(workspace, ref.source, ref.id)?.revision ?? 0;
      return Boolean(await change(db => db.setFavorite(captured, selected, revision)));
    },
  }}>{children}</Context.Provider>;
}
export function useScripts() {
  const context = useContext(Context); if (!context) throw new Error('ScriptProvider required.'); return context;
}
