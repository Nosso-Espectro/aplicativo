import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { openPreferencesDatabase } from './preferences-database';
import { summaryFields, type SummaryField } from './profile-summary';

type Storage = Awaited<ReturnType<typeof openPreferencesDatabase>>;
const readSelection = (storage: Storage) => storage.readSummarySelection();
const readSummary = (storage: Storage) => storage.readProfileSummary();

function useProfileRead<T>(read: (storage: Storage) => Promise<T>) {
  const [value, setValue] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const storage = useRef<Storage | null>(null);
  const initialization = useRef<Promise<T> | null>(null);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        initialization.current ??= (async () => {
          storage.current ??= await openPreferencesDatabase();
          return read(storage.current);
        })();
        const current = await initialization.current;
        if (active) { setValue(current); setError(false); }
      } catch { if (active) { setValue(null); setError(true); } }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [attempt, read]);
  function retry() {
    initialization.current = null; setValue(null); setError(false); setLoading(true); setAttempt((current) => current + 1);
  }
  return { value, loading, error, retry, storage };
}

export function SummarySelectionScreen({ onClose, onPresent }: { onClose(): void; onPresent(): void }) {
  const { value, loading, error, retry, storage } = useProfileRead(readSelection);
  const [edited, setDraft] = useState<SummaryField[] | null>(null);
  const [confirmed, setSaved] = useState<SummaryField[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const inFlight = useRef(false);
  const saved = confirmed ?? value ?? [];
  const draft = edited ?? saved;
  const unavailable = loading || error || busy;
  const changed = summaryFields.some(({ id }) => draft.includes(id) !== saved.includes(id));
  async function save() {
    if (inFlight.current || unavailable || !storage.current) return;
    inFlight.current = true; setBusy(true); setMessage(null);
    try {
      const current = await storage.current.saveSummarySelection(draft);
      setDraft(current); setSaved(current); setMessage('Seleção salva.');
    } catch {
      setMessage('Não foi possível salvar. Sua seleção e a versão salva foram mantidas. Tente novamente ou cancele.');
    } finally { inFlight.current = false; setBusy(false); }
  }
  return <SafeAreaView style={styles.screen}>
    <ScrollView contentContainerStyle={styles.content}>
      <Command icon="arrow-back" label="Cancelar e voltar" disabled={busy} onPress={onClose} />
      <Text accessibilityRole="header" style={styles.heading}>Informações do resumo</Text>
      <ReadStatus loading={loading} error={error} retry={retry} />
      {!loading && !error && saved.length === 0 && <Text style={styles.text}>Nenhuma informação selecionada.</Text>}
      {summaryFields.map(({ id, label }) => <Pressable key={id} accessibilityRole="checkbox" accessibilityLabel={label}
        accessibilityState={{ checked: draft.includes(id), disabled: unavailable }} disabled={unavailable}
        onPress={() => { setDraft(draft.includes(id) ? draft.filter((field) => field !== id) : [...draft, id]); setMessage(null); }}
        style={({ pressed }) => [styles.command, (pressed || unavailable) && styles.dimmed]}>
        <MaterialIcons name={draft.includes(id) ? 'check-box' : 'check-box-outline-blank'} size={28} color="#16634D" accessible={false} />
        <Text style={styles.text}>{label}</Text>
      </Pressable>)}
      {changed && <Text accessibilityLiveRegion="polite" style={styles.text}>Seleção não salva.</Text>}
      {message && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.text}>{message}</Text>}
      {busy && <Text accessibilityLiveRegion="polite" style={styles.text}>Salvando seleção…</Text>}
      <Command icon="save" label="Salvar seleção" primary disabled={unavailable} onPress={() => void save()} />
      <Command icon="visibility" label="Apresentar resumo" disabled={unavailable || changed} onPress={onPresent} />
    </ScrollView>
  </SafeAreaView>;
}

export function ProfileSummaryScreen({ onClose }: { onClose(): void }) {
  const { value, loading, error, retry } = useProfileRead(readSummary);
  return <SafeAreaView style={styles.screen}>
    <ScrollView contentContainerStyle={styles.content}>
      <Command icon="arrow-back" label="Fechar resumo" onPress={onClose} />
      <Text accessibilityRole="header" style={styles.heading}>Meu perfil de comunicação</Text>
      <ReadStatus loading={loading} error={error} retry={retry} />
      {!loading && !error && value?.length === 0 && <Text style={styles.text}>Nenhuma informação selecionada e preenchida para apresentar.</Text>}
      {!loading && !error && value?.map((entry) => <View key={entry.field} style={styles.entry}>
        <Text accessibilityRole="header" style={styles.label}>{entry.label}</Text>
        <Text style={styles.value}>{entry.value}</Text>
      </View>)}
    </ScrollView>
  </SafeAreaView>;
}

function ReadStatus({ loading, error, retry }: { loading: boolean; error: boolean; retry(): void }) {
  return <>
    {loading && <Text accessibilityLiveRegion="polite" style={styles.text}>Abrindo resumo…</Text>}
    {error && <>
      <Text accessibilityRole="alert" style={styles.error}>{Platform.OS === 'web' ? 'Armazenamento do perfil indisponível nesta prévia web.' : 'Não foi possível abrir o resumo.'}</Text>
      <Command icon="refresh" label="Tentar abrir resumo novamente" disabled={loading} onPress={retry} />
    </>}
  </>;
}
function Command({ icon, label, onPress, disabled = false, primary = false }: {
  icon: ComponentProps<typeof MaterialIcons>['name']; label: string; onPress(): void; disabled?: boolean; primary?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.command, primary && styles.primary, (pressed || disabled) && styles.dimmed]}>
    <MaterialIcons name={icon} size={24} color={primary ? '#FFFFFF' : '#16634D'} accessible={false} />
    <Text style={[styles.text, styles.commandText, primary && styles.primaryText]}>{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, gap: 16, width: '100%', maxWidth: 720, alignSelf: 'center' },
  heading: { fontSize: 26, color: '#202124', fontWeight: '600' },
  text: { fontSize: 18, color: '#202124', flexShrink: 1 },
  entry: { gap: 8, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#72777D' },
  label: { fontSize: 20, color: '#202124', fontWeight: '600' },
  value: { fontSize: 24, lineHeight: 34, color: '#202124' },
  error: { color: '#92322D', fontSize: 18 },
  command: { minHeight: 48, maxWidth: '100%', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  commandText: { color: '#16634D', fontWeight: '600' },
  primary: { backgroundColor: '#16634D', borderRadius: 4 }, primaryText: { color: '#FFFFFF' }, dimmed: { opacity: 0.65 },
});
