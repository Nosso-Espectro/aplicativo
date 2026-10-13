import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import {
  createSentenceState,
  sentenceReducer,
  type SentenceAction,
  type SentenceState,
} from './sentence-state';

const SentenceContext = createContext<{
  state: SentenceState;
  dispatch: Dispatch<SentenceAction>;
} | null>(null);

export function SentenceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sentenceReducer, undefined, createSentenceState);
  return (
    <SentenceContext.Provider value={{ state, dispatch }}>
      {children}
    </SentenceContext.Provider>
  );
}

export function useSentence() {
  const sentence = useContext(SentenceContext);
  if (!sentence) {
    throw new Error('SentenceProvider is required.');
  }
  return sentence;
}
