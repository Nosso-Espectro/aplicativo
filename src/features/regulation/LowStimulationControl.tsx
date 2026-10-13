import { Pressable, StyleSheet, Switch, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLowStimulation } from './LowStimulationProvider';

export function LowStimulationControl() {
  const mode = useLowStimulation();
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 340 || fontScale >= 1.5;
  const disabled = mode.loading || mode.saving || mode.preference === null;
  const status = mode.loading ? 'Abrindo preferência…' : mode.saving ? 'Salvando preferência…'
    : mode.error === 'read' ? 'Não foi possível abrir a preferência.'
      : mode.error === 'save' ? 'Não foi possível salvar. A preferência salva foi mantida.' : null;
  return <SafeAreaView edges={['top']} style={styles.surface}>
    <View style={styles.content}>
      <View style={[styles.row, stacked && styles.stacked]}>
        <Text style={[styles.label, stacked && styles.stackedLabel]}>Baixa estimulação</Text>
        {mode.preference === null ? <View style={styles.switch} /> : <Switch accessibilityLabel="Modo de baixa estimulação" accessibilityRole="switch"
          accessibilityState={{ checked: mode.preference.enabled, disabled, busy: mode.loading || mode.saving }}
          value={mode.preference.enabled} disabled={disabled}
          onValueChange={(enabled) => void mode.setEnabled(enabled)}
          trackColor={{ false: '#72777D', true: '#16634D' }} thumbColor="#FFFFFF" ios_backgroundColor="#72777D"
          style={styles.switch} />}
      </View>
      {status && <Text accessibilityLiveRegion="polite" style={styles.status}>{status}</Text>}
      {mode.error && !mode.loading && !mode.saving && <Pressable accessibilityRole="button"
        accessibilityLabel={mode.error === 'read' ? 'Tentar abrir preferência novamente' : 'Tentar salvar preferência novamente'}
        onPress={mode.retry} style={styles.retry}>
        <MaterialIcons name="refresh" size={24} color="#16634D" accessible={false} />
        <Text style={styles.retryLabel}>Tentar novamente</Text>
      </Pressable>}
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  surface: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#72777D' },
  content: { paddingHorizontal: 20, paddingVertical: 4, maxWidth: 720, width: '100%', alignSelf: 'center' },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center', minHeight: 48 },
  stacked: { flexDirection: 'column', alignItems: 'flex-start' },
  stackedLabel: { flex: 0, alignSelf: 'stretch' },
  label: { color: '#202124', fontSize: 16, flex: 1 },
  switch: { minHeight: 48, minWidth: 48, flexShrink: 0 },
  status: { color: '#303438', fontSize: 16, paddingVertical: 4 },
  retry: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, paddingVertical: 8 },
  retryLabel: { color: '#16634D', fontSize: 16, flexShrink: 1 },
});
