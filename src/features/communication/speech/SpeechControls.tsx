import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { localSpeech } from './local-speech';
import { useSoundSpeechGuard, type SpeechLease } from '../../regulation-sounds/RegulationSoundsProvider';

type Phase = 'idle' | 'busy' | 'stopping';

export function SpeechControls({ text }: { text: string }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [feedback, setFeedback] = useState('');
  const phaseRef = useRef<Phase>('idle');
  const active = useRef(true);
  const request = useRef(0);
  const cancelled = useRef(false);
  const finished = useRef(true);
  const guardSpeech = useSoundSpeechGuard();
  const reading = useRef<{ lease: SpeechLease; started: boolean } | null>(null);

  function updatePhase(next: Phase) {
    phaseRef.current = next;
    setPhase(next);
  }

  function currentPhase(): Phase {
    return phaseRef.current;
  }

  useEffect(() => {
    const inFlight = request;
    active.current = true;
    return () => {
      active.current = false;
      inFlight.current++;
      const current = reading.current;
      if (!current?.started) current?.lease.release();
      if (phaseRef.current !== 'idle') void localSpeech.stop().then(() => current?.lease.release()).catch(() => {});
    };
  }, []);

  async function activate() {
    if (phaseRef.current === 'stopping') return;
    if (phaseRef.current === 'busy') {
      cancelled.current = true;
      const token = request.current;
      const current = reading.current;
      if (!current?.started) current?.lease.release();
      updatePhase('stopping');
      try {
        await localSpeech.stop();
        current?.lease.release();
        if (active.current && token === request.current) updatePhase('idle');
      } catch {
        if (active.current && token === request.current) {
          setFeedback('Não foi possível interromper a leitura. Tente novamente.');
          updatePhase(finished.current ? 'idle' : 'busy');
        }
      }
      return;
    }

    if (!text.trim()) {
      setFeedback('Monte uma frase antes de iniciar a leitura.');
      return;
    }
    const token = ++request.current;
    cancelled.current = false;
    finished.current = false;
    setFeedback('');
    updatePhase('busy');
    const current = { lease: guardSpeech(), started: false };
    reading.current = current;
    try {
      await current.lease.ready;
      if (!active.current || token !== request.current || cancelled.current) return;
      const available = await localSpeech.isAvailable();
      if (!active.current || token !== request.current || cancelled.current) return;
      if (!available) {
        setFeedback('Não há voz local em português brasileiro disponível. A frase continua visível.');
        return;
      }
      current.started = true;
      await localSpeech.speak(text);
    } catch {
      if (active.current && token === request.current && !cancelled.current) {
        setFeedback('Não foi possível ler a frase. A mensagem continua visível.');
      }
    } finally {
      current.lease.release();
      if (reading.current === current) reading.current = null;
      if (token === request.current) finished.current = true;
      if (active.current && token === request.current && currentPhase() !== 'stopping') {
        updatePhase('idle');
      }
    }
  }

  return (
    <View style={styles.controls}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={phase === 'idle' ? 'Ler frase' : 'Interromper leitura'}
        accessibilityState={{ disabled: phase === 'stopping' }}
        disabled={phase === 'stopping'}
        onPress={() => { void activate(); }}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.label}>{phase === 'idle' ? 'Ler frase' : 'Interromper'}</Text>
      </Pressable>
      {feedback !== '' && (
        <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.feedback}>
          {feedback}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { gap: 8 },
  button: { minHeight: 48, padding: 12, alignSelf: 'flex-start', backgroundColor: '#16634D', borderRadius: 8 },
  label: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  feedback: { color: '#303438', fontSize: 18 },
  pressed: { opacity: 0.7 },
});
