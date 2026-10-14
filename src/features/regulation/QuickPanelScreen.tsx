import { type ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { panelDestinations, type PanelDestinationId } from './quick-panel';

const icons: Record<PanelDestinationId, ComponentProps<typeof MaterialIcons>['name']> = {
  communication: 'chat-bubble-outline', sounds: 'graphic-eq', timer: 'timer', contact: 'person-outline',
  'support-card': 'assignment',
};
export function QuickPanelScreen({ onOpen, onClose }: { onOpen(id: PanelDestinationId): void; onClose(): void }) {
  return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.content}>
    <Pressable accessibilityRole="button" accessibilityLabel="Voltar ao quadro" onPress={onClose} style={styles.back}>
      <MaterialIcons name="arrow-back" size={24} color="#16634D" accessible={false} />
      <Text style={styles.label}>Voltar ao quadro</Text>
    </Pressable>
    <Text accessibilityRole="header" style={styles.heading}>Painel de regulação</Text>
    {panelDestinations.map(destination => <Pressable key={destination.id} accessibilityRole="button"
      accessibilityLabel={destination.label} onPress={() => onOpen(destination.id)} style={styles.destination}>
      <MaterialIcons name={icons[destination.id]} size={28} color="#16634D" accessible={false} />
      <Text style={styles.label}>{destination.label}</Text>
    </Pressable>)}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, gap: 16, width: '100%', maxWidth: 720, alignSelf: 'center' },
  heading: { fontSize: 26, fontWeight: '600', color: '#202124' },
  back: { minHeight: 64, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  destination: { minHeight: 64, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16, borderBottomWidth: 1, borderBottomColor: '#72777D' },
  label: { fontSize: 18, color: '#16634D', flexShrink: 1 },
});
