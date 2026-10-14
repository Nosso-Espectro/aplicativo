import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { openSupportPlanDatabase } from './support-plan-database';
import { normalizedSupportPlan, type SupportPlan } from './support-plan';
import { supportCardOrientations } from './support-card';
import { openPreferencesDatabase } from '../communication-profile/preferences-database';
import { type supportForPlan } from '../communication-profile/support-preferences';

export function SupportCardScreen({ onClose }: { onClose(): void }) {
  const [plan, setPlan] = useState<SupportPlan | null>(null);
  const [references, setReferences] = useState<ReturnType<typeof supportForPlan>>([]);
  const [loading, setLoading] = useState(true);
  const [planError, setPlanError] = useState(false);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [referenceError, setReferenceError] = useState(false);
  const planStorage = useRef<Promise<Awaited<ReturnType<typeof openSupportPlanDatabase>>> | null>(null);
  const profileStorage = useRef<Promise<Awaited<ReturnType<typeof openPreferencesDatabase>>> | null>(null);
  const generation = useRef({ plan: 0, references: 0 });

  const readReferences = useCallback(async (current: SupportPlan, version: number) => {
    const referenceVersion = ++generation.current.references;
    setReferences([]); setReferenceError(false);
    setReferenceLoading(current.profileFields.length > 0);
    if (!current.profileFields.length) return;
    try {
      profileStorage.current ??= openPreferencesDatabase().catch(error => { profileStorage.current = null; throw error; });
      const storage = await profileStorage.current;
      const values = await storage.readSupportForPlan(current.profileFields);
      if (generation.current.plan === version && generation.current.references === referenceVersion) setReferences(values);
    } catch {
      if (generation.current.plan === version && generation.current.references === referenceVersion) setReferenceError(true);
    } finally {
      if (generation.current.plan === version && generation.current.references === referenceVersion) setReferenceLoading(false);
    }
  }, []);
  const readPlan = useCallback(async () => {
    const version = ++generation.current.plan;
    ++generation.current.references;
    setPlan(null); setReferences([]); setLoading(true); setPlanError(false); setReferenceError(false); setReferenceLoading(false);
    try {
      planStorage.current ??= openSupportPlanDatabase().catch(error => { planStorage.current = null; throw error; });
      const storage = await planStorage.current;
      const current = normalizedSupportPlan(await storage.read());
      if (generation.current.plan !== version) return;
      setPlan(current); setLoading(false);
      await readReferences(current, version);
    } catch {
      if (generation.current.plan === version) { setPlanError(true); setLoading(false); }
    }
  }, [readReferences]);
  useEffect(() => {
    let active = true;
    const versions = generation.current;
    void Promise.resolve().then(() => { if (active) void readPlan(); });
    const listener = AppState.addEventListener('change', state => {
      if (state === 'active') void readPlan();
      else {
        ++versions.plan; ++versions.references;
        setPlan(null); setReferences([]); setLoading(true); setPlanError(false); setReferenceError(false); setReferenceLoading(false);
      }
    });
    return () => { active = false; ++versions.plan; ++versions.references; listener.remove(); };
  }, [readPlan]);
  const orientations = plan ? supportCardOrientations(plan) : [];
  return <Modal visible animationType="none" presentationStyle="fullScreen" onRequestClose={onClose}>
    <SafeAreaView style={styles.screen} accessibilityViewIsModal>
      <ScrollView contentContainerStyle={styles.content}>
        <Command icon="arrow-back" label="Fechar cartão e voltar ao painel" onPress={onClose} />
        <Text accessibilityRole="header" style={styles.heading}>Meu plano de apoio</Text>
        {loading && <Text accessibilityLiveRegion="polite" style={styles.status}>Abrindo cartão…</Text>}
        {planError && <>
          <Text accessibilityRole="alert" style={styles.status}>{Platform.OS === 'web' ? 'Armazenamento do plano indisponível nesta prévia web.' : 'Não foi possível abrir o plano salvo.'}</Text>
          <Command label="Tentar abrir cartão novamente" onPress={() => void readPlan()} />
        </>}
        {!loading && !planError && <>
          {orientations.map(entry => <Text key={entry.id} style={styles.value}>{entry.value}</Text>)}
          {referenceLoading && <Text accessibilityLiveRegion="polite" style={styles.status}>Abrindo informações escolhidas do perfil…</Text>}
          {referenceError && <>
            <Text accessibilityRole="alert" style={styles.status}>Não foi possível abrir as informações escolhidas do perfil. As orientações do plano foram mantidas.</Text>
            <Command label="Tentar abrir informações do perfil novamente" onPress={() => { if (plan) void readReferences(plan, generation.current.plan); }} />
          </>}
          {references.map(entry => <View key={entry.field} style={styles.entry}>
            <Text accessibilityRole="header" style={styles.label}>{entry.label}</Text>
            <Text style={styles.value}>{entry.value}</Text>
          </View>)}
          {!referenceLoading && !referenceError && !orientations.length && !references.length && <Text style={styles.value}>Nenhuma orientação preenchida para apresentar.</Text>}
        </>}
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}
function Command({ label, onPress, icon = 'refresh' }: { label: string; onPress(): void; icon?: 'arrow-back' | 'refresh' }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.command}>
    <MaterialIcons name={icon} size={24} color="#16634D" accessible={false} />
    <Text style={styles.commandLabel}>{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, gap: 24, width: '100%', maxWidth: 720, alignSelf: 'center' },
  heading: { fontSize: 26, fontWeight: '600', color: '#202124' },
  value: { fontSize: 24, lineHeight: 34, color: '#202124', flexShrink: 1 },
  label: { fontSize: 22, fontWeight: '600', color: '#202124', flexShrink: 1 },
  status: { fontSize: 18, color: '#202124', flexShrink: 1 },
  entry: { gap: 8 },
  command: { minHeight: 64, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  commandLabel: { fontSize: 18, color: '#16634D', flexShrink: 1 },
});
