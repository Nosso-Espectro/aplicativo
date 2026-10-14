import { HydrationScreen } from '../features/hydration/HydrationScreen';
import { usePanelReturn } from '../features/regulation/usePanelReturn';
export default function HydrationRoute() {
  return <HydrationScreen {...usePanelReturn('Voltar ao quadro')} />;
}
