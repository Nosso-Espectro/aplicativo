import { usePanelReturn } from '../features/regulation/usePanelReturn';
import { TrustedContactScreen } from '../features/support-plan/TrustedContactScreen';

export default function TrustedContactRoute() {
  return <TrustedContactScreen {...usePanelReturn('Cancelar e voltar')} />;
}
