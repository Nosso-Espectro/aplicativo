import { useState, type ComponentProps } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { durationFromInput } from './visual-timer';
import type { VersionedTimerSession } from './timer-database';
import { useTransitionTimer } from './TransitionTimerProvider';

export function TransitionTimerScreen({ onClose, backLabel = 'Voltar ao quadro' }: { onClose(): void; backLabel?: string }) {
  const timer = useTransitionTimer();
  const [minutes, setMinutes] = useState(''); const [seconds, setSeconds] = useState('0');
  const [invalidDuration, setInvalidDuration] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<VersionedTimerSession | null>(null);
  const unavailable = timer.loading || timer.error === 'read' || timer.busy;
  const active = timer.visual?.phase === 'running' || timer.visual?.phase === 'paused';
  const confirming = cancelTarget !== null && cancelTarget.session === timer.session && cancelTarget.sessionNumber === timer.sessionNumber;
  const remainingSeconds = timer.visual?.remainingSeconds ?? 0;
  const hours = Math.floor(remainingSeconds / 3600); const minutePart = Math.floor(remainingSeconds % 3600 / 60); const secondPart = remainingSeconds % 60;
  const timeLabel = `Tempo restante: ${hours ? `${hours} ${hours === 1 ? 'hora' : 'horas'}, ` : ''}${minutePart} ${minutePart === 1 ? 'minuto' : 'minutos'} e ${secondPart} ${secondPart === 1 ? 'segundo' : 'segundos'}`;
  function start() {
    try { const durationMs = durationFromInput(minutes, seconds); setInvalidDuration(false); void timer.act({ type: 'start', durationMs }); }
    catch { setInvalidDuration(true); }
  }
  return <SafeAreaView style={styles.screen}>
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Command icon="arrow-back" label={backLabel} onPress={onClose} />
        <Text accessibilityRole="header" style={styles.heading}>Timer de transição</Text>
        {timer.loading && <Text accessibilityLiveRegion="polite" style={styles.text}>Abrindo timer…</Text>}
        {timer.error && <>
          <Text accessibilityRole="alert" style={styles.text}>{timer.error === 'read' ? 'Não foi possível abrir o timer salvo.' : 'Não foi possível confirmar a alteração do timer.'}</Text>
          <Command icon="refresh" label={timer.error === 'read' ? 'Tentar abrir timer novamente' : 'Atualizar timer salvo'} disabled={timer.loading || timer.busy} onPress={timer.retryRead} />
        </>}
        {!timer.loading && timer.error !== 'read' && <>
          {!timer.visual && <Text style={styles.text}>Nenhum timer em andamento.</Text>}
          {timer.visual && <>
            <Text accessibilityLiveRegion="polite" style={styles.text}>{timer.visual.phase === 'running' ? 'Em andamento' : timer.visual.phase === 'paused' ? 'Pausado' : 'Concluído'}</Text>
            <View accessible accessibilityLabel={timeLabel} accessibilityLiveRegion="none" style={styles.clock}>
              {hours > 0 && <Text style={styles.number}>{String(hours).padStart(2, '0')}:</Text>}
              <Text style={styles.number}>{String(minutePart).padStart(2, '0')}:</Text>
              <Text style={styles.number}>{String(secondPart).padStart(2, '0')}</Text>
            </View>
            <View accessible accessibilityRole="progressbar" accessibilityLabel="Quantidade de tempo restante" accessibilityLiveRegion="none"
              accessibilityValue={{ min: 0, max: timer.session!.durationMs / 1000, now: remainingSeconds, text: timeLabel }} style={styles.track}>
              <View style={[styles.fill, { width: `${timer.visual.remainingFraction * 100}%` }]} />
            </View>
          </>}
          {!active && <>
            <View style={styles.fields}>
              <View style={styles.field}><Text style={styles.label}>Minutos</Text>
                <TextInput accessibilityLabel="Minutos do timer" keyboardType="number-pad" maxLength={4} value={minutes} editable={!unavailable && !confirming}
                  style={styles.input} onChangeText={(value) => { setMinutes(value); setInvalidDuration(false); }} />
              </View>
              <View style={styles.field}><Text style={styles.label}>Segundos</Text>
                <TextInput accessibilityLabel="Segundos do timer" keyboardType="number-pad" maxLength={2} value={seconds} editable={!unavailable && !confirming}
                  style={styles.input} onChangeText={(value) => { setSeconds(value); setInvalidDuration(false); }} />
              </View>
            </View>
            {invalidDuration && <Text accessibilityRole="alert" style={styles.text}>Use minutos e segundos inteiros, segundos de 0 a 59 e duração total de 1 segundo a 24 horas.</Text>}
            <Command icon="play-arrow" label="Iniciar timer" disabled={unavailable || confirming} onPress={start} />
          </>}
          {timer.visual?.phase === 'running' && <Command icon="pause" label="Pausar timer" disabled={unavailable || confirming} onPress={() => void timer.act({ type: 'pause' })} />}
          {timer.visual?.phase === 'paused' && <Command icon="play-arrow" label="Retomar timer" disabled={unavailable || confirming} onPress={() => void timer.act({ type: 'resume' })} />}
          {timer.session && <Command icon="close" label="Cancelar timer" disabled={unavailable || confirming} onPress={() => setCancelTarget({ session: timer.session, sessionNumber: timer.sessionNumber })} />}
          {confirming && <View style={styles.confirmation}>
            <Text accessibilityRole="alert" style={styles.text}>Cancelar este timer e remover sua sessão salva?</Text>
            <Command icon="close" label="Confirmar cancelamento do timer" disabled={unavailable} onPress={() => void timer.act({ type: 'cancel' }, cancelTarget!.session, cancelTarget!.sessionNumber)} />
            <Command icon="arrow-back" label="Manter timer" disabled={timer.busy} onPress={() => setCancelTarget(null)} />
          </View>}
        </>}
        {timer.busy && <Text accessibilityLiveRegion="polite" style={styles.text}>Salvando timer…</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
function Command({ icon, label, onPress, disabled = false }: { icon: ComponentProps<typeof MaterialIcons>['name']; label: string; onPress(): void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.command, pressed && styles.pressed]}>
    <MaterialIcons name={icon} size={24} color={disabled ? '#72777D' : '#16634D'} accessible={false} />
    <Text style={[styles.commandLabel, disabled && styles.disabled]}>{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, gap: 20, maxWidth: 720, width: '100%', alignSelf: 'center' },
  heading: { color: '#202124', fontSize: 26, fontWeight: '600' },
  text: { color: '#303438', fontSize: 18 },
  clock: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  number: { color: '#202124', fontSize: 36, fontVariant: ['tabular-nums'] },
  track: { height: 24, width: '100%', borderWidth: 1, borderColor: '#72777D', backgroundColor: '#F7F8FA', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#16634D' },
  fields: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  field: { flexGrow: 1, flexBasis: 180, maxWidth: '100%', gap: 8 },
  label: { color: '#202124', fontSize: 18 },
  input: { minHeight: 48, borderWidth: 1, borderColor: '#72777D', padding: 12, color: '#202124', fontSize: 18 },
  command: { minHeight: 48, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center' },
  commandLabel: { color: '#16634D', fontSize: 18, flexShrink: 1 },
  disabled: { color: '#72777D' },
  pressed: { opacity: 0.7 },
  confirmation: { borderTopWidth: 1, borderTopColor: '#72777D', paddingTop: 16, gap: 8 },
});
