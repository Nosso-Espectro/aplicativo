import { usePanelReturn } from '../features/regulation/usePanelReturn';
import { RegulationSoundsScreen } from '../features/regulation-sounds/RegulationSoundsScreen';
export default function RegulationSoundsRoute() {
  return <RegulationSoundsScreen {...usePanelReturn('Voltar ao quadro')} />;
}
