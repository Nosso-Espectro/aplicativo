import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useProgressAlerts } from './ProgressAlertsProvider';

export function ProgressAlertNotice() {
  const alerts = useProgressAlerts();
  if (!alerts?.visualMark) return null;
  return <View style={styles.notice}>
    <Text accessibilityLiveRegion="polite" style={styles.text}>Faltam {alerts.visualMark} minutos.</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Fechar aviso do timer" onPress={alerts.clearVisual} style={styles.close}>
      <MaterialIcons name="close" size={24} color="#16634D" accessible={false} />
    </Pressable>
  </View>;
}
const styles = StyleSheet.create({
  notice: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#72777D', backgroundColor: '#F7F8FA' },
  text: { color: '#202124', fontSize: 18, flexShrink: 1 }, close: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});
