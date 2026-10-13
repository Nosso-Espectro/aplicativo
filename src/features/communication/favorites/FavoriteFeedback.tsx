import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCustomCards } from '../custom-cards/CustomCardsProvider';

export function FavoriteFeedback() {
  const { favoriteError, favoriteBusy, retryFavorite } = useCustomCards();
  if (!favoriteError) return null;
  return <View style={styles.feedback}>
    <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>Não foi possível salvar os favoritos. A ordem salva foi mantida.</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Tentar salvar favoritos novamente"
      disabled={favoriteBusy} accessibilityState={{ disabled: favoriteBusy }} onPress={retryFavorite} style={styles.retry}>
      <MaterialIcons name="refresh" size={24} color="#16634D" accessible={false} />
      <Text style={styles.label}>Tentar novamente</Text>
    </Pressable>
  </View>;
}
const styles = StyleSheet.create({
  feedback: { gap: 8 }, error: { color: '#92322D', fontSize: 18 },
  retry: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  label: { fontSize: 18, color: '#16634D', flexShrink: 1 },
});
