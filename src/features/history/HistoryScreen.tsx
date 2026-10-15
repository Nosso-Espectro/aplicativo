import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { historyStorage } from './history-storage';
import type { HistoryDeletion, HistoryFilter, HistoryRecord } from './history-model';
import { checkInSummary } from '../sensory-check-in/check-in-summary';

const filters = [{ value: 'all', label: 'Todos' }, { value: 'check-in', label: 'Check-ins' }, { value: 'routine', label: 'Rotinas concluídas' }] as const;
type DeletionIntent = { selection: HistoryDeletion };
export function HistoryScreen({ onExit }: { onExit(): void }) {
  const scroll = useRef<ScrollView>(null);
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const owner = useRef<object | null>(null);
  const [activation, setActivation] = useState<object | null>(null);
  const intent = useRef<DeletionIntent | null>(null);
  const inFlight = useRef(false);
  const [confirmation, setConfirmation] = useState<DeletionIntent | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<'deleted' | 'error' | null>(null);
  useFocusEffect(useCallback(() => {
    const token = { attempt }; owner.current = token; setActivation(token); setStatus('loading'); setRecords([]);
    intent.current = null; inFlight.current = false; setConfirmation(null); setBusy(false); setFeedback(null);
    void (async () => {
      try {
        const saved = await (await historyStorage()).list();
        if (owner.current === token) { setRecords(saved); setStatus('ready'); }
      } catch { if (owner.current === token) setStatus('error'); }
    })();
    return () => { owner.current = null; intent.current = null; };
  }, [attempt]));
  const current = () => activation !== null && owner.current === activation;
  const visible = records.filter(record => filter === 'all' || record.type === filter);
  function cancel() { intent.current = null; setConfirmation(null); }
  function requestDeletion(selection: HistoryDeletion) {
    if (!current() || status !== 'ready' || inFlight.current) return;
    const next = { selection }; intent.current = next; setConfirmation(next); setFeedback(null);
  }
  async function confirmDeletion(selected: DeletionIntent) {
    if (!current() || inFlight.current || intent.current !== selected) return;
    inFlight.current = true; setBusy(true); setFeedback(null);
    try {
      const db = await historyStorage();
      if (!current() || intent.current !== selected) return;
      const saved = await db.remove(selected.selection);
      if (current()) { setRecords(saved); cancel(); setFeedback('deleted'); }
    } catch { if (current()) { cancel(); setFeedback('error'); } }
    finally { if (current()) { inFlight.current = false; setBusy(false); } }
  }
  const selection = confirmation?.selection;
  const selectedRecord = selection?.kind === 'record' ? records.find(record => record.id === selection.id) : null;
  return <SafeAreaView style={styles.screen}><ScrollView ref={scroll} contentContainerStyle={styles.content}>
    <Pressable accessibilityRole="button" accessibilityLabel="Voltar ao quadro" style={styles.command} onPress={() => { if (current()) { owner.current = null; intent.current = null; onExit(); } }}>
      <MaterialIcons name="arrow-back" size={24} color="#16634D" accessible={false} /><Text style={styles.commandLabel}>Voltar ao quadro</Text>
    </Pressable>
    <Text accessibilityRole="header" style={styles.heading}>Histórico</Text>
    <View accessibilityRole="radiogroup" accessibilityLabel="Tipo de registro" style={styles.filters}>
      {filters.map(item => <Pressable key={item.value} accessibilityRole="radio" accessibilityLabel={item.label}
        accessibilityState={{ checked: filter === item.value, disabled: busy }} disabled={busy} style={styles.command} onPress={() => {
          if (current() && !inFlight.current) { cancel(); setFilter(item.value); setFeedback(null); }
        }}>
        <MaterialIcons name={filter === item.value ? 'radio-button-checked' : 'radio-button-unchecked'} size={24} color="#16634D" accessible={false} />
        <Text style={styles.text}>{item.label}</Text>
      </Pressable>)}
    </View>
    {status === 'ready' && records.length > 0 && <Pressable accessibilityRole="button" accessibilityLabel="Excluir todo o histórico"
      accessibilityState={{ disabled: busy }} disabled={busy} style={styles.command}
      onPress={() => requestDeletion({ kind: 'all', ids: records.map(record => record.id) })}>
      <MaterialIcons name="delete-sweep" size={24} color="#962D32" accessible={false} /><Text style={styles.deleteLabel}>Excluir todo o histórico</Text>
    </Pressable>}
    {confirmation && <View style={styles.confirmation} onLayout={event => scroll.current?.scrollTo({ y: event.nativeEvent.layout.y, animated: false })}>
      <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.title}>{confirmation.selection.kind === 'all' ? 'Excluir todo o histórico?' : 'Excluir este registro?'}</Text>
      <Text style={styles.text}>{confirmation.selection.kind === 'all'
        ? confirmation.selection.ids.length === 1 ? 'Será excluído 1 registro, mesmo se estiver oculto pelo filtro.'
          : `Serão excluídos ${confirmation.selection.ids.length} registros de todos os tipos, inclusive os ocultos pelo filtro.`
        : `${selectedRecord?.type === 'routine' ? selectedRecord.name : 'Check-in corporal e sensorial'}. Salvo em ${selectedRecord ? new Date(selectedRecord.savedAt).toLocaleString('pt-BR') : ''}.`}</Text>
      <Text style={styles.note}>Esta ação não pode ser desfeita. Suas rotinas não serão alteradas.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Confirmar exclusão" accessibilityState={{ disabled: busy, busy }}
        disabled={busy} style={styles.command} onPress={() => void confirmDeletion(confirmation)}>
        <MaterialIcons name="delete-outline" size={24} color="#962D32" accessible={false} /><Text style={styles.deleteLabel}>Confirmar exclusão</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Manter registros" accessibilityState={{ disabled: busy }}
        disabled={busy} style={styles.command} onPress={() => { if (current() && !inFlight.current && intent.current === confirmation) cancel(); }}>
        <MaterialIcons name="close" size={24} color="#16634D" accessible={false} /><Text style={styles.commandLabel}>Manter registros</Text>
      </Pressable>
    </View>}
    {busy && <Text accessibilityLiveRegion="polite" style={styles.note}>Excluindo registros…</Text>}
    {feedback === 'deleted' && <Text accessibilityLiveRegion="polite" style={styles.note}>Exclusão concluída.</Text>}
    {feedback === 'error' && <>
      <Text accessibilityRole="alert" style={styles.error}>Não foi possível excluir. Atualize o histórico e confirme novamente.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Atualizar histórico" style={styles.command} onPress={() => {
        if (current() && !inFlight.current) { intent.current = null; setAttempt(value => value + 1); }
      }}><MaterialIcons name="refresh" size={24} color="#16634D" accessible={false} /><Text style={styles.commandLabel}>Atualizar histórico</Text></Pressable>
    </>}
    {status === 'loading' && <Text accessibilityLiveRegion="polite" style={styles.text}>Abrindo histórico…</Text>}
    {status === 'error' && <>
      <Text accessibilityRole="alert" style={styles.error}>{Platform.OS === 'web' ? 'Histórico indisponível nesta prévia web.' : 'Não foi possível abrir o histórico. Tente novamente.'}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Tentar abrir histórico novamente" style={styles.command} onPress={() => { if (current()) setAttempt(value => value + 1); }}>
        <MaterialIcons name="refresh" size={24} color="#16634D" accessible={false} /><Text style={styles.commandLabel}>Tentar novamente</Text>
      </Pressable>
    </>}
    {status === 'ready' && visible.length === 0 && <Text accessibilityLiveRegion="polite" style={styles.text}>{records.length === 0 ? 'Ainda não há registros salvos.' : 'Nenhum registro deste tipo.'}</Text>}
    {status === 'ready' && visible.map((record, index) => <View key={record.id} style={styles.record}>
      <Text accessibilityRole="header" style={styles.title}>{record.type === 'check-in' ? 'Check-in corporal e sensorial' : 'Rotina concluída'}</Text>
      <Text style={styles.note}>{new Date(record.savedAt).toLocaleString('pt-BR')}</Text>
      {record.type === 'routine' ? <>
        <Text style={styles.text}>{record.name}</Text><Text style={styles.note}>{`${record.steps} ${record.steps === 1 ? 'etapa' : 'etapas'}`}</Text>
      </> : checkInSummary(record.answers).map(item => <View key={item.id} accessible accessibilityLabel={`${item.question} ${item.answer}`} style={styles.answer}>
        <Text style={styles.text}>{item.question}</Text><Text style={styles.text}>{item.answer}</Text>
      </View>)}
      <Pressable accessibilityRole="button" accessibilityLabel={`Excluir registro ${index + 1}`}
        accessibilityHint={`${record.type === 'routine' ? record.name : 'Check-in corporal e sensorial'}, ${new Date(record.savedAt).toLocaleString('pt-BR')}`}
        accessibilityState={{ disabled: busy }} disabled={busy} style={styles.command} onPress={() => requestDeletion({ kind: 'record', id: record.id })}>
        <MaterialIcons name="delete-outline" size={24} color="#962D32" accessible={false} /><Text style={styles.deleteLabel}>Excluir registro</Text>
      </Pressable>
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
  deleteLabel: { fontSize: 18, color: '#962D32', fontWeight: '600', flexShrink: 1 },
  confirmation: { gap: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#72777D', paddingVertical: 16 },
});
