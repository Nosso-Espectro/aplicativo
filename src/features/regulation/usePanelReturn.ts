import { useLocalSearchParams, useRouter } from 'expo-router';
import { isPanelOrigin } from './quick-panel';

export function usePanelReturn(defaultLabel: string) {
  const router = useRouter();
  const { origin } = useLocalSearchParams();
  return {
    backLabel: isPanelOrigin(origin) ? 'Voltar ao painel' : defaultLabel,
    onClose: () => router.canGoBack() ? router.back() : router.replace('/'),
  };
}
