import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { openPreferencesDatabase } from '../communication-profile/preferences-database';
import { supportFields, type SupportField, type supportForPlan } from '../communication-profile/support-preferences';
import { openSupportPlanDatabase } from './support-plan-database';
import { emptySupportPlan, hasSupportPlan, normalizedSupportPlan, suggestedOrientations, type SupportPlan } from './support-plan';

type ProfileRead = { fields: SupportField[]; values: ReturnType<typeof supportForPlan>; error: boolean };
export function SupportPlanScreen({ onClose }: { onClose(): void }) {
  const [draft, setDraft] = useState(() => normalizedSupportPlan(emptySupportPlan));
  const [saved, setSaved] = useState(() => normalizedSupportPlan(emptySupportPlan));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [profileAttempt, setProfileAttempt] = useState(0);
  const [profileRead, setProfileRead] = useState<ProfileRead | null>(null);
  const inFlight = useRef(false);
  const storage = useRef<Awaited<ReturnType<typeof openSupportPlanDatabase>> | null>(null);
  const profile = useRef<Awaited<ReturnType<typeof openPreferencesDatabase>> | null>(null);
  const profileInitialization = useRef<Promise<Awaited<ReturnType<typeof openPreferencesDatabase>>> | null>(null);
  const initialization = useRef<Promise<SupportPlan> | null>(null);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        initialization.current ??= (async () => {
          storage.current ??= await openSupportPlanDatabase();
          return storage.current.read();
        })();
        const current = await initialization.current;
        if (active) { setDraft(current); setSaved(current); setLoadError(false); }
      } catch { if (active) setLoadError(true); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [attempt]);
  useEffect(() => {
    const fields = draft.profileFields;
    if (!fields.length) return;
    let active = true;
    void (async () => {
      try {
        profileInitialization.current ??= (async () => {
          profile.current ??= await openPreferencesDatabase(); return profile.current;
        })();
        const current = await profileInitialization.current;
        const values = await current.readSupportForPlan(fields);
        if (active) setProfileRead({ fields, values, error: false });
      } catch {
        if (!profile.current) profileInitialization.current = null;
        if (active) setProfileRead({ fields, values: [], error: true });
      }
    })();
    return () => { active = false; };
  }, [draft.profileFields, profileAttempt]);
  function edit(update: Partial<SupportPlan>) {
    setDraft((current) => ({ ...current, ...update })); setMessage(null); setConfirmRemove(false);
  }
  async function save(remove = false) {
    if (inFlight.current || loading || loadError || !storage.current) return;
    inFlight.current = true; setBusy(true); setMessage(null);
    try {
      const current = await storage.current.save(remove ? normalizedSupportPlan(emptySupportPlan) : draft);
      setDraft(current); setSaved(current); setConfirmRemove(false); setMessage(remove ? 'Plano removido.' : 'Plano salvo.');
    } catch { setMessage('Não foi possível salvar. Seu preenchimento e o plano salvo foram mantidos. Tente novamente ou cancele.'); }
    finally { inFlight.current = false; setBusy(false); }
  }
  const unavailable = loading || loadError || busy;
  const currentProfile = profileRead?.fields === draft.profileFields ? profileRead : null;
  return <SafeAreaView style={styles.screen}>
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Command icon="arrow-back" label="Cancelar e voltar" disabled={busy} onPress={onClose} />
        <Text accessibilityRole="header" style={styles.heading}>Plano de Apoio</Text>
        {loading && <Text accessibilityLiveRegion="polite" style={styles.text}>Abrindo plano…</Text>}
        {loadError && <>
          <Text accessibilityRole="alert" style={styles.error}>{Platform.OS === 'web' ? 'Armazenamento do plano indisponível nesta prévia web.' : 'Não foi possível abrir o plano salvo.'}</Text>
          <Command icon="refresh" label="Tentar abrir plano novamente" disabled={loading} onPress={() => {
            initialization.current = null; setLoading(true); setAttempt((value) => value + 1);
          }} />
        </>}
        {!loading && !loadError && !hasSupportPlan(saved) && <Text style={styles.text}>Ainda não há orientações salvas.</Text>}
        <View style={styles.field}>
          <Text style={styles.label}>Minhas orientações</Text>
          <TextInput accessibilityLabel="Minhas orientações" multiline value={draft.instructions} editable={!unavailable}
            textAlignVertical="top" style={styles.input} onChangeText={(instructions) => edit({ instructions })} />
        </View>
        <Text accessibilityRole="header" style={styles.section}>Orientações sugeridas</Text>
        {suggestedOrientations.map(({ id, label }) => <Checkbox key={id} label={label} disabled={unavailable} checked={draft.suggestions.includes(id)}
          onPress={() => edit({ suggestions: draft.suggestions.includes(id) ? draft.suggestions.filter((item) => item !== id) : [...draft.suggestions, id] })} />)}
        <Text accessibilityRole="header" style={styles.section}>Informações do perfil</Text>
        {supportFields.map(({ id, label }) => <Checkbox key={id} label={`Incluir ${label} do perfil`} disabled={unavailable} checked={draft.profileFields.includes(id)}
          onPress={() => edit({ profileFields: draft.profileFields.includes(id) ? draft.profileFields.filter((item) => item !== id) : [...draft.profileFields, id] })} />)}
        {!unavailable && draft.profileFields.length > 0 && <>
          {!currentProfile && <Text accessibilityLiveRegion="polite" style={styles.text}>Abrindo informações escolhidas…</Text>}
          {currentProfile?.error && <>
            <Text accessibilityRole="alert" style={styles.error}>Não foi possível abrir as informações do perfil. O plano foi mantido.</Text>
            <Command icon="refresh" label="Tentar abrir informações do perfil novamente" onPress={() => { setProfileRead(null); setProfileAttempt((value) => value + 1); }} />
          </>}
          {currentProfile && !currentProfile.error && !currentProfile.values.length && <Text style={styles.text}>Ainda não há informações preenchidas nos campos escolhidos.</Text>}
          {currentProfile?.values.map((entry) => <View key={entry.field} style={styles.field}>
            <Text accessibilityRole="header" style={styles.label}>{entry.label}</Text><Text style={styles.text}>{entry.value}</Text>
          </View>)}
        </>}
        {message && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.text}>{message}</Text>}
        {busy && <Text accessibilityLiveRegion="polite" style={styles.text}>Salvando plano…</Text>}
        <Command icon="save" label="Salvar plano" primary disabled={unavailable} onPress={() => void save()} />
        {hasSupportPlan(saved) && <Command icon="delete-outline" label="Remover plano" disabled={unavailable} onPress={() => setConfirmRemove(true)} />}
        {confirmRemove && <View style={styles.confirmation}>
          <Text accessibilityRole="alert" style={styles.text}>Remover todas as orientações e escolhas deste plano? As informações do perfil serão mantidas.</Text>
          <Command icon="delete" label="Confirmar remoção do plano" disabled={unavailable} onPress={() => void save(true)} />
          <Command icon="close" label="Manter plano" disabled={busy} onPress={() => setConfirmRemove(false)} />
        </View>}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
