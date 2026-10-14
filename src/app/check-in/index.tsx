import { useRouter } from 'expo-router';
import { CheckInForm } from '../../features/sensory-check-in/CheckInForm';
export default function CheckInScreen() {
  const router = useRouter();
  return <CheckInForm onExit={() => router.replace('/')} />;
}
