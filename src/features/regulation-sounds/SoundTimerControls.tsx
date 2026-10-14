import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { soundTimerPresets, validSoundTimerMinutes } from './sound-timer';
import type { createSoundController, SoundState } from './sound-controller';

export function SoundTimerControls({ controller, state, disabled }: {
  controller: ReturnType<typeof createSoundController>; state: SoundState; disabled: boolean;
}) {
  const [draft, setDraft] = useState('15');
  const [message, setMessage] = useState<string | null>(null);
  const timer = state.timer;
  const busy = disabled || timer.status === 'stopping';
  const seconds = Math.ceil(timer.remainingMs / 1000);
  function apply() {
    const minutes = /^\d+$/.test(draft) ? Number(draft) : NaN;
    if (!validSoundTimerMinutes(minutes)) { setMessage('Informe de 1 a 180 minutos inteiros.'); return; }
    setMessage(controller.applyTimer(minutes, timer.revision) ? null : 'Não foi possível aplicar o temporizador. Confira o som e tente novamente.');
  }
  return <View style={styles.section}>
    <Text accessibilityRole="header" style={styles.heading}>Temporizador do som</Text>
    <Text style={styles.text}>O som temporizado pausa ao sair do aplicativo ou bloquear a tela. Não retoma automaticamente.</Text>
    <View style={styles.presets}>
      {soundTimerPresets.map(minutes => <Pressable key={minutes} accessibilityRole="button" accessibilityLabel={`${minutes} minutos para o som`}
        accessibilityState={{ selected: draft === String(minutes), disabled: busy }} disabled={busy}
        onPress={() => { setDraft(String(minutes)); setMessage(null); }} style={[styles.preset, draft === String(minutes) && styles.selected]}>
        <Text style={styles.commandText}>{minutes} min</Text>
      </Pressable>)}
    </View>
    <Text style={styles.text}>Duração em minutos</Text>
    <TextInput accessibilityLabel="Duração do temporizador do som em minutos" keyboardType="number-pad" maxLength={3}
      editable={!busy} value={draft} onChangeText={value => { setDraft(value); setMessage(null); }} style={styles.input} />
    <Pressable accessibilityRole="button" accessibilityLabel="Aplicar temporizador do som"
      accessibilityState={{ disabled: busy || state.settings.backgroundPlayback || !['playing', 'paused'].includes(state.phase) }}
      disabled={busy || state.settings.backgroundPlayback || !['playing', 'paused'].includes(state.phase)} onPress={apply} style={styles.command}>
      <MaterialIcons name="timer" size={24} color="#16634D" accessible={false} /><Text style={styles.commandText}>Aplicar temporizador</Text>
    </Pressable>
    {state.settings.backgroundPlayback && <Text style={styles.text}>Desligue segundo plano antes de aplicar um temporizador.</Text>}
    {timer.status === 'armed' && <>
      <Text style={styles.text} accessibilityLabel={`Tempo restante do som: ${Math.floor(seconds / 60)} minutos e ${seconds % 60} segundos`}>{`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Cancelar temporizador sem pausar som" style={styles.command}
        onPress={() => { if (controller.cancelTimer(timer.revision)) setMessage(null); }}>
        <MaterialIcons name="timer-off" size={24} color="#16634D" accessible={false} /><Text style={styles.commandText}>Cancelar temporizador</Text>
      </Pressable>
      <Text style={styles.text}>Cancele o temporizador antes de ativar segundo plano.</Text>
    </>}
    <Text accessibilityLiveRegion="polite" style={styles.text}>
      {timer.status === 'idle' ? 'Sem temporizador ativo.' : timer.status === 'armed' ? 'Temporizador ativo.'
        : timer.status === 'stopping' ? 'Confirmando encerramento do som.' : timer.status === 'finished' ? 'Temporizador encerrado. Som pausado.' : 'Temporizador interrompido.'}
    </Text>
    {timer.error && <Text accessibilityRole="alert" style={styles.text}>{timer.error === 'clock'
      ? 'Não foi possível conferir o relógio. O temporizador foi interrompido e a pausa do som foi solicitada.'
      : 'Não foi possível confirmar o encerramento do som. Confira os controles antes de tentar novamente.'}</Text>}
    {message && <Text accessibilityRole="alert" style={styles.text}>{message}</Text>}
  </View>;
}
const styles = StyleSheet.create({
  section: { gap: 12, borderTopWidth: 1, borderTopColor: '#72777D', paddingTop: 16 },
  heading: { fontSize: 22, fontWeight: '600', color: '#202124' }, text: { fontSize: 18, color: '#303438', flexShrink: 1 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, preset: { minHeight: 48, minWidth: 64, padding: 12, borderBottomWidth: 2, borderBottomColor: '#72777D' },
  selected: { borderBottomColor: '#16634D', backgroundColor: '#EDF5F1' },
  input: { minHeight: 48, padding: 12, borderWidth: 1, borderColor: '#72777D', borderRadius: 4, color: '#303438', fontSize: 18 },
  command: { minHeight: 48, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center' },
  commandText: { fontSize: 18, color: '#16634D', flexShrink: 1 },
});
