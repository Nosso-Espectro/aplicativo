import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { emptyTrustedContact, normalizedTrustedContact, type TrustedContact } from './trusted-contact';
import { openTrustedContactDatabase } from './trusted-contact-database';
import { openWhatsAppDraft } from './whatsapp-handoff';

export function TrustedContactScreen({ onClose }: { onClose(): void }) {
  const [draft, setDraft] = useState({ ...emptyTrustedContact });
  const [saved, setSaved] = useState({ ...emptyTrustedContact });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [operation, setOperation] = useState<'save' | 'open' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [review, setReview] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const inFlight = useRef(false);
  const storage = useRef<Awaited<ReturnType<typeof openTrustedContactDatabase>> | null>(null);
  const initialization = useRef<Promise<TrustedContact> | null>(null);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        initialization.current ??= (async () => {
          storage.current ??= await openTrustedContactDatabase(); return storage.current.read();
        })();
        const current = await initialization.current;
        if (active) { setDraft(current); setSaved(current); setLoadError(false); }
      } catch { if (active) setLoadError(true); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [attempt]);
  const unavailable = loading || loadError || operation !== null;
  const changed = draft.name !== saved.name || draft.phone !== saved.phone || draft.message !== saved.message;
  function edit(field: keyof TrustedContact, value: string) {
    setDraft((current) => ({ ...current, [field]: value })); setReview(false); setConfirmRemove(false); setMessage(null);
  }
  async function save(remove = false) {
    if (inFlight.current || unavailable || !storage.current) return;
    let input: TrustedContact;
    try { input = normalizedTrustedContact(remove ? emptyTrustedContact : draft); }
    catch { setMessage('Informe um telefone internacional válido, com + e código do país, e uma mensagem. Seu preenchimento foi mantido.'); return; }
    if (!remove && !input.phone && saved.phone) { setConfirmRemove(true); setReview(false); return; }
    inFlight.current = true; setOperation('save'); setMessage(null); setReview(false);
    try {
      const current = await storage.current.save(input);
      setDraft(current); setSaved(current); setConfirmRemove(false);
      setMessage(remove ? 'Contato e mensagem removidos.' : current.phone ? 'Contato e mensagem salvos.' : 'Configuração vazia salva.');
    } catch { setMessage('Não foi possível salvar. Seu preenchimento e a versão salva foram mantidos. Tente novamente ou cancele.'); }
    finally { inFlight.current = false; setOperation(null); }
  }
  async function open() {
    if (inFlight.current || unavailable || changed || !review || !saved.phone) return;
    inFlight.current = true; setOperation('open'); setMessage(null);
    try {
      const result = await openWhatsAppDraft(saved);
      if (result === 'opened') { setReview(false); setMessage('Pedido de abertura encaminhado ao WhatsApp. O envio não foi confirmado.'); }
      else setMessage(result === 'unavailable' ? 'WhatsApp indisponível. O contato e a mensagem foram mantidos.' : 'Não foi possível abrir o WhatsApp. Nada foi enviado pelo TEAr. Tente novamente ou cancele.');
    } catch { setMessage('Não foi possível abrir o WhatsApp. Nada foi enviado pelo TEAr. Tente novamente ou cancele.'); }
    finally { inFlight.current = false; setOperation(null); }
  }
  return <SafeAreaView style={styles.screen}>
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Command icon="arrow-back" label="Cancelar e voltar" disabled={operation !== null} onPress={onClose} />
        <Text accessibilityRole="header" style={styles.heading}>Contato de confiança</Text>
        {loading && <Text accessibilityLiveRegion="polite" style={styles.text}>Abrindo contato…</Text>}
        {loadError && <>
          <Text accessibilityRole="alert" style={styles.error}>{Platform.OS === 'web' ? 'Armazenamento do contato indisponível nesta prévia web.' : 'Não foi possível abrir o contato salvo.'}</Text>
          <Command icon="refresh" label="Tentar abrir contato novamente" disabled={loading} onPress={() => {
            initialization.current = null; setLoading(true); setAttempt((value) => value + 1);
          }} />
        </>}
        {!loading && !loadError && !saved.phone && <Text style={styles.text}>Ainda não há contato de confiança salvo.</Text>}
        {([{ id: 'name', label: 'Nome (opcional)' }, { id: 'phone', label: 'Telefone com código do país (+)' }, { id: 'message', label: 'Mensagem padrão' }] as const).map(({ id, label }) => <View key={id} style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          <TextInput accessibilityLabel={label} value={draft[id]} editable={!unavailable} autoComplete="off"
            keyboardType={id === 'phone' ? 'phone-pad' : 'default'} autoCorrect={id !== 'phone'} multiline={id === 'message'}
            textAlignVertical="top" style={[styles.input, id === 'message' && styles.multiline]} onChangeText={(value) => edit(id, value)} />
        </View>)}
        {changed && <Text accessibilityLiveRegion="polite" style={styles.text}>Alterações não salvas.</Text>}
        {message && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.text}>{message}</Text>}
        {operation && <Text accessibilityLiveRegion="polite" style={styles.text}>{operation === 'save' ? 'Salvando contato…' : 'Abrindo WhatsApp…'}</Text>}
        <Command icon="save" label="Salvar contato e mensagem" primary disabled={unavailable} onPress={() => void save()} />
        {Boolean(saved.phone) && <>
          <Command icon="chat-bubble-outline" label="Revisar pedido de apoio" disabled={unavailable || changed} onPress={() => { setReview(true); setConfirmRemove(false); setMessage(null); }} />
          <Command icon="delete-outline" label="Remover contato e mensagem" disabled={unavailable} onPress={() => { setConfirmRemove(true); setReview(false); }} />
        </>}
        {review && <View style={styles.confirmation}>
          <Text accessibilityRole="header" style={styles.section}>Revisar pedido de apoio</Text>
          {Boolean(saved.name) && <Text style={styles.text}>{saved.name}</Text>}
          <Text style={styles.label}>Destino</Text><Text style={styles.text}>{saved.phone}</Text>
          <Text style={styles.label}>Mensagem</Text><Text style={styles.text}>{saved.message}</Text>
          <Text style={styles.text}>Ao continuar, este telefone e esta mensagem serão encaminhados ao WhatsApp. Nenhum envio será feito pelo TEAr.</Text>
          <Command icon="open-in-new" label="Confirmar abertura do WhatsApp" disabled={unavailable || changed} onPress={() => void open()} />
          <Command icon="close" label="Cancelar abertura" disabled={operation !== null} onPress={() => setReview(false)} />
        </View>}
        {confirmRemove && <View style={styles.confirmation}>
          <Text accessibilityRole="alert" style={styles.text}>Remover o contato e a mensagem salvos? O plano e o perfil serão mantidos.</Text>
          <Command icon="delete" label="Confirmar remoção do contato" disabled={unavailable} onPress={() => void save(true)} />
          <Command icon="close" label="Manter contato e mensagem" disabled={operation !== null} onPress={() => setConfirmRemove(false)} />
        </View>}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
