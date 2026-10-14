import { useRouter } from 'expo-router';
import { ScriptEditor } from '../../features/communication-scripts/ScriptEditor';
export default function NewScriptRoute() {
  const router = useRouter();
  return <ScriptEditor onClose={() => router.replace('/scripts')}
    onSaved={script => router.replace({ pathname: '/scripts/[source]/[id]', params: { source: 'personal', id: script.id } })} />;
}
