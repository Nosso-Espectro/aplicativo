import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { useRoutines } from './RoutineProvider';
import { routineExecution, type ProgressAction } from './routine-execution';
import { RoutineCommand, RoutinePage, routineStyles as styles } from './RoutineUI';
import type { RoutineStep } from './routine-model';

export function RoutinePlayer({ id, onClose, onEdit }: { id: string; onClose(): void; onEdit(): void }) {
  const context = useRoutines();
  const routine = context.routines.find((item) => item.id === id);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<{ action: ProgressAction; intent: object | null } | null>(null);
  const [confirmRestart, setConfirmRestart] = useState<object | null>(null);
  const inFlight = useRef(false);
  const owner = useRef<object | null>(null);
  const restartIntent = useRef<object | null>(null);
  const [activation, setActivation] = useState<object | null>(null);
  useFocusEffect(useCallback(() => {
    const current = { id };
    owner.current = current; inFlight.current = false; restartIntent.current = null;
    setActivation(current); setBusy(false); setFailed(null); setConfirmRestart(null);
    return () => { owner.current = null; inFlight.current = false; restartIntent.current = null; };
  }, [id, setActivation, setBusy, setFailed, setConfirmRestart]));
  const isCurrent = () => activation !== null && owner.current === activation;
  const unavailable = context.loading || Boolean(context.error) || !routine;
  const execution = routineExecution(routine?.steps ?? []);
  async function progress(action: ProgressAction, intent: object | null = null) {
    if (!isCurrent() || inFlight.current || unavailable) return;
    if (action === 'restart' && (!intent || restartIntent.current !== intent || confirmRestart !== intent)) return;
    if (action !== 'restart') { restartIntent.current = null; setConfirmRestart(null); }
    inFlight.current = true; setBusy(true);
    try {
      await context.progress(id, action);
      if (isCurrent()) { restartIntent.current = null; setFailed(null); setConfirmRestart(null); }
    }
    catch { if (isCurrent()) setFailed({ action, intent }); }
    finally { if (isCurrent()) { inFlight.current = false; setBusy(false); } }
  }
  return <RoutinePage>
    <RoutineCommand icon="arrow-back" label="Voltar às rotinas" disabled={busy} onPress={() => { if (isCurrent() && !inFlight.current) onClose(); }} />
    <Text accessibilityRole="header" style={styles.heading}>{routine?.name ?? 'Rotina'}</Text>
    {context.loading && <Text accessibilityLiveRegion="polite" style={styles.text}>Abrindo rotina…</Text>}
    {context.error && <Text accessibilityRole="alert" style={styles.error}>{context.error}</Text>}
    {context.error && <RoutineCommand icon="refresh" label="Tentar abrir rotinas novamente" onPress={() => { if (isCurrent()) context.retry(); }} />}
    {!context.loading && !context.error && !routine && <Text accessibilityRole="alert" style={styles.error}>Rotina não encontrada.</Text>}
    {!unavailable && routine.steps.length === 0 && <>
      <Text style={styles.text}>Esta rotina ainda não tem etapas.</Text>
      <RoutineCommand icon="edit" label="Editar rotina" onPress={() => { if (isCurrent() && !inFlight.current) onEdit(); }} />
    </>}
    {!unavailable && routine.steps.length > 0 && <>
      {execution.done ? <>
        <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.heading}>Rotina concluída</Text>
        <RoutineCommand icon="replay" label="Reiniciar rotina" disabled={busy} onPress={() => {
          if (!isCurrent() || inFlight.current) return;
          const intent = {}; restartIntent.current = intent; setConfirmRestart(intent); setFailed(null);
        }} />
        {confirmRestart && <View style={styles.confirmation}>
          <Text accessibilityRole="alert" style={styles.text}>Reiniciar esta rotina? Todas as etapas ficarão pendentes.</Text>
          <RoutineCommand icon="replay" label="Confirmar reinício" disabled={busy} onPress={() => void progress('restart', confirmRestart)} />
          <RoutineCommand icon="close" label="Manter rotina concluída" disabled={busy} onPress={() => {
            if (!isCurrent() || inFlight.current || restartIntent.current !== confirmRestart) return;
            restartIntent.current = null; setConfirmRestart(null); if (failed?.action === 'restart') setFailed(null);
          }} />
        </View>}
      </> : <>
        <ExecutionStep label="Agora" step={execution.current} />
        <ExecutionStep label="Depois" step={execution.next} />
        <RoutineCommand icon="check" label="Concluir etapa atual" primary disabled={busy} onPress={() => void progress('complete')} />
      </>}
      <RoutineCommand icon="undo" label="Voltar à etapa anterior" disabled={busy || !execution.canGoBack} onPress={() => void progress('previous')} />
    </>}
    {failed && <>
      <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>Não foi possível salvar o progresso. O último progresso salvo foi mantido.</Text>
      <RoutineCommand icon="refresh" label="Tentar salvar progresso novamente" disabled={busy || unavailable} onPress={() => void progress(failed.action, failed.intent)} />
    </>}
    {busy && <Text accessibilityLiveRegion="polite" style={styles.text}>Salvando progresso…</Text>}
  </RoutinePage>;
}
function ExecutionStep({ label, step }: { label: string; step: RoutineStep | null }) {
  return <View style={{ gap: 12 }}>
    <Text accessibilityRole="header" style={styles.heading}>{label}</Text>
    {step ? <>
      {step.imageUri && <Image source={{ uri: step.imageUri }} accessible={false} resizeMode="contain" style={styles.image} />}
      <Text style={styles.label}>{step.title}</Text>
    </> : <Text style={styles.text}>Não há outra etapa depois desta.</Text>}
  </View>;
}
