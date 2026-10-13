import { Stack } from 'expo-router';
import { SentenceProvider } from '../features/communication/sentence/SentenceProvider';
import { CustomCardsProvider } from '../features/communication/custom-cards/CustomCardsProvider';
import { View } from 'react-native';
import { LowStimulationProvider, useLowStimulationPresentation } from '../features/regulation/LowStimulationProvider';
import { LowStimulationControl } from '../features/regulation/LowStimulationControl';

function ApplicationStack() {
  const { navigationAnimation } = useLowStimulationPresentation();
  return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
    <LowStimulationControl />
    <View style={{ flex: 1 }}><Stack screenOptions={{ headerShown: false, animation: navigationAnimation }} /></View>
  </View>;
}

export default function RootLayout() {
  return (
    <LowStimulationProvider><SentenceProvider>
      <CustomCardsProvider>
        <ApplicationStack />
      </CustomCardsProvider>
    </SentenceProvider></LowStimulationProvider>
  );
}
