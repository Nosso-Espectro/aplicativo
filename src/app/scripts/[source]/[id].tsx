import { useLocalSearchParams, useRouter } from 'expo-router';
import { initialScripts } from '../../../features/communication-scripts/script-catalog';
import { useScripts } from '../../../features/communication-scripts/ScriptProvider';
import { ScriptDetail } from '../../../features/communication-scripts/ScriptDetail';
import { ScriptUnavailable } from '../../../features/communication-scripts/ScriptUnavailable';
export default function ScriptDetailRoute() {
  const { source, id } = useLocalSearchParams(); const context = useScripts(); const router = useRouter();
  const script = source === 'initial' ? initialScripts.find(item => item.id === id)
    : source === 'personal' ? context.personal.find(item => item.id === id) : undefined;
  if (!script) return <ScriptUnavailable />;
  const refValue = source === 'initial' ? { source: 'initial' as const, id: script.id }
    : { source: 'personal' as const, id: script.id, revision: 'revision' in script ? script.revision : 0 };
  return <ScriptDetail key={`${source}:${script.id}:${'revision' in script ? script.revision : 'initial'}`} script={script} refValue={refValue}
    onClose={() => router.replace('/scripts')} onEdit={() => router.push({ pathname: '/scripts/edit/[id]', params: { id: script.id } })}
    onCopy={() => router.push({ pathname: '/scripts/copy/[id]', params: { id: script.id } })} />;
}
