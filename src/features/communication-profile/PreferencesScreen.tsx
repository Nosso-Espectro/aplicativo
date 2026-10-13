import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { emptyPreferences, hasPreferences, type CommunicationPreferences } from './preferences';
import { openPreferencesDatabase } from './preferences-database';

export function PreferencesScreen({ onClose }: { onClose(): void }) {
  const [draft, setDraft] = useState({ ...emptyPreferences });
  const [saved, setSaved] = useState({ ...emptyPreferences });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const inFlight = useRef(false);
  const storage = useRef<Awaited<ReturnType<typeof openPreferencesDatabase>> | null>(null);
  const initialization = useRef<Promise<CommunicationPreferences> | null>(null);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        initialization.current ??= (async () => {
          storage.current ??= await openPreferencesDatabase();
          return storage.current.read();
        })();
        const current = await initialization.current;
        if (active) { setDraft(current); setSaved(current); setLoadError(false); }
      } catch { if (active) setLoadError(true); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [attempt]);
  function edit(change: Partial<CommunicationPreferences>) {
    setDraft((value) => ({ ...value, ...change })); setMessage(null); setConfirmRemove(false);
  }
  async function save(remove = false) {
    if (inFlight.current || loading || loadError || !storage.current) return;
    inFlight.current = true; setBusy(true); setMessage(null);
    try {
      const current = await storage.current.save(remove ? { ...emptyPreferences } : draft);
      setDraft(current); setSaved(current); setConfirmRemove(false);
      setMessage(remove ? 'Preferências removidas.' : 'Preferências salvas.');
    } catch { setMessage('Não foi possível salvar as preferências. Seu preenchimento e a versão salva foram mantidos. Tente novamente ou cancele.'); }
    finally { inFlight.current = false; setBusy(false); }
  }
  const unavailable = loading || loadError || busy;
  return <SafeAreaView style={styles.screen}>
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Command icon="arrow-back" label="Cancelar e voltar" disabled={busy} onPress={onClose} />
        <Text accessibilityRole="header" style={styles.heading}>Perfil de comunicação</Text>
        {loading && <Text accessibilityLiveRegion="polite" style={styles.text}>Abrindo preferências…</Text>}
        {loadError && <>
          <Text accessibilityRole="alert" style={styles.error}>{Platform.OS === 'web' ? 'Armazenamento do perfil indisponível nesta prévia web.' : 'Não foi possível abrir as preferências salvas.'}</Text>
          <Command icon="refresh" label="Tentar abrir preferências novamente" disabled={loading} onPress={() => { initialization.current = null; setLoading(true); setAttempt((value) => value + 1); }} />
        </>}
        {!loading && !loadError && !hasPreferences(saved) && <Text style={styles.text}>Ainda não há preferências salvas.</Text>}
        <Text style={styles.label}>Formas preferidas de comunicação</Text>
        <TextInput accessibilityLabel="Formas preferidas de comunicação" multiline value={draft.communication} editable={!unavailable}
          style={styles.input} onChangeText={(communication) => edit({ communication })} />
        <Text style={styles.label}>Como prefiro receber informações</Text>
        <TextInput accessibilityLabel="Como prefiro receber informações" multiline value={draft.instructions} editable={!unavailable}
          style={styles.input} onChangeText={(instructions) => edit({ instructions })} />
        <Text style={styles.label}>Tempo adicional para responder</Text>
        <View accessibilityRole="radiogroup" style={styles.row}>
          {[{ value: null, label: 'Não informado' }, { value: true, label: 'Preciso de tempo adicional' }, { value: false, label: 'Não preciso de tempo adicional' }].map((option) =>
            <Pressable key={option.label} accessibilityRole="radio" accessibilityLabel={option.label} disabled={unavailable}
              accessibilityState={{ checked: draft.extraTime === option.value, disabled: unavailable }} onPress={() => edit({ extraTime: option.value })}
              style={[styles.option, draft.extraTime === option.value && styles.selected]}>
              <MaterialIcons name={draft.extraTime === option.value ? 'radio-button-checked' : 'radio-button-unchecked'} size={24} color="#16634D" accessible={false} />
              <Text style={styles.text}>{option.label}</Text>
            </Pressable>)}
        </View>
        {message && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.text}>{message}</Text>}
        {busy && <Text accessibilityLiveRegion="polite" style={styles.text}>Salvando preferências…</Text>}
        <Command icon="save" label="Salvar preferências" primary disabled={unavailable} onPress={() => void save()} />
        {hasPreferences(saved) && <Command icon="delete-outline" label="Remover preferências" disabled={unavailable} onPress={() => setConfirmRemove(true)} />}
        {confirmRemove && <View style={styles.confirmation}>
          <Text accessibilityRole="alert" style={styles.text}>Remover todas as preferências de comunicação salvas?</Text>
          <Command icon="delete" label="Confirmar remoção das preferências" disabled={unavailable} onPress={() => void save(true)} />
          <Command icon="close" label="Manter preferências" disabled={busy} onPress={() => setConfirmRemove(false)} />
        </View>}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
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
  label: { fontSize: 18, color: '#202124', fontWeight: '600' },
  input: { minHeight: 56, padding: 12, borderWidth: 1, borderColor: '#72777D', borderRadius: 4, fontSize: 20, color: '#202124' },
  error: { color: '#92322D', fontSize: 18 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { minHeight: 48, maxWidth: '100%', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 3, borderColor: '#A0A4A8' },
  selected: { borderColor: '#16634D', backgroundColor: '#EEF6F2' },
  command: { minHeight: 48, maxWidth: '100%', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  commandText: { color: '#16634D', fontWeight: '600' },
  primary: { backgroundColor: '#16634D', borderRadius: 4 }, primaryText: { color: '#FFFFFF' },
  dimmed: { opacity: 0.65 }, confirmation: { gap: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#72777D' },
});
