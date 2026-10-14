import { Stack } from 'expo-router';
import { SentenceProvider } from '../features/communication/sentence/SentenceProvider';
import { CustomCardsProvider } from '../features/communication/custom-cards/CustomCardsProvider';
import { View } from 'react-native';
import { LowStimulationProvider, useLowStimulationPresentation } from '../features/regulation/LowStimulationProvider';
import { LowStimulationControl } from '../features/regulation/LowStimulationControl';
import { TransitionTimerProvider } from '../features/transition-timer/TransitionTimerProvider';
import { RegulationSoundsProvider } from '../features/regulation-sounds/RegulationSoundsProvider';
import { ProgressAlertsProvider } from '../features/transition-timer/ProgressAlertsProvider';
import { ProgressAlertNotice } from '../features/transition-timer/ProgressAlertNotice';
import { HydrationProvider } from '../features/hydration/HydrationProvider';
import { HydrationNotice } from '../features/hydration/HydrationNotice';

function ApplicationStack() {
  const { navigationAnimation } = useLowStimulationPresentation();
  return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
    <LowStimulationControl />
    <ProgressAlertNotice />
    <HydrationNotice />
    <View style={{ flex: 1 }}><Stack screenOptions={{ headerShown: false, animation: navigationAnimation }} /></View>
  </View>;
}

export default function RootLayout() {
  return (
    <LowStimulationProvider><SentenceProvider>
      <CustomCardsProvider>
        <RegulationSoundsProvider><TransitionTimerProvider><ProgressAlertsProvider><HydrationProvider><ApplicationStack /></HydrationProvider></ProgressAlertsProvider></TransitionTimerProvider></RegulationSoundsProvider>
      </CustomCardsProvider>
    </SentenceProvider></LowStimulationProvider>
  );
}
