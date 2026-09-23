import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>BRICKLIST</Text>
        <Text style={styles.title}>Find the set that clicks.</Text>
        <Text style={styles.body}>Here you will see your favourite sets</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flex: 1, gap: 16, justifyContent: 'center', padding: 32 },
  eyebrow: { color: '#dc2626', fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  title: { fontSize: 38, fontWeight: '800', letterSpacing: -1.5, lineHeight: 42 },
  body: { color: '#4b5563', fontSize: 18, lineHeight: 27 },
});
