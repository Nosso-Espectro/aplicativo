import { useRouter } from 'expo-router';
import { RegulationSoundsScreen } from '../features/regulation-sounds/RegulationSoundsScreen';
export default function RegulationSoundsRoute() {
  const router = useRouter();
  return <RegulationSoundsScreen onClose={() => router.canGoBack() ? router.back() : router.replace('/')} />;
}
