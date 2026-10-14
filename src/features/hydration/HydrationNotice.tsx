import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useHydration } from './HydrationProvider';
export function HydrationNotice() {
  const { banner, controller } = useHydration(); if (!banner) return null;
  return <View style={styles.notice}>
    <Text accessibilityLiveRegion="polite" style={styles.text}>Uma pausa para água, se desejar.</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Fechar lembrete de água" onPress={() => controller?.dismissBanner()} style={styles.close}>
      <MaterialIcons name="close" size={24} color="#16634D" accessible={false} />
    </Pressable>
  </View>;
}
const styles = StyleSheet.create({
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#72777D', backgroundColor: '#F7F8FA' },
  text: { color: '#202124', fontSize: 18, flex: 1 }, close: { minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center' },
});
