import { useRouter } from 'expo-router';
import { ProfileSummaryScreen } from '../features/communication-profile/ProfileSummaryScreen';

export default function ProfileSummaryRoute() {
  const router = useRouter();
  return <ProfileSummaryScreen onClose={() => router.canGoBack() ? router.back() : router.replace('/profile-summary')} />;
}
