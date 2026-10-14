import { useCallback, useLayoutEffect, useRef, useState, type ComponentProps } from 'react';
import { useFocusEffect } from 'expo-router';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePomodoro } from './PomodoroProvider';
import { pomodoroPresets, validPomodoroCustomTimes, type PomodoroChoiceId } from './pomodoro-model';
function Command({ label, icon, onPress }: { label: string; icon: ComponentProps<typeof MaterialIcons>['name']; onPress(): void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.command}>
    <MaterialIcons name={icon} size={24} color="#16634D" accessible={false} /><Text style={styles.commandText}>{label}</Text>
  </Pressable>;
}
export function PomodoroScreen({ onClose, onFree }: { onClose(): void; onFree(): void }) {
  const context = usePomodoro(); const { session, revision, discard } = context;
  const [presetId, setPresetId] = useState<PomodoroChoiceId>('25-5');
  const [customTimes, setCustomTimes] = useState({ focusMinutes: 25, breakMinutes: 5 });
  const [draft, setDraft] = useState<{ focus: string; pause: string } | null>(null);
  const [confirmation, setConfirmation] = useState<{ revision: number; leave: boolean } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const openingFree = useRef(false);
  const focused = useRef(false);
  const choiceRevision = useRef(0); const renderedChoiceRevision = choiceRevision.current;
  const inactive = () => focused.current && choiceRevision.current === renderedChoiceRevision && context.isInactive(revision);
  const changedChoice = () => { choiceRevision.current += 1; };
  const requestClose = () => { if (session) setConfirmation({ revision, leave: true }); else onClose(); };
  const closeRef = useRef(requestClose);
  useLayoutEffect(() => { closeRef.current = requestClose; });
  useFocusEffect(useCallback(() => {
    openingFree.current = false;
    focused.current = true;
    let active = true;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!active) return false;
      closeRef.current(); return true;
    });
    return () => {
      active = false; focused.current = false; choiceRevision.current += 1; subscription.remove(); discard();
      setPresetId('25-5'); setCustomTimes({ focusMinutes: 25, breakMinutes: 5 }); setDraft(null); setMessage(null); setConfirmation(null);
    };
  }, [discard]));
  function confirm() {
    if (!confirmation) return;
    if (!context.act({ type: 'end', expectedRevision: confirmation.revision })) {
      setConfirmation(null); setMessage('A sessão mudou. Revise antes de encerrar.'); return;
    }
    setConfirmation(null); setMessage(null); if (confirmation.leave) onClose();
  }
  const seconds = Math.ceil((session?.remainingMs ?? 0) / 1000);
  const time = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  const phase = session?.phase === 'break' ? 'Pausa' : 'Foco';
  return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.content}>
    <Command label="Voltar ao quadro" icon="arrow-back" onPress={requestClose} />
    <Text accessibilityRole="header" style={styles.heading}>Pomodoro</Text>
    {!session ? <>
      <Text accessibilityRole="header" style={styles.text}>Intervalos</Text>
      {pomodoroPresets.map(preset => {
        const label = `${preset.focusMs / 60000} minutos de foco / ${preset.breakMs / 60000} de pausa`;
        return <Pressable key={preset.id} accessibilityRole="radio" accessibilityLabel={label}
          accessibilityState={{ checked: preset.id === presetId && !draft }} style={styles.command} onPress={() => {
            if (!inactive() || (presetId === preset.id && !draft)) return;
            changedChoice(); setPresetId(preset.id); setDraft(null); setMessage(null);
          }}>
          <MaterialIcons name={preset.id === presetId ? 'radio-button-checked' : 'radio-button-unchecked'} size={24} color="#16634D" accessible={false} />
          <Text style={styles.text}>{label}</Text>
        </Pressable>;
      })}
      <Pressable accessibilityRole="radio" accessibilityLabel="Personalizado" accessibilityState={{ checked: presetId === 'custom' || Boolean(draft) }}
        style={styles.command} onPress={() => {
          if (!inactive()) return;
          changedChoice();
          setDraft({ focus: String(customTimes.focusMinutes), pause: String(customTimes.breakMinutes) }); setMessage(null);
        }}>
        <MaterialIcons name={presetId === 'custom' || draft ? 'radio-button-checked' : 'radio-button-unchecked'} size={24} color="#16634D" accessible={false} />
        <Text style={styles.text}>Personalizado</Text>
      </Pressable>
      {draft ? <View style={styles.editor}>
        <Text style={styles.text}>Foco (minutos)</Text>
        <TextInput accessibilityLabel="Foco em minutos" keyboardType="number-pad" value={draft.focus} style={styles.input}
          onChangeText={focus => { if (inactive()) { changedChoice(); setDraft(current => current ? { ...current, focus } : null); } }} />
        <Text style={styles.text}>Pausa (minutos)</Text>
        <TextInput accessibilityLabel="Pausa em minutos" keyboardType="number-pad" value={draft.pause} style={styles.input}
          onChangeText={pause => { if (inactive()) { changedChoice(); setDraft(current => current ? { ...current, pause } : null); } }} />
        <Command label="Aplicar intervalos" icon="check" onPress={() => {
          if (!inactive()) return;
          const value = { focusMinutes: Number(draft.focus), breakMinutes: Number(draft.pause) };
          if (!/^\d+$/.test(draft.focus) || !/^\d+$/.test(draft.pause) || !validPomodoroCustomTimes(value)) {
            setMessage('Informe foco e pausa em minutos inteiros de 1 a 180.'); return;
          }
          changedChoice(); setCustomTimes(value); setPresetId('custom'); setDraft(null); setMessage(null);
        }} />
        <Command label="Cancelar edição" icon="close" onPress={() => { if (inactive()) { changedChoice(); setDraft(null); setMessage(null); } }} />
      </View> : <>
        {presetId === 'custom' && <>
          <Text style={styles.text}>{customTimes.focusMinutes} minutos de foco / {customTimes.breakMinutes} de pausa</Text>
          <Command label="Editar intervalos" icon="edit" onPress={() => {
            if (inactive()) { changedChoice(); setDraft({ focus: String(customTimes.focusMinutes), pause: String(customTimes.breakMinutes) }); }
          }} />
        </>}
        <Command label="Iniciar foco" icon="play-arrow" onPress={() => {
          if (!inactive()) return; setMessage(null);
          context.act({ type: 'start', presetId, customTimes: presetId === 'custom' ? customTimes : undefined, expectedRevision: revision });
        }} />
      </>}
      <Command label="Abrir cronômetro livre" icon="schedule" onPress={() => {
        if (openingFree.current || !inactive()) return;
        openingFree.current = true;
        try { onFree(); } catch { openingFree.current = false; setMessage('Não foi possível abrir o cronômetro. Tente novamente.'); }
      }} />
    </> : <>
      <Text accessibilityRole="header" style={styles.heading}>{phase}</Text>
      <Text accessibilityLabel={`Tempo restante: ${Math.floor(seconds / 60)} minutos e ${seconds % 60} segundos`} style={styles.time}>{time}</Text>
      <Text accessibilityLiveRegion="polite" style={styles.text}>{session.status === 'waiting'
        ? `${phase} ${session.phase === 'focus' ? 'concluído' : 'concluída'}. Próxima fase: ${session.phase === 'focus' ? 'pausa' : 'foco'}.`
        : session.status === 'paused' ? `${phase} ${session.phase === 'focus' ? 'pausado' : 'pausada'}.` : `${phase} em andamento.`}</Text>
      {session.status === 'running' && <Command label="Pausar sessão" icon="pause" onPress={() => context.act({ type: 'pause', expectedRevision: revision })} />}
      {session.status === 'paused' && <Command label="Retomar sessão" icon="play-arrow" onPress={() => context.act({ type: 'resume', expectedRevision: revision })} />}
      {session.status === 'waiting' && <Command label={session.phase === 'focus' ? 'Iniciar pausa' : 'Iniciar foco'} icon="play-arrow"
        onPress={() => context.act({ type: 'next', expectedRevision: revision })} />}
      <Command label="Encerrar sessão" icon="stop" onPress={() => setConfirmation({ revision, leave: false })} />
    </>}
    {context.error && <Text accessibilityRole="alert" style={styles.error}>Não foi possível conferir o relógio. O tempo foi mantido. Tente iniciar ou retomar novamente, ou encerre a sessão.</Text>}
    {message && <Text accessibilityRole="alert" style={styles.error}>{message}</Text>}
    {confirmation && <View style={styles.confirmation}>
      <Text accessibilityRole="alert" style={styles.text}>{confirmation.leave ? 'Encerrar a sessão e voltar ao quadro?' : 'Encerrar esta sessão?'}</Text>
      <Command label={confirmation.leave ? 'Confirmar saída e encerrar' : 'Confirmar encerramento'} icon="stop" onPress={confirm} />
      <Command label="Manter sessão" icon="close" onPress={() => setConfirmation(null)} />
    </View>}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' }, content: { padding: 20, gap: 16, width: '100%', maxWidth: 720, alignSelf: 'center' },
  heading: { color: '#202124', fontSize: 26, fontWeight: '600' }, text: { color: '#202124', fontSize: 18, flexShrink: 1 },
  time: { color: '#202124', fontSize: 36, fontWeight: '600', flexShrink: 1 },
  command: { minHeight: 48, padding: 12, gap: 8, flexDirection: 'row', alignItems: 'center' },
  commandText: { color: '#16634D', fontSize: 18, fontWeight: '600', flexShrink: 1 },
  error: { color: '#92322D', fontSize: 18 }, confirmation: { gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#72777D' },
  editor: { gap: 12 }, input: { minHeight: 48, borderWidth: 1, borderColor: '#72777D', padding: 12, fontSize: 18, color: '#202124' },
});
