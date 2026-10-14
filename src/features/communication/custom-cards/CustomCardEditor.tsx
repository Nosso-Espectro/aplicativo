import { useCallback, useRef, useState, type ComponentProps } from 'react';
import { useFocusEffect } from 'expo-router';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { categories } from '../board/initial-cards';
import { useCustomCards } from './CustomCardsProvider';
import { pickCardImage } from './media-picker';
import { validateCard, type CardDraft } from './custom-card-validation';

export function CustomCardEditor({ id, onClose }: { id?: string; onClose(): void }) {
  const context = useCustomCards();
  const existing = context.cards.find((card) => card.id === id);
  const [draft, setDraft] = useState<CardDraft>({ title: existing?.title ?? '', categoryId: existing?.categoryId ?? '', imageUri: existing?.imageUri ?? null });
  const [errors, setErrors] = useState<ReturnType<typeof validateCard>>({ title: null, categoryId: null });
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<object | null>(null);
  const deleteIntent = useRef<object | null>(null);
  const owner = useRef<object | null>(null);
  const [activation, setActivation] = useState<object | null>(null);
  const titleInput = useRef<TextInput>(null);
  const inFlight = useRef(false);
  useFocusEffect(useCallback(() => {
    const current = { id };
    owner.current = current; inFlight.current = false; deleteIntent.current = null;
    setActivation(current); setBusy(false); setConfirmDelete(null); setMessage(null);
    return () => { owner.current = null; inFlight.current = false; deleteIntent.current = null; };
  }, [id, setActivation, setBusy, setConfirmDelete, setMessage]));
  const isCurrent = () => activation !== null && owner.current === activation;
  const unavailable = context.loading || Boolean(context.error) || (Boolean(id) && !existing);
  function revokeDelete() { deleteIntent.current = null; setConfirmDelete(null); }
  function edit(change: Partial<CardDraft>) {
    if (!isCurrent() || inFlight.current || unavailable) return;
    setDraft((value) => ({ ...value, ...change })); revokeDelete();
  }
  function close() {
    if (!isCurrent() || inFlight.current) return;
    owner.current = null; revokeDelete(); onClose();
  }
  function askDelete() {
    if (!isCurrent() || inFlight.current || unavailable) return;
    const intent = {}; deleteIntent.current = intent; setConfirmDelete(intent);
  }
  async function chooseImage(source: 'file' | 'camera') {
    if (!isCurrent() || inFlight.current || unavailable) return;
    revokeDelete();
    inFlight.current = true; setBusy(true); setMessage(null);
    try {
      const result = await pickCardImage(source);
      if (!isCurrent()) return;
      if (result.uri) setDraft((value) => ({ ...value, imageUri: result.uri! }));
      if (result.message) setMessage(result.message);
    } catch {
      if (isCurrent()) setMessage('Não foi possível obter a imagem. Você pode salvar sem imagem.');
    } finally { if (isCurrent()) { inFlight.current = false; setBusy(false); } }
  }
  async function save() {
    if (!isCurrent() || inFlight.current || unavailable) return;
    revokeDelete();
    const validation = validateCard(draft);
    setErrors(validation); setMessage(null);
    if (validation.title || validation.categoryId) {
      if (validation.title) titleInput.current?.focus();
      return;
    }
    inFlight.current = true; setBusy(true);
    try { await context.save(draft, id); if (isCurrent()) { owner.current = null; onClose(); } }
    catch { if (isCurrent()) setMessage('Não foi possível salvar. Seu preenchimento foi mantido. Tente salvar novamente ou cancele.'); }
    finally { if (isCurrent()) { inFlight.current = false; setBusy(false); } }
  }
  async function remove() {
    if (!isCurrent() || !id || inFlight.current || unavailable || confirmDelete === null || deleteIntent.current !== confirmDelete) return;
    inFlight.current = true; setBusy(true); setMessage(null);
    try { await context.remove(id); if (isCurrent()) { owner.current = null; revokeDelete(); onClose(); } }
    catch { if (isCurrent()) setMessage('Não foi possível excluir. O cartão foi mantido. Tente novamente ou cancele.'); }
    finally { if (isCurrent()) { inFlight.current = false; setBusy(false); } }
  }
  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <Command icon="arrow-back" label="Cancelar" disabled={busy} onPress={close} />
          <Text accessibilityRole="header" style={styles.heading}>{id ? 'Editar cartão' : 'Novo cartão'}</Text>
          {context.loading && <Text style={styles.text}>Abrindo cartões…</Text>}
          {context.error && <Text accessibilityRole="alert" style={styles.error}>{context.error}</Text>}
          {id && !existing && !context.loading && <Text accessibilityRole="alert" style={styles.error}>Cartão não encontrado.</Text>}
          <Text style={styles.label}>Título</Text>
          <TextInput ref={titleInput} accessibilityLabel="Título do cartão" value={draft.title}
            onChangeText={(title) => edit({ title })} editable={!busy && !unavailable}
            style={styles.input} multiline autoCapitalize="sentences" />
          {errors.title && <Text accessibilityRole="alert" style={styles.error}>{errors.title}</Text>}
          <Text style={styles.label}>Categoria</Text>
          <View accessibilityRole="radiogroup" style={styles.row}>
            {categories.map((category) => (
              <Pressable key={category.id} accessibilityRole="radio" accessibilityLabel={category.title}
                accessibilityState={{ checked: draft.categoryId === category.id, disabled: busy || unavailable }}
                disabled={busy || unavailable} onPress={() => edit({ categoryId: category.id })}
                style={[styles.option, draft.categoryId === category.id && styles.selected]}>
                <MaterialIcons name={draft.categoryId === category.id ? 'radio-button-checked' : 'radio-button-unchecked'} size={24} color="#16634D" accessible={false} />
                <Text style={styles.text}>{category.title}</Text>
              </Pressable>
            ))}
          </View>
          {errors.categoryId && <Text accessibilityRole="alert" style={styles.error}>{errors.categoryId}</Text>}
          <Text style={styles.label}>Imagem (opcional)</Text>
          {draft.imageUri && <Image source={{ uri: draft.imageUri }} accessibilityLabel="Imagem do cartão" style={styles.image} resizeMode="contain" />}
          <View style={styles.row}>
            <Command icon="image" label="Escolher arquivo" disabled={busy || unavailable} onPress={() => void chooseImage('file')} />
            <Command icon="photo-camera" label="Usar câmera" disabled={busy || unavailable} onPress={() => void chooseImage('camera')} />
            {draft.imageUri && <Command icon="close" label="Remover imagem" disabled={busy} onPress={() => edit({ imageUri: null })} />}
          </View>
          {message && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{message}</Text>}
          {busy && <Text accessibilityLiveRegion="polite" style={styles.text}>Aguarde…</Text>}
          <Command icon="save" label="Salvar cartão" primary disabled={busy || unavailable} onPress={() => void save()} />
          {id && !confirmDelete && <Command icon="delete-outline" label="Excluir cartão" disabled={busy || unavailable} onPress={askDelete} />}
          {confirmDelete && <View style={styles.confirmation}>
            <Text accessibilityRole="alert" style={styles.text}>Excluir este cartão também remove suas entradas da frase e dos favoritos. Esta ação não pode ser desfeita.</Text>
            <View style={styles.row}>
              <Command icon="delete" label="Confirmar exclusão" disabled={busy} onPress={() => void remove()} />
              <Command icon="close" label="Manter cartão" disabled={busy} onPress={() => { if (isCurrent() && !inFlight.current && deleteIntent.current === confirmDelete) revokeDelete(); }} />
            </View>
          </View>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Command({ icon, label, onPress, disabled = false, primary = false }: {
  icon: ComponentProps<typeof MaterialIcons>['name']; label: string; onPress(): void; disabled?: boolean; primary?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.command, primary && styles.primary, (disabled || pressed) && styles.dimmed]}>
    <MaterialIcons name={icon} size={24} color={primary ? '#FFFFFF' : '#16634D'} accessible={false} />
    <Text style={[styles.commandText, primary && styles.primaryText]}>{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', padding: 20, gap: 16 },
  heading: { fontSize: 26, fontWeight: '600', color: '#202124' },
  text: { fontSize: 18, color: '#202124', flexShrink: 1 },
  label: { fontSize: 18, fontWeight: '600', color: '#202124' },
  input: { minHeight: 56, padding: 12, borderWidth: 1, borderColor: '#72777D', borderRadius: 4, fontSize: 20, color: '#202124' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { minHeight: 48, maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderBottomWidth: 3, borderColor: '#A0A4A8' },
  selected: { borderColor: '#16634D', backgroundColor: '#EEF6F2' },
  command: { minHeight: 48, maxWidth: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 },
  commandText: { fontSize: 18, fontWeight: '600', color: '#16634D', flexShrink: 1 },
  primary: { backgroundColor: '#16634D', borderRadius: 4 },
  primaryText: { color: '#FFFFFF' },
  dimmed: { opacity: 0.65 },
  error: { color: '#92322D', fontSize: 18 },
  image: { width: '100%', height: 180 },
  confirmation: { gap: 12, borderTopWidth: 1, borderColor: '#72777D', paddingTop: 16 },
});
