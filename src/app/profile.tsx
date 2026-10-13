import { useRouter } from 'expo-router';
import { PreferencesScreen } from '../features/communication-profile/PreferencesScreen';

export default function ProfileScreen() {
  const router = useRouter();
  return <PreferencesScreen onClose={() => router.canGoBack() ? router.back() : router.replace('/')} onOpenSupport={() => router.push('/support-preferences')} />;
}
