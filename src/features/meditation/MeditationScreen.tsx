import { useCallback, useLayoutEffect, useRef, useState, type ComponentProps } from 'react';
import { Stack, useFocusEffect } from 'expo-router';
import { BackHandler, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMeditation } from './MeditationProvider';
import { meditationPresets } from './meditation-model';
function Command({ label, icon, onPress, disabled = false }: { label: string; icon: ComponentProps<typeof MaterialIcons>['name']; onPress(): void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={styles.command}>
    <MaterialIcons name={icon} size={24} color="#16634D" accessible={false} /><Text style={styles.commandText}>{label}</Text>
  </Pressable>;
}
export function MeditationScreen({ onClose, backLabel }: { onClose(): void; backLabel: string }) {
  const context = useMeditation(); const { session, revision, discard } = context;
  const [duration, setDuration] = useState('10'); const [notice, setNotice] = useState(false);
  const [dismissed, setDismissed] = useState<number | null>(null); const [confirmation, setConfirmation] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const active = session?.status === 'running' || session?.status === 'paused';
  const requestClose = () => { if (active) setConfirmation(revision); else { discard(); onClose(); } };
  const closeRef = useRef(requestClose); useLayoutEffect(() => { closeRef.current = requestClose; });
  useFocusEffect(useCallback(() => {
    setDuration('10'); setNotice(false); setConfirmation(null); setMessage(null); setDismissed(null);
    let focused = true;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { if (!focused) return false; closeRef.current(); return true; });
    return () => { focused = false; subscription.remove(); discard(); };
  }, [discard]));
  function confirmClose() {
    if (confirmation === null) return;
    if (!context.act({ type: 'discard', expectedRevision: confirmation })) {
      setConfirmation(null); setMessage('A prática mudou. Revise antes de sair.'); return;
    }
    setConfirmation(null); onClose();
  }
  const seconds = Math.ceil((session?.remainingMs ?? 0) / 1000); const minutes = Math.floor(seconds / 60); const rest = seconds % 60;
  return <SafeAreaView style={styles.screen}><Stack.Screen options={{ gestureEnabled: false }} /><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
    <Command label={backLabel} icon="arrow-back" onPress={requestClose} />
    <Text accessibilityRole="header" style={styles.heading}>Meditação</Text>
    {!session && <>
      <Text style={styles.text}>Duração em minutos</Text>
      <TextInput accessibilityLabel="Duração da prática em minutos" keyboardType="number-pad" value={duration} editable={context.ready} onChangeText={setDuration} style={styles.input} />
      <View style={styles.presets}>{meditationPresets.map(value => <Pressable key={value} accessibilityRole="button" accessibilityLabel={`${value} minutos de prática`}
        accessibilityState={{ selected: duration === String(value), disabled: !context.ready }} disabled={!context.ready} onPress={() => setDuration(String(value))} style={[styles.preset, duration === String(value) && styles.selected]}>
        <Text style={styles.commandText}>{value} min</Text></Pressable>)}</View>
      <View style={styles.toggle}><Text style={styles.text}>Aviso visual ao terminar</Text>
        <Switch accessibilityLabel="Mostrar aviso visual ao terminar" value={notice} disabled={!context.ready} onValueChange={setNotice} hitSlop={{ top: 10, bottom: 10 }} />
      </View>
      <Command label="Iniciar prática" icon="play-arrow" disabled={!context.ready} onPress={() => { setMessage(null); context.act({ type: 'start', expectedRevision: revision,
        durationMinutes: /^\d+$/.test(duration) ? Number(duration) : NaN, noticeEnabled: notice }); }} />
    </>}
    {session && <>
      <View accessible accessibilityRole="text" accessibilityLabel={`Tempo restante: ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} e ${rest} ${rest === 1 ? 'segundo' : 'segundos'}`} style={styles.clock}>
        <Text accessible={false} style={styles.time}>{`${minutes.toString().padStart(2, '0')}min`}</Text>
        <Text accessible={false} style={styles.time}>{`${rest.toString().padStart(2, '0')}s`}</Text>
      </View>
      <Text style={styles.text}>{session.status === 'running' ? 'Prática em andamento.' : session.status === 'paused' ? 'Prática pausada.'
        : session.status === 'completed' ? 'Tempo concluído.' : 'Prática encerrada.'}</Text>
      {session.status === 'running' && <Command label="Pausar prática" icon="pause" onPress={() => context.act({ type: 'pause', expectedRevision: revision })} />}
      {session.status === 'paused' && <Command label="Retomar prática" icon="play-arrow" onPress={() => context.act({ type: 'resume', expectedRevision: revision })} />}
      {active && <Command label="Encerrar prática" icon="stop" onPress={() => context.act({ type: 'end', expectedRevision: revision })} />}
      {!active && <Command label="Nova prática" icon="add" onPress={() => { discard(); setDuration('10'); setNotice(false); setDismissed(null); setMessage(null); }} />}
      {session.status === 'completed' && session.noticeEnabled && dismissed !== session.generation && <View style={styles.notice}>
        <Text accessibilityLiveRegion="polite" style={styles.text}>O tempo escolhido terminou.</Text>
        <Command label="Fechar aviso da prática" icon="close" onPress={() => setDismissed(session.generation)} />
      </View>}
    </>}
    {context.error && <Text accessibilityRole="alert" style={styles.error}>{context.error === 'configuration' ? 'Escolha uma duração inteira de 1 a 180 minutos.'
      : 'Não foi possível conferir o relógio. O tempo confirmado foi mantido.'}</Text>}
    {message && <Text accessibilityRole="alert" style={styles.error}>{message}</Text>}
    {confirmation !== null && <View style={styles.confirmation}>
      <Text accessibilityRole="alert" style={styles.text}>Sair e descartar esta prática?</Text>
      <Command label="Confirmar saída da prática" icon="close" onPress={confirmClose} />
      <Command label="Manter prática" icon="play-arrow" onPress={() => setConfirmation(null)} />
    </View>}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' }, content: { padding: 20, gap: 16, width: '100%', maxWidth: 720, alignSelf: 'center' },
  heading: { color: '#202124', fontSize: 26, fontWeight: '600' }, text: { color: '#202124', fontSize: 18, flexShrink: 1 },
  command: { minHeight: 48, padding: 12, gap: 8, flexDirection: 'row', alignItems: 'center' }, commandText: { color: '#16634D', fontSize: 18, flexShrink: 1 },
  input: { minHeight: 48, padding: 12, borderWidth: 1, borderColor: '#72777D', borderRadius: 4, fontSize: 18, color: '#202124' },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, preset: { minHeight: 48, minWidth: 48, padding: 12, borderBottomWidth: 2, borderBottomColor: '#72777D' },
  selected: { borderBottomColor: '#16634D', backgroundColor: '#EFF7F3' }, toggle: { minHeight: 48, flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'space-between' },
  clock: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, time: { color: '#202124', fontSize: 28, fontWeight: '600', flexShrink: 1 },
  error: { color: '#92322D', fontSize: 18 }, notice: { gap: 8 }, confirmation: { gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#72777D' },
});
