import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import type { SetRecord } from '@/types';

type SetCardProps = {
  isGrid: boolean;
  set: SetRecord;
};

export function SetCard({ isGrid, set }: SetCardProps) {
  return (
    <View style={[styles.card, isGrid && styles.gridCard]}>
      <Image
        accessibilityLabel={`${set.name} image`}
        contentFit="contain"
        recyclingKey={set.setNumber}
        source={{ uri: set.imageUrl }}
        style={styles.image}
        transition={200}
      />
      <Text>{set.setNumber}</Text>
      <Text style={styles.name}>{set.name}</Text>
      <Text>{set.theme}</Text>
      <Text>{set.year}</Text>
      <Text>{set.pieceCount} pieces</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 4, borderColor: '#d1d5db', borderWidth: 1, borderRadius: 8, margin: 6, padding: 12 },
  gridCard: { flex: 1 },
  image: { backgroundColor: '#f3f4f6', height: 180, width: '100%' },
  name: { fontWeight: '600' },
});