function Checkbox({ label, checked, disabled, onPress }: { label: string; checked: boolean; disabled: boolean; onPress(): void }) {
  return <Pressable accessibilityRole="checkbox" accessibilityLabel={label} accessibilityState={{ checked, disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.command, (pressed || disabled) && styles.dimmed]}>
    <MaterialIcons name={checked ? 'check-box' : 'check-box-outline-blank'} size={28} color="#16634D" accessible={false} />
    <Text style={styles.text}>{label}</Text>
  </Pressable>;
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
  heading: { fontSize: 26, color: '#202124', fontWeight: '600' }, section: { fontSize: 22, color: '#202124', fontWeight: '600' },
  text: { fontSize: 18, color: '#202124', flexShrink: 1 },
  field: { gap: 8 }, label: { fontSize: 18, color: '#202124', fontWeight: '600' },
  input: { minHeight: 96, padding: 12, borderWidth: 1, borderColor: '#72777D', borderRadius: 4, fontSize: 20, color: '#202124' },
  error: { color: '#92322D', fontSize: 18 },
  command: { minHeight: 48, maxWidth: '100%', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  commandText: { color: '#16634D', fontWeight: '600' },
  primary: { backgroundColor: '#16634D', borderRadius: 4 }, primaryText: { color: '#FFFFFF' }, dimmed: { opacity: 0.65 },
  confirmation: { gap: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#72777D' },
});
