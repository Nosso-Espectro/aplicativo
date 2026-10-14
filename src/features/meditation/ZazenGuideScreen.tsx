import { useCallback, useLayoutEffect, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getZazenGuide } from './zazen-guide';

export function ZazenGuideScreen({ onClose, backLabel, content }: { onClose(): void; backLabel: string; content?: unknown }) {
  const guide = content === undefined ? getZazenGuide() : getZazenGuide(content);
  const closeRef = useRef(onClose); useLayoutEffect(() => { closeRef.current = onClose; });
  useFocusEffect(useCallback(() => {
    let focused = true;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!focused) return false;
      closeRef.current(); return true;
    });
    return () => { focused = false; subscription.remove(); };
  }, []));
  return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.content}>
    <Pressable accessibilityRole="button" accessibilityLabel={backLabel} onPress={onClose} style={styles.command}>
      <MaterialIcons name="arrow-back" size={24} color="#16634D" accessible={false} /><Text style={styles.commandText}>{backLabel}</Text>
    </Pressable>
    <Text accessibilityRole="header" style={styles.heading}>Guia de Zazen</Text>
    {!guide ? <Text accessibilityRole="alert" style={styles.body}>O guia não está disponível nesta versão.</Text> : <>
      <Text style={styles.body}>{guide.introduction}</Text>
      {guide.sections.map(section => <View key={section.id} style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionHeading}>{section.heading}</Text>
        <Text style={styles.body}>{section.body}</Text>
      </View>)}
      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionHeading}>Referências</Text>
        <Text style={styles.body}>Redação introdutória original do TEAr.</Text>
        {guide.sources.map((source, index) => <Text key={index} style={styles.body}>{source.publisher}: {source.title}. Consulta: {source.checkedOn}.</Text>)}
      </View>
    </>}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, gap: 24, width: '100%', maxWidth: 720, alignSelf: 'center' },
  command: { minHeight: 48, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  commandText: { fontSize: 18, color: '#16634D', flexShrink: 1 },
  heading: { fontSize: 26, fontWeight: '600', color: '#202124' },
  section: { gap: 8 }, sectionHeading: { fontSize: 22, fontWeight: '600', color: '#202124' },
  body: { fontSize: 18, lineHeight: 28, color: '#202124', flexShrink: 1 },
});
