import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { CommunicationScript } from './script-catalog';
import { personalScriptCategories, scriptFavorite, type SavedPersonalScript, type ScriptReference } from './personal-script-model';
import { ScriptCommand, ScriptPage, ScriptStorageStatus, scriptStyles as styles } from './ScriptUI';
import { useScripts } from './ScriptProvider';
import { useScriptCopy } from './useScriptCopy';
import { SpeechControls } from '../communication/speech/SpeechControls';
export function ScriptDetail({ script, refValue, onClose, onEdit, onCopy }: {
  script: CommunicationScript | SavedPersonalScript; refValue: ScriptReference; onClose(): void; onEdit(): void; onCopy(): void;
}) {
  const context = useScripts(); const clipboard = useScriptCopy(); const active = useRef(false);
  const [focused, setFocused] = useState(false); const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<SavedPersonalScript | null>(null);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  useFocusEffect(useCallback(() => { setFocused(true); return () => setFocused(false); }, []));
  const unavailable = context.loading || context.busy || Boolean(context.error);
  const selected = scriptFavorite(context, refValue.source, script.id)?.selected ?? false;
  async function favorite() {
    setError(null); try { await context.favorite(refValue, !selected); }
    catch { if (active.current) setError('Não foi possível alterar o favorito. A versão salva foi mantida. Tente novamente.'); }
  }
  async function remove() {
    if (!removing || unavailable) return;
    setError(null);
    try { if (await context.remove(removing) && active.current) onClose(); }
    catch { if (active.current) setError('Não foi possível remover o script. A versão salva foi mantida. Tente novamente.'); }
  }
  return <ScriptPage>
    <ScriptCommand label="Voltar aos scripts" icon="arrow-back" onPress={onClose} />
    <Text accessibilityRole="header" style={styles.heading}>Script de comunicação</Text>
    <ScriptStorageStatus />
    <Text style={styles.label}>{personalScriptCategories.find(item => item.id === script.categoryId)?.label}</Text>
    <Text style={styles.text}>{script.text}</Text>
    <ScriptCommand label="Copiar script" icon="content-copy" disabled={clipboard.busy} onPress={() => void clipboard.copy(script.text)} />
    {clipboard.message && <Text accessibilityRole={clipboard.message.error ? 'alert' : undefined} accessibilityLiveRegion="polite"
      style={styles.text}>{clipboard.message.text}</Text>}
    <Pressable accessibilityRole="checkbox" accessibilityLabel="Favorito" accessibilityState={{ checked: selected, disabled: unavailable }}
      disabled={unavailable} onPress={() => void favorite()} style={styles.command}>
      <MaterialIcons name={selected ? 'star' : 'star-border'} size={24} color="#16634D" accessible={false} /><Text style={styles.commandLabel}>Favorito</Text>
    </Pressable>
    {focused && <SpeechControls text={script.text} />}
    {refValue.source === 'initial' ? <ScriptCommand label="Criar cópia" icon="content-copy" disabled={unavailable} onPress={onCopy} /> : <>
      <ScriptCommand label="Editar script" icon="edit" disabled={unavailable} onPress={onEdit} />
      <ScriptCommand label="Excluir script" icon="delete-outline" disabled={unavailable} onPress={() => setRemoving(script as SavedPersonalScript)} />
    </>}
    {removing && <View style={styles.confirmation}>
      <Text accessibilityRole="alert" style={styles.text}>Excluir este script pessoal e seu favorito? O catálogo inicial será mantido.</Text>
      <ScriptCommand label="Confirmar exclusão do script" icon="delete" disabled={unavailable} onPress={() => void remove()} />
      <ScriptCommand label="Manter script" icon="close" disabled={unavailable} onPress={() => setRemoving(null)} />
    </View>}
    {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
  </ScriptPage>;
}
