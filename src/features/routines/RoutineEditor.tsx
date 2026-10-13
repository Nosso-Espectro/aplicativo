import { useRef, useState } from 'react';
import { Image, Text, TextInput, View } from 'react-native';
import { pickCardImage } from '../communication/custom-cards/media-picker';
import { newStep, validateRoutine, type Routine, type RoutineDraft, type RoutineStep } from './routine-model';
import { useRoutines } from './RoutineProvider';
import { RoutineCommand, RoutinePage, routineStyles as styles } from './RoutineUI';

export function RoutineEditor({ routine, onClose }: { routine?: Routine; onClose(): void }) {
  const context = useRoutines();
  const [draft, setDraft] = useState<RoutineDraft>({ name: routine?.name ?? '', steps: routine?.steps.map((step) => ({ ...step })) ?? [] });
  const [errors, setErrors] = useState<ReturnType<typeof validateRoutine>>({ name: null, steps: [] });
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const inFlight = useRef(false);
  const nameInput = useRef<TextInput>(null);
  const stepInputs = useRef(new Map<string, TextInput>());
  const unavailable = context.loading || Boolean(context.error);
  function editStep(id: string, change: Partial<RoutineStep>) {
    setDraft((value) => ({ ...value, steps: value.steps.map((step) => step.id === id ? { ...step, ...change } : step) }));
    setRemoving(null); setErrors({ name: null, steps: [] });
  }
  async function chooseImage(id: string, source: 'file' | 'camera') {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setMessage(null);
    try {
      const result = await pickCardImage(source);
      if (result.uri) editStep(id, { imageUri: result.uri });
      if (result.message) setMessage(result.message);
    } finally { inFlight.current = false; setBusy(false); }
  }
  async function save() {
    if (inFlight.current || unavailable) return;
    const validation = validateRoutine(draft);
    setErrors(validation); setMessage(null);
    if (validation.name || validation.steps.some(Boolean)) {
      if (validation.name) nameInput.current?.focus();
      else stepInputs.current.get(draft.steps[validation.steps.findIndex(Boolean)].id)?.focus();
      return;
    }
    inFlight.current = true; setBusy(true);
    try { await context.save(draft, routine?.id); onClose(); }
    catch { setMessage('Não foi possível salvar a rotina. Seu preenchimento foi mantido. Tente novamente ou cancele.'); }
    finally { inFlight.current = false; setBusy(false); }
  }
  return <RoutinePage>
    <RoutineCommand icon="arrow-back" label="Cancelar" disabled={busy} onPress={onClose} />
    <Text accessibilityRole="header" style={styles.heading}>{routine ? 'Editar rotina' : 'Nova rotina'}</Text>
    {context.loading && <Text accessibilityLiveRegion="polite" style={styles.text}>Abrindo rotinas…</Text>}
    {context.error && <Text accessibilityRole="alert" style={styles.error}>{context.error}</Text>}
    {context.error && <RoutineCommand icon="refresh" label="Tentar abrir rotinas novamente" disabled={busy} onPress={context.retry} />}
    <Text style={styles.label}>Nome</Text>
    <TextInput ref={nameInput} accessibilityLabel="Nome da rotina" value={draft.name} multiline
      editable={!busy && !unavailable} style={styles.input} onChangeText={(name) => { setDraft((value) => ({ ...value, name })); setErrors({ name: null, steps: [] }); }} />
    {errors.name && <Text accessibilityRole="alert" style={styles.error}>{errors.name}</Text>}
    <Text accessibilityRole="header" style={styles.label}>Etapas</Text>
    {draft.steps.length === 0 && <Text style={styles.text}>Ainda não há etapas nesta rotina.</Text>}
    {draft.steps.map((step, index) => <View key={step.id} style={styles.step}>
      <Text accessibilityRole="header" style={styles.label}>Etapa {index + 1}</Text>
      <Text style={styles.label}>Título</Text>
      <TextInput ref={(input) => { if (input) stepInputs.current.set(step.id, input); else stepInputs.current.delete(step.id); }}
        accessibilityLabel={`Título da etapa ${index + 1}`} multiline value={step.title} editable={!busy && !unavailable}
        onChangeText={(title) => editStep(step.id, { title })} style={styles.input} />
      {errors.steps[index] && <Text accessibilityRole="alert" style={styles.error}>{errors.steps[index]}</Text>}
      <Text style={styles.label}>Imagem (opcional)</Text>
      {step.imageUri && <Image source={{ uri: step.imageUri }} accessibilityLabel={`Imagem da etapa ${index + 1}`} resizeMode="contain" style={styles.image} />}
      <View style={styles.row}>
        <RoutineCommand icon="image" label={`Escolher imagem da etapa ${index + 1}`} disabled={busy || unavailable} onPress={() => void chooseImage(step.id, 'file')} />
        <RoutineCommand icon="photo-camera" label={`Usar câmera na etapa ${index + 1}`} disabled={busy || unavailable} onPress={() => void chooseImage(step.id, 'camera')} />
        {step.imageUri && <RoutineCommand icon="close" label={`Remover imagem da etapa ${index + 1}`} disabled={busy || unavailable} onPress={() => editStep(step.id, { imageUri: null })} />}
      </View>
      <RoutineCommand icon="delete-outline" label={`Remover etapa ${index + 1}`} disabled={busy || unavailable} onPress={() => setRemoving(step.id)} />
      {removing === step.id && <View style={styles.confirmation}>
        <Text accessibilityRole="alert" style={styles.text}>Remover esta etapa da rotina?</Text>
        <RoutineCommand icon="delete" label="Confirmar remoção da etapa" disabled={busy} onPress={() => {
          setDraft((value) => ({ ...value, steps: value.steps.filter((item) => item.id !== step.id) }));
          setErrors({ name: null, steps: [] }); setRemoving(null);
        }} />
        <RoutineCommand icon="close" label="Manter etapa" disabled={busy} onPress={() => setRemoving(null)} />
      </View>}
    </View>)}
    <RoutineCommand icon="add" label="Adicionar etapa" disabled={busy || unavailable} onPress={() => {
      const step = newStep(); setDraft((value) => ({ ...value, steps: [...value.steps, step] })); setRemoving(null);
    }} />
    {message && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{message}</Text>}
    {busy && <Text accessibilityLiveRegion="polite" style={styles.text}>Aguarde…</Text>}
    <RoutineCommand icon="save" label="Salvar rotina" primary disabled={busy || unavailable} onPress={() => void save()} />
  </RoutinePage>;
}
