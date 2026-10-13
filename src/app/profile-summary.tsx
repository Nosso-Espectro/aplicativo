import { useRouter } from 'expo-router';
import { SummarySelectionScreen } from '../features/communication-profile/ProfileSummaryScreen';

export default function SummarySelectionRoute() {
  const router = useRouter();
  return <SummarySelectionScreen onClose={() => router.canGoBack() ? router.back() : router.replace('/profile')}
    onPresent={() => router.push('/profile-summary-view')} />;
}
