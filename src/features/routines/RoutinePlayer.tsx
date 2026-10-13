import { useRef, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useRoutines } from './RoutineProvider';
import { routineExecution, type ProgressAction } from './routine-execution';
import { RoutineCommand, RoutinePage, routineStyles as styles } from './RoutineUI';
import type { RoutineStep } from './routine-model';

export function RoutinePlayer({ id, onClose, onEdit }: { id: string; onClose(): void; onEdit(): void }) {
  const context = useRoutines();
  const routine = context.routines.find((item) => item.id === id);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<ProgressAction | null>(null);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const inFlight = useRef(false);
  const unavailable = context.loading || Boolean(context.error) || !routine;
  const execution = routineExecution(routine?.steps ?? []);
  async function progress(action: ProgressAction) {
    if (inFlight.current || unavailable) return;
    inFlight.current = true; setBusy(true);
    try { await context.progress(id, action); setFailed(null); setConfirmRestart(false); }
    catch { setFailed(action); }
    finally { inFlight.current = false; setBusy(false); }
  }
  return <RoutinePage>
    <RoutineCommand icon="arrow-back" label="Voltar às rotinas" disabled={busy} onPress={onClose} />
    <Text accessibilityRole="header" style={styles.heading}>{routine?.name ?? 'Rotina'}</Text>
    {context.loading && <Text accessibilityLiveRegion="polite" style={styles.text}>Abrindo rotina…</Text>}
    {context.error && <Text accessibilityRole="alert" style={styles.error}>{context.error}</Text>}
    {context.error && <RoutineCommand icon="refresh" label="Tentar abrir rotinas novamente" onPress={context.retry} />}
    {!context.loading && !context.error && !routine && <Text accessibilityRole="alert" style={styles.error}>Rotina não encontrada.</Text>}
    {!unavailable && routine.steps.length === 0 && <>
      <Text style={styles.text}>Esta rotina ainda não tem etapas.</Text>
      <RoutineCommand icon="edit" label="Editar rotina" onPress={onEdit} />
    </>}
    {!unavailable && routine.steps.length > 0 && <>
      {execution.done ? <>
        <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.heading}>Rotina concluída</Text>
        <RoutineCommand icon="replay" label="Reiniciar rotina" disabled={busy} onPress={() => setConfirmRestart(true)} />
        {confirmRestart && <View style={styles.confirmation}>
          <Text accessibilityRole="alert" style={styles.text}>Reiniciar esta rotina? Todas as etapas ficarão pendentes.</Text>
          <RoutineCommand icon="replay" label="Confirmar reinício" disabled={busy} onPress={() => void progress('restart')} />
          <RoutineCommand icon="close" label="Manter rotina concluída" disabled={busy} onPress={() => {
            setConfirmRestart(false); if (failed === 'restart') setFailed(null);
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
      <RoutineCommand icon="refresh" label="Tentar salvar progresso novamente" disabled={busy || unavailable} onPress={() => void progress(failed)} />
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
