import type { ComponentProps, ReactNode } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScripts } from './ScriptProvider';
export function ScriptCommand({ label, icon, disabled = false, onPress }: {
  label: string; icon: ComponentProps<typeof MaterialIcons>['name']; disabled?: boolean; onPress(): void;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled}
    onPress={onPress} style={({ pressed }) => [scriptStyles.command, pressed && scriptStyles.pressed]}>
    <MaterialIcons name={icon} size={24} color="#16634D" accessible={false} />
    <Text style={scriptStyles.commandLabel}>{label}</Text>
  </Pressable>;
}
export function ScriptPage({ children }: { children: ReactNode }) {
  return <SafeAreaView style={scriptStyles.screen}><KeyboardAvoidingView style={scriptStyles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={scriptStyles.content}>{children}</ScrollView>
  </KeyboardAvoidingView></SafeAreaView>;
}
export function ScriptStorageStatus() {
  const context = useScripts();
  return <>{context.loading && <Text accessibilityLiveRegion="polite" style={scriptStyles.text}>Abrindo scripts pessoais...</Text>}
    {context.error && <><Text accessibilityRole="alert" style={scriptStyles.error}>{context.error}</Text>
      <ScriptCommand icon="refresh" label="Tentar abrir scripts pessoais novamente" disabled={context.loading || context.busy} onPress={context.retry} /></>}</>;
}
export const scriptStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, gap: 16, width: '100%', maxWidth: 720, alignSelf: 'center' },
  heading: { fontSize: 26, fontWeight: '600', color: '#202124' }, text: { fontSize: 18, color: '#202124', flexShrink: 1 },
  label: { fontSize: 20, fontWeight: '600', color: '#202124' }, error: { fontSize: 18, color: '#92322D' },
  command: { minHeight: 48, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  commandLabel: { fontSize: 18, color: '#16634D', flexShrink: 1, fontWeight: '600' }, pressed: { backgroundColor: '#EDF0F2' },
  input: { minHeight: 120, borderWidth: 1, borderColor: '#72777D', borderRadius: 4, padding: 12, fontSize: 20, color: '#202124' },
  categories: { gap: 8 }, option: { minHeight: 48, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  confirmation: { gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#72777D' },
});
