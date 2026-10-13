import { useRouter } from 'expo-router';
import { SupportPreferencesScreen } from '../features/communication-profile/SupportPreferencesScreen';

export default function SupportPreferencesRoute() {
  const router = useRouter();
  return <SupportPreferencesScreen onClose={() => router.canGoBack() ? router.back() : router.replace('/profile')} />;
}
