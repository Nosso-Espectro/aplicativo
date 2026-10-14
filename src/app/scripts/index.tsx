import { useRouter } from 'expo-router';
import { ScriptCatalogScreen } from '../../features/communication-scripts/ScriptCatalogScreen';
export default function ScriptsRoute() {
  const router = useRouter();
  return <ScriptCatalogScreen onClose={() => router.replace('/')} onNew={() => router.push('/scripts/new')}
    onOpen={ref => router.push({ pathname: '/scripts/[source]/[id]', params: { source: ref.source, id: ref.id } })} />;
}
