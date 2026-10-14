import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScriptEditor } from '../../../features/communication-scripts/ScriptEditor';
import { useScripts } from '../../../features/communication-scripts/ScriptProvider';
import { ScriptUnavailable } from '../../../features/communication-scripts/ScriptUnavailable';
export default function EditScriptRoute() {
  const { id } = useLocalSearchParams(); const context = useScripts(); const router = useRouter();
  const script = context.personal.find(item => item.id === id);
  if (!script) return <ScriptUnavailable />;
  const close = () => router.replace({ pathname: '/scripts/[source]/[id]', params: { source: 'personal', id: script.id } });
  return <ScriptEditor key={script.id} script={script} onClose={close} onSaved={close} />;
}
