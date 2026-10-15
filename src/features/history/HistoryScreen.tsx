import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { historyStorage } from './history-storage';
import type { HistoryFilter, HistoryRecord } from './history-model';
import { checkInSummary } from '../sensory-check-in/check-in-summary';

const filters = [{ value: 'all', label: 'Todos' }, { value: 'check-in', label: 'Check-ins' }, { value: 'routine', label: 'Rotinas concluídas' }] as const;
export function HistoryScreen({ onExit }: { onExit(): void }) {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const owner = useRef<object | null>(null);
  const [activation, setActivation] = useState<object | null>(null);
  useFocusEffect(useCallback(() => {
    const token = { attempt }; owner.current = token; setActivation(token); setStatus('loading'); setRecords([]);
    void (async () => {
      try {
        const saved = await (await historyStorage()).list();
        if (owner.current === token) { setRecords(saved); setStatus('ready'); }
      } catch { if (owner.current === token) setStatus('error'); }
    })();
    return () => { owner.current = null; };
  }, [attempt]));
  const current = () => activation !== null && owner.current === activation;
  const visible = records.filter(record => filter === 'all' || record.type === filter);
  return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.content}>
    <Pressable accessibilityRole="button" accessibilityLabel="Voltar ao quadro" style={styles.command} onPress={() => { if (current()) { owner.current = null; onExit(); } }}>
      <MaterialIcons name="arrow-back" size={24} color="#16634D" accessible={false} /><Text style={styles.commandLabel}>Voltar ao quadro</Text>
    </Pressable>
    <Text accessibilityRole="header" style={styles.heading}>Histórico</Text>
    <View accessibilityRole="radiogroup" accessibilityLabel="Tipo de registro" style={styles.filters}>
      {filters.map(item => <Pressable key={item.value} accessibilityRole="radio" accessibilityLabel={item.label}
        accessibilityState={{ checked: filter === item.value }} style={styles.command} onPress={() => { if (current()) setFilter(item.value); }}>
        <MaterialIcons name={filter === item.value ? 'radio-button-checked' : 'radio-button-unchecked'} size={24} color="#16634D" accessible={false} />
        <Text style={styles.text}>{item.label}</Text>
      </Pressable>)}
    </View>
    {status === 'loading' && <Text accessibilityLiveRegion="polite" style={styles.text}>Abrindo histórico…</Text>}
    {status === 'error' && <>
      <Text accessibilityRole="alert" style={styles.error}>{Platform.OS === 'web' ? 'Histórico indisponível nesta prévia web.' : 'Não foi possível abrir o histórico. Tente novamente.'}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Tentar abrir histórico novamente" style={styles.command} onPress={() => { if (current()) setAttempt(value => value + 1); }}>
        <MaterialIcons name="refresh" size={24} color="#16634D" accessible={false} /><Text style={styles.commandLabel}>Tentar novamente</Text>
      </Pressable>
    </>}
    {status === 'ready' && visible.length === 0 && <Text accessibilityLiveRegion="polite" style={styles.text}>{records.length === 0 ? 'Ainda não há registros salvos.' : 'Nenhum registro deste tipo.'}</Text>}
    {status === 'ready' && visible.map(record => <View key={record.id} style={styles.record}>
      <Text accessibilityRole="header" style={styles.title}>{record.type === 'check-in' ? 'Check-in corporal e sensorial' : 'Rotina concluída'}</Text>
      <Text style={styles.note}>{new Date(record.savedAt).toLocaleString('pt-BR')}</Text>
      {record.type === 'routine' ? <>
        <Text style={styles.text}>{record.name}</Text><Text style={styles.note}>{`${record.steps} ${record.steps === 1 ? 'etapa' : 'etapas'}`}</Text>
      </> : checkInSummary(record.answers).map(item => <View key={item.id} accessible accessibilityLabel={`${item.question} ${item.answer}`} style={styles.answer}>
        <Text style={styles.text}>{item.question}</Text><Text style={styles.text}>{item.answer}</Text>
      </View>)}
    </View>)}
    <Text style={styles.note}>Estes registros não são um diagnóstico.</Text>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, gap: 16, width: '100%', maxWidth: 720, alignSelf: 'center' },
  heading: { fontSize: 26, fontWeight: '600', color: '#202124' }, title: { fontSize: 22, fontWeight: '600', color: '#202124' },
  text: { fontSize: 18, color: '#202124', flexShrink: 1 }, note: { fontSize: 16, color: '#454A50' },
  command: { minHeight: 48, maxWidth: '100%', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  commandLabel: { fontSize: 18, color: '#16634D', fontWeight: '600', flexShrink: 1 },
  filters: { flexDirection: 'row', flexWrap: 'wrap' }, record: { paddingVertical: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: '#72777D' },
  answer: { gap: 4 }, error: { fontSize: 18, color: '#962D32' },
});