function Command({ icon, label, onPress, disabled = false, primary = false }: {
  icon: ComponentProps<typeof MaterialIcons>['name']; label: string; onPress(): void; disabled?: boolean; primary?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.command, primary && styles.primary, (pressed || disabled) && styles.dimmed]}>
    <MaterialIcons name={icon} size={24} color={primary ? '#FFFFFF' : '#16634D'} accessible={false} />
    <Text style={[styles.text, styles.commandText, primary && styles.primaryText]}>{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' }, content: { padding: 20, gap: 16, width: '100%', maxWidth: 720, alignSelf: 'center' },
  heading: { fontSize: 26, color: '#202124', fontWeight: '600' }, section: { fontSize: 22, color: '#202124', fontWeight: '600' },
  text: { fontSize: 18, color: '#202124', flexShrink: 1 }, field: { gap: 8 }, label: { fontSize: 18, color: '#202124', fontWeight: '600' },
  input: { minHeight: 56, padding: 12, borderWidth: 1, borderColor: '#72777D', borderRadius: 4, fontSize: 20, color: '#202124' }, multiline: { minHeight: 96 },
  error: { color: '#92322D', fontSize: 18 }, command: { minHeight: 48, maxWidth: '100%', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  commandText: { color: '#16634D', fontWeight: '600' }, primary: { backgroundColor: '#16634D', borderRadius: 4 }, primaryText: { color: '#FFFFFF' }, dimmed: { opacity: 0.65 },
  confirmation: { gap: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#72777D' },
});
