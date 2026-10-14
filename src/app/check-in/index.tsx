import { useRouter } from 'expo-router';
import { CheckInForm } from '../../features/sensory-check-in/CheckInForm';
import type { CheckInTool } from '../../features/sensory-check-in/check-in-summary';
const toolRoutes = { water: '/check-in/water', regulation: '/regulation', 'trusted-contact': '/trusted-contact' } as const;
export default function CheckInScreen() {
  const router = useRouter();
  return <CheckInForm onExit={() => router.replace('/')}
    onOpenTool={(tool: CheckInTool) => router.replace(toolRoutes[tool])} />;
}
