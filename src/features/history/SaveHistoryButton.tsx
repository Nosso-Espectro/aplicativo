import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { newHistoryRecord, type HistoryContent, type HistoryRecord } from './history-model';
import { historyStorage } from './history-storage';

type SaveStatus = 'idle' | 'busy' | 'saved' | 'error';
export function SaveHistoryButton({ content }: { content: HistoryContent }) {
  const owner = useRef<object | null>(null);
  const [activation, setActivation] = useState<object | null>(null);
  const intent = useRef<HistoryRecord | null>(null);
  const outcome = useRef<SaveStatus>('idle');
  const operation = useRef<Promise<void> | null>(null);
  const [status, setStatus] = useState<SaveStatus>('idle');
  useFocusEffect(useCallback(() => {
    const token = {}; owner.current = token; setActivation(token);
    setStatus(outcome.current);
    // A new focus observes the existing intent without issuing a second write.
    if (operation.current) void operation.current.then(() => {
      if (owner.current === token) setStatus(outcome.current);
    });
    return () => { owner.current = null; };
  }, []));
  const current = () => activation !== null && owner.current === activation;
  function save() {
    if (!current() || outcome.current === 'busy' || outcome.current === 'saved') return;
    outcome.current = 'busy'; setStatus('busy');
    operation.current = (async () => {
      try {
        intent.current ??= newHistoryRecord(content);
        const record = intent.current;
        const db = await historyStorage();
        if (!current()) { outcome.current = 'idle'; return; }
        await db.save(record);
        outcome.current = 'saved';
      } catch { outcome.current = 'error'; }
      finally { if (current()) setStatus(outcome.current); }
    })();
  }
  const disabled = status === 'busy' || status === 'saved';
  return <View style={styles.group}>
    <Text style={styles.note}>{content.type === 'check-in' ? 'Salvar respostas neste aparelho.' : 'Salvar nome da rotina e quantidade de etapas neste aparelho.'}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Salvar no histórico" accessibilityState={{ disabled, busy: status === 'busy' }}
      disabled={disabled} onPress={() => void save()} style={({ pressed }) => [styles.command, pressed && styles.pressed]}>
      <MaterialIcons name="save-alt" size={24} color="#16634D" accessible={false} />
      <Text style={styles.label}>Salvar no histórico</Text>
    </Pressable>
    {status === 'busy' && <Text accessibilityLiveRegion="polite" style={styles.note}>Salvando no histórico…</Text>}
    {status === 'saved' && <Text accessibilityLiveRegion="polite" style={styles.note}>Salvo no histórico.</Text>}
    {status === 'error' && <Text accessibilityRole="alert" style={styles.error}>{Platform.OS === 'web'
      ? 'Histórico indisponível nesta prévia web.' : 'Não foi possível salvar no histórico. Toque em Salvar no histórico para tentar novamente.'}</Text>}
  </View>;
}
const styles = StyleSheet.create({
  group: { gap: 8 }, note: { fontSize: 16, color: '#454A50' }, error: { fontSize: 18, color: '#962D32' },
  command: { minHeight: 48, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 18, color: '#16634D', fontWeight: '600', flexShrink: 1 }, pressed: { backgroundColor: '#EDF0F2' },
});
