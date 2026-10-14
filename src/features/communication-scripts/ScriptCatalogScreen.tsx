import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { initialScripts, type CommunicationScript } from './script-catalog';
import { personalScriptCategories, scriptFavorite, type PersonalCategoryId, type ScriptReference } from './personal-script-model';
import { useScripts } from './ScriptProvider';
import { ScriptStorageStatus } from './ScriptUI';
import { useScriptCopy } from './useScriptCopy';

export function ScriptCatalogScreen({ onClose, scripts = initialScripts, onNew, onOpen }: {
  onClose(): void; scripts?: readonly CommunicationScript[]; onNew?(): void; onOpen?(ref: ScriptReference): void;
}) {
  const context = useScripts(); const clipboard = useScriptCopy();
  const [category, setCategory] = useState<PersonalCategoryId | 'all'>('all'); const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null); const active = useRef(false);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const items = [...scripts.map(script => ({ ...script, ref: { source: 'initial', id: script.id } as ScriptReference })),
    ...context.personal.map(script => ({ ...script, ref: { source: 'personal', id: script.id, revision: script.revision } as ScriptReference }))];
  const visible = items.filter(script => (category === 'all' || script.categoryId === category)
    && (!onlyFavorites || scriptFavorite(context, script.ref.source, script.id)?.selected));
  const unavailable = context.loading || context.busy || Boolean(context.error);
  async function favorite(ref: ScriptReference, selected: boolean) {
    setFavoriteError(null);
    try { await context.favorite(ref, selected); }
    catch { if (active.current) setFavoriteError('Não foi possível alterar o favorito. A versão salva foi mantida. Tente novamente.'); }
  }
  const { busy, message } = clipboard;
  return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.content}>
    <Pressable accessibilityRole="button" accessibilityLabel="Voltar ao quadro" onPress={onClose} style={styles.command}>
      <MaterialIcons name="arrow-back" size={24} color="#16634D" accessible={false} />
      <Text style={styles.commandLabel}>Voltar ao quadro</Text>
    </Pressable>
    <Text accessibilityRole="header" style={styles.heading}>Scripts de comunicação</Text>
    <ScriptStorageStatus />
    {onNew && <Pressable accessibilityRole="button" accessibilityLabel="Novo script" accessibilityState={{ disabled: unavailable }}
      disabled={unavailable} onPress={onNew} style={styles.command}><MaterialIcons name="add" size={24} color="#16634D" accessible={false} />
      <Text style={styles.commandLabel}>Novo script</Text></Pressable>}
    <Pressable accessibilityRole="checkbox" accessibilityLabel="Somente favoritos" accessibilityState={{ checked: onlyFavorites, disabled: unavailable }}
      disabled={unavailable} onPress={() => setOnlyFavorites(value => !value)} style={styles.command}>
      <MaterialIcons name={onlyFavorites ? 'star' : 'star-border'} size={24} color="#16634D" accessible={false} />
      <Text style={styles.commandLabel}>Somente favoritos</Text>
    </Pressable>
    <View style={styles.filters}>{[{ id: 'all' as const, label: 'Todos' }, ...personalScriptCategories].map(item => <Pressable key={item.id}
      accessibilityRole="button" accessibilityLabel={item.label} accessibilityState={{ selected: category === item.id, disabled: busy }}
      disabled={busy} onPress={() => { setCategory(item.id); clipboard.clear(); }}
      style={[styles.filter, category === item.id && styles.selected]}>
      <Text style={styles.commandLabel}>{item.label}</Text>
    </Pressable>)}</View>
    {busy && <Text accessibilityLiveRegion="polite" style={styles.text}>Copiando...</Text>}
    {message && <Text accessibilityRole={message.error ? 'alert' : undefined} accessibilityLiveRegion="polite"
      style={[styles.text, message.error && styles.error]}>{message.text}</Text>}
    {favoriteError && <Text accessibilityRole="alert" style={styles.error}>{favoriteError}</Text>}
    {visible.length === 0 && !context.loading && !context.error && <Text style={styles.text}>Nenhum script disponível nesta categoria.</Text>}
    {visible.map(script => <View key={`${script.ref.source}:${script.id}`} style={styles.item}>
      <Text accessibilityRole="header" style={styles.label}>{personalScriptCategories.find(item => item.id === script.categoryId)?.label}</Text>
      <Text style={styles.text}>{script.text}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Copiar script: ${script.text}`}
        accessibilityState={{ disabled: busy }} disabled={busy} onPress={() => void clipboard.copy(script.text)} style={styles.command}>
        <MaterialIcons name="content-copy" size={24} color="#16634D" accessible={false} />
        <Text style={styles.commandLabel}>Copiar</Text>
      </Pressable>
      <Pressable accessibilityRole="checkbox" accessibilityLabel={`Favorito: ${script.text}`}
        accessibilityState={{ checked: scriptFavorite(context, script.ref.source, script.id)?.selected ?? false, disabled: unavailable }}
        disabled={unavailable} onPress={() => void favorite(script.ref, !(scriptFavorite(context, script.ref.source, script.id)?.selected ?? false))} style={styles.command}>
        <MaterialIcons name={scriptFavorite(context, script.ref.source, script.id)?.selected ? 'star' : 'star-border'} size={24} color="#16634D" accessible={false} />
        <Text style={styles.commandLabel}>Favorito</Text>
      </Pressable>
      {onOpen && <Pressable accessibilityRole="button" accessibilityLabel={`Abrir script: ${script.text}`}
        onPress={() => onOpen(script.ref)} style={styles.command}>
        <MaterialIcons name="forum" size={24} color="#16634D" accessible={false} /><Text style={styles.commandLabel}>Abrir script</Text>
      </Pressable>}
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
