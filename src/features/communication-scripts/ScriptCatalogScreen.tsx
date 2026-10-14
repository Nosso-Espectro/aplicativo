import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { initialScripts, scriptCategories, scriptsInCategory, type CommunicationScript, type ScriptCategoryId } from './script-catalog';
import { localClipboard } from './local-clipboard';

export function ScriptCatalogScreen({ onClose, scripts = initialScripts }: { onClose(): void; scripts?: readonly CommunicationScript[] }) {
  const [category, setCategory] = useState<ScriptCategoryId | 'all'>('all');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const ownerRef = useRef<{ active: boolean } | null>(null);
  const inFlight = useRef(false);
  useFocusEffect(useCallback(() => {
    const owner = { active: true }; ownerRef.current = owner; setMessage(null); setBusy(inFlight.current);
    return () => { owner.active = false; };
  }, []));
  async function copy(script: CommunicationScript) {
    const owner = ownerRef.current;
    if (!owner?.active || inFlight.current) return;
    inFlight.current = true; setBusy(true); setMessage(null);
    try {
      const copied = await localClipboard.copy(script.text);
      if (owner.active) setMessage({ text: copied ? 'Script copiado.' : 'Não foi possível copiar. Tente novamente.', error: !copied });
    } catch {
      if (owner.active) setMessage({ text: 'Não foi possível copiar. Tente novamente.', error: true });
    } finally {
      inFlight.current = false;
      if (ownerRef.current?.active) setBusy(false);
    }
  }
  const visible = scriptsInCategory(scripts, category);
  return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.content}>
    <Pressable accessibilityRole="button" accessibilityLabel="Voltar ao quadro" onPress={onClose} style={styles.command}>
      <MaterialIcons name="arrow-back" size={24} color="#16634D" accessible={false} />
      <Text style={styles.commandLabel}>Voltar ao quadro</Text>
    </Pressable>
    <Text accessibilityRole="header" style={styles.heading}>Scripts de comunicação</Text>
    <View style={styles.filters}>{[{ id: 'all' as const, label: 'Todos' }, ...scriptCategories].map(item => <Pressable key={item.id}
      accessibilityRole="button" accessibilityLabel={item.label} accessibilityState={{ selected: category === item.id, disabled: busy }}
      disabled={busy} onPress={() => { setCategory(item.id); setMessage(null); }}
      style={[styles.filter, category === item.id && styles.selected]}>
      <Text style={styles.commandLabel}>{item.label}</Text>
    </Pressable>)}</View>
    {busy && <Text accessibilityLiveRegion="polite" style={styles.text}>Copiando...</Text>}
    {message && <Text accessibilityRole={message.error ? 'alert' : undefined} accessibilityLiveRegion="polite"
      style={[styles.text, message.error && styles.error]}>{message.text}</Text>}
    {visible.length === 0 && <Text style={styles.text}>Nenhum script disponível nesta categoria.</Text>}
    {visible.map(script => <View key={script.id} style={styles.item}>
      <Text accessibilityRole="header" style={styles.label}>{scriptCategories.find(item => item.id === script.categoryId)?.label}</Text>
      <Text style={styles.text}>{script.text}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Copiar script: ${script.text}`}
        accessibilityState={{ disabled: busy }} disabled={busy} onPress={() => void copy(script)} style={styles.command}>
        <MaterialIcons name="content-copy" size={24} color="#16634D" accessible={false} />
        <Text style={styles.commandLabel}>Copiar</Text>
      </Pressable>
    </View>)}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, gap: 16, width: '100%', maxWidth: 720, alignSelf: 'center' },
  heading: { fontSize: 26, fontWeight: '600', color: '#202124' }, text: { fontSize: 18, color: '#202124', flexShrink: 1 },
  label: { fontSize: 20, fontWeight: '600', color: '#202124' }, error: { color: '#92322D' },
  command: { minHeight: 48, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  commandLabel: { fontSize: 18, color: '#16634D', flexShrink: 1, fontWeight: '600' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filter: { minHeight: 48, maxWidth: '100%', padding: 12, borderWidth: 1, borderColor: '#72777D', borderRadius: 4, justifyContent: 'center' },
  selected: { backgroundColor: '#EAF3EF', borderColor: '#16634D' },
  item: { paddingVertical: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: '#72777D' },
});
