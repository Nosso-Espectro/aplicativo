import { useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRegulationSounds } from './RegulationSoundsProvider';
import { soundOptions } from './sound-settings';

const phaseLabels = { idle: 'Parado', loading: 'Carregando som', playing: 'Reproduzindo', paused: 'Pausado', stopping: 'Interrompendo som', error: 'Não foi possível confirmar o controle do som.' };
export function RegulationSoundsScreen({ onClose, backLabel = 'Voltar ao quadro' }: { onClose(): void; backLabel?: string }) {
  const sounds = useRegulationSounds();
  const [confirmBackground, setConfirmBackground] = useState(false);
  const [gainError, setGainError] = useState(false);
  const state = sounds?.state;
  const percent = Math.round((state?.settings.volume ?? 0.25) * 100);
  const unavailable = !sounds || state?.pending || state?.speechActive;
  const canPause = !!state && (state.pending || ['playing', 'loading', 'stopping'].includes(state.phase));
  function gain(value: number) {
    if (confirmBackground) return;
    try { sounds?.controller.volume(value / 100); setGainError(false); }
    catch { setGainError(true); }
  }
  return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.content}>
    <Command icon="arrow-back" label={backLabel} onPress={onClose} />
    <Text accessibilityRole="header" style={styles.heading}>Sons</Text>
    {!sounds && <Text style={styles.text} accessibilityLiveRegion="polite">Preparando controles de som</Text>}
    {sounds && state && <>
      <View accessibilityRole="radiogroup" accessibilityLabel="Escolha de som" style={styles.options}>
        {soundOptions.map(sound => <Pressable key={sound.id} accessibilityRole="radio" accessibilityLabel={sound.label}
          accessibilityState={{ checked: state.settings.selectedSoundId === sound.id, disabled: confirmBackground }} disabled={confirmBackground}
          onPress={() => { sounds.controller.select(sound.id); setGainError(false); }} style={styles.choice}>
          <MaterialIcons name={state.settings.selectedSoundId === sound.id ? 'radio-button-checked' : 'radio-button-unchecked'} size={24} color="#16634D" accessible={false} />
          <Text style={styles.text}>{sound.label}</Text>
        </Pressable>)}
      </View>
      <Text accessibilityRole={state.phase === 'error' ? 'alert' : undefined} accessibilityLiveRegion="polite" style={styles.text}>
        {state.phase === 'error' ? phaseLabels.error : state.speechActive ? 'Som pausado durante a leitura' : phaseLabels[state.phase]}
      </Text>
      {!state.settings.selectedSoundId && <Text style={styles.text}>Nenhum som selecionado</Text>}
      {canPause && <Command icon="pause" label="Pausar som" onPress={() => sounds.controller.pause()} />}
      {!canPause && <Command icon="play-arrow" label={state.phase === 'error' ? 'Tentar reproduzir novamente' : 'Reproduzir som'}
        disabled={!!unavailable || !state.settings.selectedSoundId || confirmBackground} onPress={() => void sounds.controller.play()} />}
      <View style={styles.volume}>
        <Text style={styles.text}>Volume: {percent}%</Text>
        <Slider accessible accessibilityLabel="Volume do som" accessibilityRole="adjustable" accessibilityValue={{ min: 0, max: 100, now: percent, text: `${percent}%` }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={event => { const action = event.nativeEvent.actionName; if (action === 'increment' || action === 'decrement') gain(Math.max(0, Math.min(100, percent + (action === 'increment' ? 5 : -5)))); }}
          minimumValue={0} maximumValue={100} step={1} value={percent} disabled={confirmBackground} onValueChange={gain}
          minimumTrackTintColor="#16634D" maximumTrackTintColor="#72777D" thumbTintColor="#16634D" style={styles.slider} />
        {gainError && <Text accessibilityRole="alert" style={styles.text}>Não foi possível ajustar o volume.</Text>}
      </View>
      <View style={styles.background}>
        <Text style={[styles.text, styles.flexLabel]}>Continuar em segundo plano</Text>
        <Switch accessibilityLabel="Continuar som em segundo plano" style={styles.switch} accessibilityState={{ disabled: !!unavailable || confirmBackground }}
          value={state.settings.backgroundPlayback} disabled={!!unavailable || confirmBackground}
          onValueChange={enabled => { if (enabled) setConfirmBackground(true); else void sounds.controller.background(false); }} />
      </View>
      {confirmBackground && <View style={styles.confirmation}>
        <Text accessibilityRole="alert" style={styles.text}>Permitir que o som continue com a tela bloqueada e no modo silencioso?</Text>
        <Command icon="check" label="Confirmar segundo plano" disabled={!!unavailable} onPress={() => { setConfirmBackground(false); void sounds.controller.background(true); }} />
        <Command icon="close" label="Manter segundo plano desligado" onPress={() => setConfirmBackground(false)} />
      </View>}
    </>}
  </ScrollView></SafeAreaView>;
}
function Command({ icon, label, disabled = false, onPress }: { icon: ComponentProps<typeof MaterialIcons>['name']; label: string; disabled?: boolean; onPress(): void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={styles.command}>
    <MaterialIcons name={icon} size={24} color={disabled ? '#72777D' : '#16634D'} accessible={false} />
    <Text style={[styles.commandLabel, disabled && styles.disabled]}>{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, gap: 20, width: '100%', maxWidth: 720, alignSelf: 'center' },
  heading: { fontSize: 26, fontWeight: '600', color: '#202124' },
  text: { fontSize: 18, color: '#303438', flexShrink: 1 },
  options: { gap: 8 }, choice: { minHeight: 48, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  command: { minHeight: 48, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  commandLabel: { fontSize: 18, color: '#16634D', flexShrink: 1 }, disabled: { color: '#72777D' },
  volume: { gap: 8 }, slider: { minHeight: 48, width: '100%' },
  background: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, minHeight: 48 },
  flexLabel: { flexGrow: 1, flexBasis: 160 },
  switch: { minHeight: 48 },
  confirmation: { borderTopWidth: 1, borderTopColor: '#72777D', paddingTop: 16, gap: 8 },
});
