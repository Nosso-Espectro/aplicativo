import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { personalScriptCategories, type SavedPersonalScript, type ScriptDraft } from './personal-script-model';
import { useScripts } from './ScriptProvider';
import { ScriptCommand, ScriptPage, ScriptStorageStatus, scriptStyles as styles } from './ScriptUI';
export function ScriptEditor({ script, initial, onClose, onSaved }: {
  script?: SavedPersonalScript; initial?: ScriptDraft; onClose(): void; onSaved(script: SavedPersonalScript): void;
}) {
  const context = useScripts();
  const [draft, setDraft] = useState<ScriptDraft>(() => ({ text: script?.text ?? initial?.text ?? '', categoryId: script?.categoryId ?? initial?.categoryId ?? 'other' }));
  const [expected] = useState(script ? { id: script.id, revision: script.revision } : null);
  const [error, setError] = useState<string | null>(null); const [saving, setSaving] = useState(false);
  const input = useRef<TextInput>(null); const inFlight = useRef(false); const active = useRef(false);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const unavailable = context.loading || context.busy || Boolean(context.error) || saving;
  async function save() {
    if (unavailable || inFlight.current) return;
    if (!draft.text.trim()) { setError('Informe o texto do script.'); input.current?.focus(); return; }
    inFlight.current = true; setSaving(true); setError(null);
    try { const saved = await context.save({ ...draft }, expected); if (saved && active.current) onSaved(saved); }
    catch { if (active.current) setError('Não foi possível salvar. Seu preenchimento foi mantido. Tente novamente ou cancele.'); }
    finally { inFlight.current = false; if (active.current) setSaving(false); }
  }
  return <ScriptPage>
    <ScriptCommand label="Cancelar" icon="arrow-back" disabled={saving} onPress={onClose} />
    <Text accessibilityRole="header" style={styles.heading}>{script ? 'Editar script' : initial ? 'Criar cópia do script' : 'Novo script'}</Text>
    <ScriptStorageStatus />
    <Text style={styles.label}>Texto do script</Text>
    <TextInput ref={input} accessibilityLabel="Texto do script" value={draft.text} multiline editable={!unavailable}
      style={styles.input} textAlignVertical="top" autoComplete="off" onChangeText={text => { setDraft(value => ({ ...value, text })); setError(null); }} />
    <Text accessibilityRole="header" style={styles.label}>Categoria</Text>
    <View style={styles.categories}>{personalScriptCategories.map(category => <Pressable key={category.id}
      accessibilityRole="radio" accessibilityLabel={category.label} accessibilityState={{ checked: draft.categoryId === category.id, disabled: unavailable }}
      disabled={unavailable} style={styles.option} onPress={() => setDraft(value => ({ ...value, categoryId: category.id }))}>
      <MaterialIcons name={draft.categoryId === category.id ? 'radio-button-checked' : 'radio-button-unchecked'} size={24} color="#16634D" accessible={false} />
      <Text style={styles.text}>{category.label}</Text>
    </Pressable>)}</View>
    {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {saving && <Text accessibilityLiveRegion="polite" style={styles.text}>Salvando script...</Text>}
    <ScriptCommand label="Salvar script" icon="save" disabled={unavailable} onPress={() => void save()} />
  </ScriptPage>;
}
