import { useLocalSearchParams, useRouter } from 'expo-router';
import { initialScripts } from '../../../features/communication-scripts/script-catalog';
import { draftFromInitialScript } from '../../../features/communication-scripts/personal-script-model';
import { ScriptEditor } from '../../../features/communication-scripts/ScriptEditor';
import { ScriptUnavailable } from '../../../features/communication-scripts/ScriptUnavailable';
export default function CopyScriptRoute() {
  const { id } = useLocalSearchParams(); const router = useRouter(); const script = initialScripts.find(item => item.id === id);
  if (!script) return <ScriptUnavailable />;
  return <ScriptEditor key={script.id} initial={draftFromInitialScript(script)}
    onClose={() => router.replace({ pathname: '/scripts/[source]/[id]', params: { source: 'initial', id: script.id } })}
    onSaved={saved => router.replace({ pathname: '/scripts/[source]/[id]', params: { source: 'personal', id: saved.id } })} />;
}
