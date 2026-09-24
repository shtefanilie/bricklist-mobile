import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFavourites } from '@/hooks/useFavourites';

export default function AccountScreen() {
  const { favourites } = useFavourites();
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>BRICKLIST</Text>
        <Text style={styles.title}>Find the set that clicks.</Text>
        <Text style={styles.body}>Here you will see your favourite sets</Text>
        {favourites.length === 0 ? (
          <Text>No favourites yet. Save a set from the Sets tab.</Text>
        ) : favourites.map((set) => (
          <View key={set.setNumber} style={styles.favourite}>
            <Text style={styles.setName}>{set.name}</Text>
            <Text>{set.setNumber}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flexGrow: 1, gap: 16, padding: 32 },
  eyebrow: { color: '#dc2626', fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  title: { fontSize: 38, fontWeight: '800', letterSpacing: -1.5, lineHeight: 42 },
  body: { color: '#4b5563', fontSize: 18, lineHeight: 27 },
  favourite: { borderColor: '#d1d5db', borderRadius: 8, borderWidth: 1, gap: 4, padding: 12 },
  setName: { fontWeight: '600' },
});
