import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useProgressAlerts } from './ProgressAlertsProvider';
import { normalizedProgressAlerts, progressMarks, type ProgressAlertPreferences } from './progress-alerts';

export function ProgressAlertSettings() {
  const alerts = useProgressAlerts();
  const [editing, setEditing] = useState(false); const [saved, setSaved] = useState(false);
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  if (!alerts) return null;
  async function disableAll() {
    if (!alerts?.snapshot || alerts.busy || alerts.loading) return;
    setSaved(false);
    const confirmed = await alerts.save({ ...alerts.snapshot.preferences, enabled: false, systemNotifications: false });
    if (active.current && confirmed) { setEditing(false); setSaved(true); }
  }
  return <View style={styles.section}>
    <Text accessibilityRole="header" style={styles.heading}>Avisos progressivos</Text>
    {alerts.loading && <Text accessibilityLiveRegion="polite" style={styles.text}>Abrindo avisos…</Text>}
    {alerts.error && <>
      <Text accessibilityRole="alert" style={styles.text}>Não foi possível confirmar os avisos. Suas escolhas foram preservadas.</Text>
      <Command icon="refresh" label="Tentar avisos novamente" disabled={alerts.busy || alerts.loading} onPress={alerts.retry} />
    </>}
    {!alerts.loading && alerts.snapshot && <>
      {editing ? <AlertEditor initial={alerts.snapshot.preferences} onCancel={() => setEditing(false)} onSaved={() => { setEditing(false); setSaved(true); }} /> : <>
        <Text style={styles.text}>{alerts.snapshot.preferences.enabled ? 'Avisos ativados' : 'Avisos desativados'}</Text>
        <Command icon="edit" label="Configurar avisos" disabled={alerts.busy} onPress={() => { setSaved(false); setEditing(true); }} />
        <Command icon="notifications-off" label="Desabilitar todos os avisos" disabled={alerts.busy} onPress={() => void disableAll()} />
      </>}
    </>}
    {alerts.busy && <Text accessibilityLiveRegion="polite" style={styles.text}>Confirmando avisos…</Text>}
    {saved && !alerts.error && <Text accessibilityLiveRegion="polite" style={styles.text}>Avisos salvos.</Text>}
  </View>;
}

function AlertEditor({ initial, onCancel, onSaved }: { initial: ProgressAlertPreferences; onCancel(): void; onSaved(): void }) {
  const alerts = useProgressAlerts()!;
  const [draft, setDraft] = useState(() => normalizedProgressAlerts(initial));
  const [askingSystem, setAskingSystem] = useState(false);
  const [saving, setSaving] = useState(false);
  const systemConfirmed = useRef(false); const active = useRef(true); const pending = useRef(false); const request = useRef(0);
  useEffect(() => { active.current = true; return () => { active.current = false; request.current += 1; }; }, []);
  function cancel() { active.current = false; request.current += 1; onCancel(); }
  function cancelSystem() { request.current += 1; setAskingSystem(false); }
  async function confirmSystem() {
    if (pending.current || alerts.busy) return;
    pending.current = true; const token = ++request.current;
    const allowed = await alerts.requestSystemPermission(); pending.current = false;
    if (!active.current || token !== request.current) return;
    setAskingSystem(false);
    if (allowed) { systemConfirmed.current = true; setDraft(current => ({ ...current, systemNotifications: true })); }
  }
  async function save() {
    if (pending.current || alerts.busy || askingSystem) return;
    pending.current = true; setSaving(true);
    const confirmed = await alerts.save(draft, systemConfirmed.current); pending.current = false;
    if (active.current) { setSaving(false); if (confirmed) onSaved(); }
  }
  return <View style={styles.editor}>
    <View style={styles.toggle}><Text style={styles.label}>Avisos progressivos</Text>
      <Switch accessibilityLabel="Ativar avisos progressivos" value={draft.enabled} disabled={alerts.busy} style={styles.switch}
        onValueChange={enabled => setDraft(current => ({ ...current, enabled }))} />
    </View>
    {progressMarks.map(minutes => {
      const checked = draft.marks.includes(minutes);
      return <Pressable key={minutes} accessibilityRole="checkbox" accessibilityLabel={`Avisar com ${minutes} minutos restantes`}
        accessibilityState={{ checked, disabled: alerts.busy }} disabled={alerts.busy}
        style={styles.command} onPress={() => setDraft(current => normalizedProgressAlerts({ ...current,
          marks: current.marks.includes(minutes) ? current.marks.filter(mark => mark !== minutes) : [...current.marks, minutes] }))}>
        <MaterialIcons name={checked ? 'check-box' : 'check-box-outline-blank'} size={24} color="#16634D" accessible={false} />
        <Text style={styles.label}>{minutes} minutos</Text>
      </Pressable>;
    })}
    <View style={styles.toggle}><Text style={styles.label}>Avisos do sistema</Text>
      <Switch accessibilityLabel="Avisos do sistema" value={draft.systemNotifications} disabled={alerts.busy} style={styles.switch}
        onValueChange={value => {
          if (value) setAskingSystem(true);
          else { cancelSystem(); systemConfirmed.current = false; setDraft(current => ({ ...current, systemNotifications: false })); }
        }} />
    </View>
    {askingSystem && <View style={styles.confirmation}>
      <Text style={styles.text}>Os avisos poderão aparecer com o app em segundo plano ou a tela bloqueada. Som e vibração seguem as configurações do sistema e do TEAr.</Text>
      <Command icon="notifications" label="Permitir avisos do sistema" disabled={alerts.busy} onPress={() => void confirmSystem()} />
      <Command icon="close" label="Não ativar avisos do sistema" onPress={cancelSystem} />
    </View>}
    <Command icon="save" label="Salvar avisos" disabled={alerts.busy || askingSystem} onPress={() => void save()} />
    <Command icon="close" label="Cancelar edição dos avisos" disabled={saving} onPress={cancel} />
  </View>;
}
function Command({ icon, label, onPress, disabled = false }: { icon: ComponentProps<typeof MaterialIcons>['name']; label: string; onPress(): void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.command, pressed && styles.pressed]}>
    <MaterialIcons name={icon} size={24} color={disabled ? '#72777D' : '#16634D'} accessible={false} />
    <Text style={[styles.label, disabled && styles.disabled]}>{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  section: { borderTopWidth: 1, borderTopColor: '#72777D', paddingTop: 20, gap: 12 },
  heading: { color: '#202124', fontSize: 22, fontWeight: '600' }, text: { color: '#303438', fontSize: 18 },
  editor: { gap: 12 }, label: { color: '#16634D', fontSize: 18, flexShrink: 1 },
  toggle: { minHeight: 48, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  switch: { minHeight: 48, minWidth: 48 },
  command: { minHeight: 48, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center' },
  confirmation: { borderTopWidth: 1, borderTopColor: '#72777D', paddingTop: 12, gap: 12 },
  disabled: { color: '#72777D' }, pressed: { opacity: 0.7 },
});
