import { useRouter } from 'expo-router';
import { QuickPanelScreen } from '../features/regulation/QuickPanelScreen';
import { panelDestination } from '../features/regulation/quick-panel';

export default function RegulationRoute() {
  const router = useRouter();
  return <QuickPanelScreen onClose={() => router.canGoBack() ? router.back() : router.replace('/')}
    onOpen={id => {
      const destination = panelDestination(id);
      if (destination.id === 'communication') router.replace('/');
      else router.push({ pathname: destination.path, params: { origin: 'regulation' } });
    }} />;
}
