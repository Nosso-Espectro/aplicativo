import { useCallback, useEffect, useRef } from 'react';
import { AccessibilityInfo, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, findNodeHandle } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import appIcon from '../../../../assets/branding/tear-icon.png';
import { CommunicationBoard, type BoardProps } from './CommunicationBoard';
import { useLowStimulationPresentation } from '../../regulation/LowStimulationProvider';

function focus(ref: View | null) {
  if (!ref) return;
  if (Platform.OS === 'web') { ref.focus(); return; }
  const tag = findNodeHandle(ref);
  if (tag !== null) AccessibilityInfo.setAccessibilityFocus(tag);
}

type HomeProps = BoardProps & { drawerOpen: boolean; onDrawerChange(open: boolean): void };
export function CommunicationHome({ navigation, sentence, drawerOpen: open, onDrawerChange: setOpen, ...board }: HomeProps) {
  const menu = useRef<View>(null); const close = useRef<View>(null);
  const wasOpen = useRef(false);
  const focused = useRef(true);
  const { showBrandImage } = useLowStimulationPresentation();
  useEffect(() => {
    if (wasOpen.current && !open && focused.current) focus(menu.current);
    wasOpen.current = open;
  }, [open]);
  useFocusEffect(useCallback(() => {
    focused.current = true;
    return () => { focused.current = false; setOpen(false); };
  }, [setOpen]));
  return <SafeAreaView style={styles.screen}>
    <View style={styles.home} aria-hidden={open} accessibilityElementsHidden={open} importantForAccessibility={open ? 'no-hide-descendants' : 'auto'}>
      <ScrollView style={styles.header} contentContainerStyle={styles.headerContent}>
        <View style={styles.brand}>
          <Pressable ref={menu} accessibilityRole="button" accessibilityLabel="Abrir ferramentas" accessibilityState={{ expanded: open }}
            onPress={() => setOpen(true)} style={styles.icon}>
            <MaterialIcons name="menu" size={28} color="#16634D" accessible={false} />
          </Pressable>
          {showBrandImage && <Image source={appIcon} accessible={false} style={styles.logo} />}
          <Text accessibilityRole="header" style={styles.title}>TEAr</Text>
        </View>
        {sentence}
      </ScrollView>
      <CommunicationBoard {...board} showBrand={false} embedded />
    </View>
    <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}
      onShow={() => { if (open && focused.current) focus(close.current); }}
      onDismiss={() => { if (!open && focused.current) focus(menu.current); }}>
      <View style={styles.overlay} accessibilityViewIsModal>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar ferramentas tocando fora" onPress={() => setOpen(false)} style={styles.backdrop} />
        <SafeAreaView style={styles.drawer}>
          <Pressable ref={close} accessibilityRole="button" accessibilityLabel="Fechar ferramentas" onPress={() => setOpen(false)} style={styles.close}>
            <MaterialIcons name="close" size={24} color="#16634D" accessible={false} /><Text style={styles.closeText}>Fechar</Text>
          </Pressable>
          <Text accessibilityRole="header" style={styles.drawerHeading}>Ferramentas</Text>
          <ScrollView contentContainerStyle={styles.actions}>{navigation}</ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' }, home: { flex: 1 },
  header: { maxHeight: '55%', flexGrow: 0, borderBottomWidth: 1, borderBottomColor: '#72777D' },
  headerContent: { padding: 20, gap: 12, width: '100%', maxWidth: 720, alignSelf: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  icon: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' }, logo: { width: 48, height: 48 },
  title: { color: '#16634D', fontSize: 24, fontWeight: '700' },
  actions: { padding: 20, paddingTop: 0, width: '100%' },
  overlay: { flex: 1 }, backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#00000066' },
  drawer: { height: '100%', width: '92%', maxWidth: 440, backgroundColor: '#FFFFFF' },
  close: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, marginHorizontal: 20 },
  drawerHeading: { color: '#202124', fontSize: 26, fontWeight: '600', padding: 20 },
  closeText: { color: '#16634D', fontSize: 18, fontWeight: '600', flexShrink: 1 },
});
