import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { openPreferencesDatabase } from './preferences-database';
import { emptySupportPreferences, hasSupportPreferences, supportFields, type SupportField, type SupportPreferences } from './support-preferences';

export function SupportPreferencesScreen({ onClose }: { onClose(): void }) {
  const [draft, setDraft] = useState({ ...emptySupportPreferences });
  const [saved, setSaved] = useState({ ...emptySupportPreferences });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const inFlight = useRef(false);
  const storage = useRef<Awaited<ReturnType<typeof openPreferencesDatabase>> | null>(null);
  const initialization = useRef<Promise<SupportPreferences> | null>(null);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        initialization.current ??= (async () => {
          storage.current ??= await openPreferencesDatabase();
          return storage.current.readSupport();
        })();
        const current = await initialization.current;
        if (active) { setDraft(current); setSaved(current); setLoadError(false); }
      } catch { if (active) setLoadError(true); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [attempt]);
  function edit(field: SupportField, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setMessage(null); setConfirmRemove(false);
  }
  async function save(remove = false) {
    if (inFlight.current || loading || loadError || !storage.current) return;
    inFlight.current = true; setBusy(true); setMessage(null);
    try {
      const current = await storage.current.saveSupport(remove ? { ...emptySupportPreferences } : draft);
      setDraft(current); setSaved(current); setConfirmRemove(false);
      setMessage(remove ? 'Sensibilidades e estratégias removidas.' : 'Sensibilidades e estratégias salvas.');
    } catch {
      setMessage('Não foi possível salvar. Seu preenchimento e as informações salvas foram mantidos. Tente novamente ou cancele.');
    } finally { inFlight.current = false; setBusy(false); }
  }
  const unavailable = loading || loadError || busy;
  return <SafeAreaView style={styles.screen}>
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Command icon="arrow-back" label="Cancelar e voltar" disabled={busy} onPress={onClose} />
        <Text accessibilityRole="header" style={styles.heading}>Sensibilidades e estratégias</Text>
        {loading && <Text accessibilityLiveRegion="polite" style={styles.text}>Abrindo informações…</Text>}
        {loadError && <>
          <Text accessibilityRole="alert" style={styles.error}>{Platform.OS === 'web' ? 'Armazenamento do perfil indisponível nesta prévia web.' : 'Não foi possível abrir as informações salvas.'}</Text>
          <Command icon="refresh" label="Tentar abrir informações novamente" disabled={loading} onPress={() => {
            initialization.current = null; setLoading(true); setAttempt((value) => value + 1);
          }} />
        </>}
        {!loading && !loadError && !hasSupportPreferences(saved) && <Text style={styles.text}>Ainda não há sensibilidades ou estratégias salvas.</Text>}
        {supportFields.map((field, index) => <View key={field.id} style={styles.field}>
          {(index === 0 || index === 5) && <Text accessibilityRole="header" style={styles.section}>{index === 0 ? 'Sensibilidades' : 'Estratégias de suporte'}</Text>}
          <Text style={styles.label}>{field.label}</Text>
          <TextInput accessibilityLabel={field.label} multiline value={draft[field.id]} editable={!unavailable}
            textAlignVertical="top" style={styles.input} onChangeText={(value) => edit(field.id, value)} />
        </View>)}
        {message && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.text}>{message}</Text>}
        {busy && <Text accessibilityLiveRegion="polite" style={styles.text}>Salvando informações…</Text>}
        <Command icon="save" label="Salvar sensibilidades e estratégias" primary disabled={unavailable} onPress={() => void save()} />
        {hasSupportPreferences(saved) && <Command icon="delete-outline" label="Remover sensibilidades e estratégias" disabled={unavailable} onPress={() => setConfirmRemove(true)} />}
        {confirmRemove && <View style={styles.confirmation}>
          <Text accessibilityRole="alert" style={styles.text}>Remover todas as sensibilidades e estratégias salvas? As preferências de comunicação serão mantidas.</Text>
          <Command icon="delete" label="Confirmar remoção das sensibilidades e estratégias" disabled={unavailable} onPress={() => void save(true)} />
          <Command icon="close" label="Manter informações" disabled={busy} onPress={() => setConfirmRemove(false)} />
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
  section: { fontSize: 22, color: '#202124', fontWeight: '600' },
  text: { fontSize: 18, color: '#202124', flexShrink: 1 },
  field: { gap: 8 }, label: { fontSize: 18, color: '#202124', fontWeight: '600' },
  input: { minHeight: 72, padding: 12, borderWidth: 1, borderColor: '#72777D', borderRadius: 4, fontSize: 20, color: '#202124' },
  error: { color: '#92322D', fontSize: 18 },
  command: { minHeight: 48, maxWidth: '100%', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  commandText: { color: '#16634D', fontWeight: '600' },
  primary: { backgroundColor: '#16634D', borderRadius: 4 }, primaryText: { color: '#FFFFFF' }, dimmed: { opacity: 0.65 },
  confirmation: { gap: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#72777D' },
});
