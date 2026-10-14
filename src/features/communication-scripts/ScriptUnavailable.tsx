import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useScripts } from './ScriptProvider';
import { ScriptCommand, ScriptPage, ScriptStorageStatus, scriptStyles as styles } from './ScriptUI';
export function ScriptUnavailable() {
  const context = useScripts(); const router = useRouter();
  return <ScriptPage><ScriptStorageStatus />
    {!context.loading && !context.error && <Text style={styles.text}>Script não encontrado.</Text>}
    <ScriptCommand label="Voltar aos scripts" icon="arrow-back" onPress={() => router.replace('/scripts')} />
    <ScriptCommand label="Voltar ao quadro" icon="home" onPress={() => router.replace('/')} />
  </ScriptPage>;
}
