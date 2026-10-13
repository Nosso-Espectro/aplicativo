import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { openCardDatabase } from '../storage/card-database';
import { useSentence } from '../sentence/SentenceProvider';
import { createCardStorage } from './custom-card-storage';
import type { CardDraft, CustomCard } from './custom-card-validation';

type Storage = ReturnType<typeof createCardStorage>;
type CardsContext = {
  cards: CustomCard[]; loading: boolean; error: string | null; retry(): void;
  save(draft: CardDraft, id?: string): Promise<void>; remove(id: string): Promise<void>;
};
const Context = createContext<CardsContext | null>(null);
export function CustomCardsProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<CustomCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const storage = useRef<Storage | null>(null);
  const initialization = useRef<Promise<{ current: Storage; saved: CustomCard[] }> | null>(null);
  const pruned = useRef(false);
  const { dispatch } = useSentence();
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        initialization.current ??= (async () => {
          const current = storage.current ?? createCardStorage(await openCardDatabase());
          storage.current = current;
          const saved = await current.list();
          // Only before session editing: old sentence snapshots no longer exist.
          if (!pruned.current) {
            pruned.current = true;
            await current.prune().catch(() => undefined);
          }
          return { current, saved };
        })();
        const { saved } = await initialization.current;
        if (active) { setCards(saved); setError(null); }
      } catch {
        if (active) setError(Platform.OS === 'web'
          ? 'Cartões próprios estão disponíveis no aplicativo Android e iOS, não nesta prévia web.'
          : 'Não foi possível abrir os cartões salvos. Tente novamente.');
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [attempt]);
  return (
    <Context.Provider value={{ cards, loading, error, retry: () => { initialization.current = null; setLoading(true); setAttempt((value) => value + 1); },
      async save(draft, id) {
        if (!storage.current || loading || error) throw new Error('Storage unavailable.');
        const previous = cards.find((card) => card.id === id);
        const saved = await storage.current.save(draft, id, previous?.imageUri ?? null);
        setCards(saved);
      },
      async remove(id) {
        if (!storage.current || loading || error) throw new Error('Storage unavailable.');
        const saved = await storage.current.remove(id);
        setCards(saved);
        dispatch({ type: 'remove-card', cardId: id });
      },
    }}>{children}</Context.Provider>
  );
}
export function useCustomCards() {
  const context = useContext(Context);
  if (!context) throw new Error('CustomCardsProvider is required.');
  return context;
}
