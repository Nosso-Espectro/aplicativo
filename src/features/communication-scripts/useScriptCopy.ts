import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { localClipboard } from './local-clipboard';
export function useScriptCopy() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const ownerRef = useRef<{ active: boolean } | null>(null); const inFlight = useRef(false);
  useFocusEffect(useCallback(() => {
    const owner = { active: true }; ownerRef.current = owner; setMessage(null); setBusy(inFlight.current);
    return () => { owner.active = false; };
  }, []));
  async function copy(text: string) {
    const owner = ownerRef.current; if (!owner?.active || inFlight.current) return;
    inFlight.current = true; setBusy(true); setMessage(null);
    try {
      const copied = await localClipboard.copy(text);
      if (owner.active) setMessage({ text: copied ? 'Script copiado.' : 'Não foi possível copiar. Tente novamente.', error: !copied });
    } catch { if (owner.active) setMessage({ text: 'Não foi possível copiar. Tente novamente.', error: true }); }
    finally { inFlight.current = false; if (ownerRef.current?.active) setBusy(false); }
  }
  return { busy, message, copy, clear: () => setMessage(null) };
}
