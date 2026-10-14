import { useRouter } from 'expo-router';
import { ScriptCatalogScreen } from '../../features/communication-scripts/ScriptCatalogScreen';
export default function ScriptsRoute() {
  const router = useRouter();
  return <ScriptCatalogScreen onClose={() => router.replace('/')} />;
}
