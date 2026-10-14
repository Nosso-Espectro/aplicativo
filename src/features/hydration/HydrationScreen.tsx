import { useCallback, useLayoutEffect, useRef, useState, type ComponentProps } from 'react';
import { useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { hydrationPresets, validHydrationInterval } from './hydration-model';
import { useHydration } from './HydrationProvider';
import { formatQuietTime, parseQuietTime } from './quiet-hours';
type Draft = { revision: number; text: string };
type QuietDraft = { revision: number; enabled: boolean; start: string; end: string };
function Command({ label, icon, disabled = false, onPress }: {
  label: string; icon: ComponentProps<typeof MaterialIcons>['name']; disabled?: boolean; onPress(): void;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={styles.command}>
    <MaterialIcons name={icon} size={24} color={disabled ? '#72777D' : '#16634D'} accessible={false} />
    <Text style={[styles.commandText, disabled && styles.disabled]}>{label}</Text>
  </Pressable>;
}
export function HydrationScreen({ onClose, backLabel }: { onClose(): void; backLabel: string }) {
  const { config, loading, busy, confirmed, error, controller } = useHydration();
  const [draft, setDraft] = useState<Draft | null>(null); const [confirmation, setConfirmation] = useState<number | null>(null);
  const [quietDraft, setQuietDraft] = useState<QuietDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const controllerRef = useRef(controller);
  useLayoutEffect(() => { controllerRef.current = controller; }, [controller]);
  const focused = useRef(false);
  const focusRevision = useRef(0); const saving = useRef(false);
  useFocusEffect(useCallback(() => {
    focused.current = true; focusRevision.current++; setDraft(null); setQuietDraft(null); setConfirmation(null); setMessage(null);
    return () => { focused.current = false; focusRevision.current++; controllerRef.current?.cancelPending(); };
  }, []));
  const editable = !!config && !loading && !busy && confirmed && config.status !== 'active' && !config.journal;
  const blocked = !config || loading || busy || !confirmed || !!config.journal;
  async function save() {
    if (!draft || !controller || !editable || saving.current) return;
    const minutes = /^\d+$/.test(draft.text) ? Number(draft.text) : NaN;
    if (!validHydrationInterval(minutes)) { setMessage('Escolha um intervalo inteiro de 30 a 720 minutos.'); return; }
    const owner = focusRevision.current; saving.current = true;
    const saved = await controller.save(minutes, draft.revision); saving.current = false;
    if (!focused.current || owner !== focusRevision.current) return;
    if (saved) { setDraft(null); setMessage(null); }
    else setMessage('Não foi possível salvar. Confira o intervalo e tente novamente.');
  }
  async function saveQuiet() {
    if (!quietDraft || !controller || !editable || saving.current) return;
    const startMinute = parseQuietTime(quietDraft.start); const endMinute = parseQuietTime(quietDraft.end);
    if (quietDraft.enabled && (startMinute === null || endMinute === null || startMinute === endMinute)) {
      setMessage('Escolha início e fim diferentes, no formato HH:MM.'); return;
    }
    const window = quietDraft.enabled ? { startMinute: startMinute!, endMinute: endMinute! } : null;
    const owner = focusRevision.current; saving.current = true;
    const saved = await controller.saveQuiet(window, quietDraft.revision); saving.current = false;
    if (!focused.current || owner !== focusRevision.current) return;
    if (saved) { setQuietDraft(null); setMessage(null); }
    else setMessage('Não foi possível salvar o horário silencioso. Confira os lembretes e tente novamente.');
  }
  async function activate() {
    if (confirmation === null || !controller) return;
    const revision = confirmation; setConfirmation(null); setMessage(null);
    await controller.activate(revision);
  }
  return <SafeAreaView style={styles.screen}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
    <Command label={backLabel} icon="arrow-back" onPress={() => { controller?.cancelPending(); onClose(); }} />
    <Text accessibilityRole="header" style={styles.heading}>Lembretes de água</Text>
    {loading && <Text accessibilityLiveRegion="polite" style={styles.text}>Abrindo lembretes…</Text>}
    {config && <>
      <Text accessibilityLiveRegion="polite" style={styles.text}>{!confirmed || config.journal ? 'Estado dos lembretes não confirmado.'
        : config.status === 'active' ? 'Lembretes ativos.' : config.status === 'paused' ? 'Lembretes pausados.' : 'Lembretes desativados.'}</Text>
      <Text style={styles.text}>Intervalo salvo: {config.intervalMinutes} minutos.</Text>
      <Text style={styles.text}>{config.quietWindow ? `Horário silencioso salvo: ${formatQuietTime(config.quietWindow.startMinute)} a ${formatQuietTime(config.quietWindow.endMinute)}.` : 'Sem horário silencioso.'}</Text>
      {config.status === 'active' && <Text style={styles.text}>Pause os lembretes antes de alterar o intervalo ou o horário silencioso.</Text>}
      {!draft && <Command label="Alterar intervalo" icon="edit" disabled={!editable || !!quietDraft} onPress={() => { setDraft({ revision: config.revision, text: String(config.intervalMinutes) }); setConfirmation(null); setMessage(null); }} />}
      {draft && <View style={styles.editor}>
        <Text style={styles.text}>Intervalo em minutos</Text>
        <TextInput accessibilityLabel="Intervalo em minutos" keyboardType="number-pad" value={draft.text} editable={editable}
          onChangeText={text => setDraft({ ...draft, text })} style={styles.input} />
        <View style={styles.presets}>{hydrationPresets.map(minutes => <Pressable key={minutes} accessibilityRole="button" accessibilityLabel={`${minutes} minutos`}
          accessibilityState={{ selected: draft.text === String(minutes), disabled: !editable }} disabled={!editable}
          onPress={() => setDraft({ ...draft, text: String(minutes) })} style={[styles.preset, draft.text === String(minutes) && styles.selected]}>
          <Text style={styles.commandText}>{minutes} min</Text>
        </Pressable>)}</View>
        <Command label="Salvar intervalo" icon="save" disabled={!editable} onPress={() => void save()} />
        <Command label="Cancelar edição do intervalo" icon="close" disabled={busy} onPress={() => { setDraft(null); setMessage(null); }} />
      </View>}
      {!quietDraft && <Command label="Alterar horário silencioso" icon="bedtime" disabled={!editable || !!draft} onPress={() => {
        setQuietDraft({ revision: config.revision, enabled: !!config.quietWindow,
          start: config.quietWindow ? formatQuietTime(config.quietWindow.startMinute) : '',
          end: config.quietWindow ? formatQuietTime(config.quietWindow.endMinute) : '' }); setConfirmation(null); setMessage(null);
      }} />}
      {quietDraft && <View style={styles.editor}>
        <View style={styles.toggle}><Text style={styles.text}>Horário silencioso</Text>
          <Switch accessibilityLabel="Usar horário silencioso" value={quietDraft.enabled} disabled={!editable} hitSlop={{ top: 10, bottom: 10 }}
            onValueChange={enabled => setQuietDraft({ ...quietDraft, enabled })} />
        </View>
        {quietDraft.enabled && <>
          <Text style={styles.text}>Início</Text>
          <TextInput accessibilityLabel="Início do horário silencioso" placeholder="HH:MM" value={quietDraft.start}
            editable={editable} autoCorrect={false} maxLength={5} onChangeText={start => setQuietDraft({ ...quietDraft, start })} style={styles.input} />
          <Text style={styles.text}>Fim</Text>
          <TextInput accessibilityLabel="Fim do horário silencioso" placeholder="HH:MM" value={quietDraft.end}
            editable={editable} autoCorrect={false} maxLength={5} onChangeText={end => setQuietDraft({ ...quietDraft, end })} style={styles.input} />
        </>}
        <Command label="Salvar horário silencioso" icon="save" disabled={!editable} onPress={() => void saveQuiet()} />
        <Command label="Cancelar edição do horário silencioso" icon="close" disabled={busy} onPress={() => { setQuietDraft(null); setMessage(null); }} />
      </View>}
      {config.status !== 'active' && <Command label={config.status === 'paused' ? 'Retomar lembretes' : 'Ativar lembretes'} icon="notifications-none"
        disabled={blocked || !!draft || !!quietDraft} onPress={() => { setConfirmation(config.revision); setMessage(null); }} />}
      {config.status === 'active' && <Command label="Pausar lembretes" icon="pause" disabled={loading || busy} onPress={() => void controller?.pause(config.revision)} />}
      {config.status !== 'disabled' && <Command label="Desativar lembretes" icon="notifications-off" disabled={loading || busy} onPress={() => void controller?.disable(config.revision)} />}
    </>}
    {confirmation !== null && <View style={styles.confirmation}>
      <Text accessibilityRole="alert" style={styles.text}>{config?.quietWindow
        ? `Ativar avisos locais em horários diários fora de ${formatQuietTime(config.quietWindow.startMinute)} a ${formatQuietTime(config.quietWindow.endMinute)}? O primeiro horário planejado será após pelo menos ${config.intervalMinutes} minutos. Os espaços entre avisos podem ser maiores.`
        : `Ativar avisos locais a cada ${config?.intervalMinutes} minutos? O primeiro aviso virá após o intervalo completo. Podem chegar a qualquer horário até você pausar ou desativar.`}</Text>
      <Text style={styles.text}>Pediremos avisos sem som ou vibração. As configurações do aparelho podem mudar a apresentação e o horário de entrega.</Text>
      <Command label="Confirmar ativação dos lembretes" icon="check" disabled={blocked || confirmation !== config?.revision || !!draft || !!quietDraft} onPress={() => void activate()} />
      <Command label="Cancelar ativação dos lembretes" icon="close" onPress={() => setConfirmation(null)} />
    </View>}
    {busy && <><Text accessibilityLiveRegion="polite" style={styles.text}>Conferindo lembretes…</Text><Command label="Cancelar operação dos lembretes" icon="close" onPress={() => controller?.cancelPending()} /></>}
    {error && <>
      <Text accessibilityRole="alert" style={styles.error}>{error === 'permission' ? 'Permissão de avisos não concedida. Os lembretes continuam inativos.'
        : 'Não foi possível confirmar os lembretes. Avisos anteriores podem continuar até o cancelamento ser confirmado.'}</Text>
      <Command label="Conferir lembretes novamente" icon="refresh" disabled={busy || loading} onPress={() => void controller?.reload()} />
    </>}
    {message && <Text accessibilityRole="alert" style={styles.error}>{message}</Text>}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' }, content: { padding: 20, gap: 16, width: '100%', maxWidth: 720, alignSelf: 'center' },
  heading: { color: '#202124', fontSize: 26, fontWeight: '600' }, text: { color: '#202124', fontSize: 18, flexShrink: 1 },
  command: { minHeight: 48, padding: 12, gap: 8, flexDirection: 'row', alignItems: 'center' }, commandText: { color: '#16634D', fontSize: 18, flexShrink: 1 },
  disabled: { color: '#72777D' }, error: { color: '#92322D', fontSize: 18 }, editor: { gap: 12 },
  input: { minHeight: 48, padding: 12, borderWidth: 1, borderColor: '#72777D', borderRadius: 4, fontSize: 18, color: '#202124' },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, preset: { minHeight: 48, minWidth: 48, padding: 12, borderBottomWidth: 2, borderBottomColor: '#72777D' },
  selected: { borderBottomColor: '#16634D', backgroundColor: '#EFF7F3' }, confirmation: { gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#72777D' },
  toggle: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
});
