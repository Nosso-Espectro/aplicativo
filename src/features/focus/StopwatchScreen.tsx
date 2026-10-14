import { useCallback, useLayoutEffect, useRef, useState, type ComponentProps } from 'react';
import { useFocusEffect } from 'expo-router';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useStopwatch } from './StopwatchProvider';
function Command({ label, icon, onPress }: { label: string; icon: ComponentProps<typeof MaterialIcons>['name']; onPress(): void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.command}>
    <MaterialIcons name={icon} size={24} color="#16634D" accessible={false} /><Text style={styles.commandText}>{label}</Text>
  </Pressable>;
}
export function StopwatchScreen({ onClose }: { onClose(): void }) {
  const context = useStopwatch(); const { session, revision, discard } = context;
  const [confirmation, setConfirmation] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const activeSession = session && session.status !== 'finished';
  const requestClose = () => { if (activeSession) setConfirmation(revision); else { discard(); onClose(); } };
  const closeRef = useRef(requestClose);
  useLayoutEffect(() => { closeRef.current = requestClose; });
  useFocusEffect(useCallback(() => {
    setConfirmation(null); setMessage(null);
    let active = true;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!active) return false;
      closeRef.current(); return true;
    });
    return () => { active = false; subscription.remove(); discard(); };
  }, [discard]));
  function confirm() {
    if (confirmation === null) return;
    if (!context.act({ type: 'discard', expectedRevision: confirmation })) {
      setConfirmation(null); setMessage('A sessão mudou. Revise antes de sair.'); return;
    }
    setConfirmation(null); onClose();
  }
  const seconds = Math.floor((session?.elapsedMs ?? 0) / 1000);
  const hours = Math.floor(seconds / 3600); const minutes = Math.floor(seconds % 3600 / 60); const rest = seconds % 60;
  const label = `Tempo decorrido: ${hours} horas, ${minutes} minutos e ${rest} segundos`;
  function command(type: 'start' | 'pause' | 'resume' | 'finish') { setMessage(null); context.act({ type, expectedRevision: revision }); }
  return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.content}>
    <Command label="Voltar ao foco" icon="arrow-back" onPress={requestClose} />
    <Text accessibilityRole="header" style={styles.heading}>Cronômetro livre</Text>
    <View accessible accessibilityRole="text" accessibilityLabel={label} style={styles.clock}>
      <Text style={styles.time} accessible={false}>{`${hours.toString().padStart(2, '0')}h`}</Text>
      <Text style={styles.time} accessible={false}>{`${minutes.toString().padStart(2, '0')}min`}</Text>
      <Text style={styles.time} accessible={false}>{`${rest.toString().padStart(2, '0')}s`}</Text>
    </View>
    <Text accessibilityLiveRegion="polite" style={styles.text}>{!session ? 'Sem sessão ativa.' : session.status === 'finished'
      ? 'Sessão finalizada.' : session.status === 'paused' ? 'Sessão pausada.' : 'Sessão em andamento.'}</Text>
    {!session && <Command label="Iniciar cronômetro" icon="play-arrow" onPress={() => command('start')} />}
    {session?.status === 'running' && <Command label="Pausar cronômetro" icon="pause" onPress={() => command('pause')} />}
    {session?.status === 'paused' && <Command label="Retomar cronômetro" icon="play-arrow" onPress={() => command('resume')} />}
    {activeSession && <Command label="Finalizar cronômetro" icon="stop" onPress={() => command('finish')} />}
    {session?.status === 'finished' && <Command label="Nova sessão" icon="play-arrow" onPress={() => command('start')} />}
    {context.error && <Text accessibilityRole="alert" style={styles.error}>Não foi possível conferir o relógio. O tempo confirmado foi mantido.</Text>}
    {message && <Text accessibilityRole="alert" style={styles.error}>{message}</Text>}
    {confirmation !== null && <View style={styles.confirmation}>
      <Text accessibilityRole="alert" style={styles.text}>Sair e descartar esta sessão?</Text>
      <Command label="Confirmar saída do cronômetro" icon="close" onPress={confirm} />
      <Command label="Manter cronômetro" icon="play-arrow" onPress={() => setConfirmation(null)} />
    </View>}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' }, content: { padding: 20, gap: 16, width: '100%', maxWidth: 720, alignSelf: 'center' },
  heading: { color: '#202124', fontSize: 26, fontWeight: '600' }, text: { color: '#202124', fontSize: 18, flexShrink: 1 },
  clock: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, time: { color: '#202124', fontSize: 28, fontWeight: '600', flexShrink: 1 },
  command: { minHeight: 48, padding: 12, gap: 8, flexDirection: 'row', alignItems: 'center' },
  commandText: { color: '#16634D', fontSize: 18, fontWeight: '600', flexShrink: 1 }, error: { color: '#92322D', fontSize: 18 },
  confirmation: { gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#72777D' },
});
