import type { ComponentProps, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export function TaskPage({ children }: { children: ReactNode }) {
  return <SafeAreaView style={taskStyles.screen}>
    <KeyboardAvoidingView style={taskStyles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={taskStyles.content}>{children}</ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
export function TaskCommand({ icon, label, onPress, disabled = false, primary = false }: {
  icon: ComponentProps<typeof MaterialIcons>['name']; label: string; onPress(): void; disabled?: boolean; primary?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }}
    disabled={disabled} onPress={onPress}
    style={({ pressed }) => [taskStyles.command, primary && taskStyles.primary, (pressed || disabled) && taskStyles.dimmed]}>
    <MaterialIcons name={icon} size={24} color={primary ? '#FFFFFF' : '#16634D'} accessible={false} />
    <Text style={[taskStyles.text, taskStyles.commandText, primary && taskStyles.primaryText]}>{label}</Text>
  </Pressable>;
}
export const taskStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, gap: 16, width: '100%', maxWidth: 720, alignSelf: 'center' },
  heading: { fontSize: 26, fontWeight: '600', color: '#202124' },
  text: { fontSize: 18, color: '#202124', flexShrink: 1 },
  label: { fontSize: 18, fontWeight: '600', color: '#202124' },
  error: { fontSize: 18, color: '#92322D' },
  input: { minHeight: 56, borderWidth: 1, borderColor: '#72777D', borderRadius: 4, padding: 12, fontSize: 20, color: '#202124' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  command: { minHeight: 48, maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  commandText: { color: '#16634D', fontWeight: '600' },
  primary: { backgroundColor: '#16634D', borderRadius: 4 },
  primaryText: { color: '#FFFFFF' },
  dimmed: { opacity: 0.65 },
  step: { padding: 16, gap: 12, borderWidth: 1, borderColor: '#72777D', borderRadius: 8, backgroundColor: '#F7F8FA' },
  confirmation: { gap: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#72777D' },
});
