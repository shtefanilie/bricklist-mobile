import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import type { SetRecord } from '@/types';

type SetCardProps = {
  isGrid: boolean;
  set: SetRecord;
};

export function SetCard({ isGrid, set }: SetCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
  }, []);

  function revealImageAfterRandomDelay() {
    if (revealTimer.current) clearTimeout(revealTimer.current);
    revealTimer.current = setTimeout(() => setImageLoaded(true), Math.floor(Math.random() * 1001));
  }

  return (
    <View style={[styles.card, isGrid && styles.gridCard]}>
      <Image
        accessibilityLabel={`${set.name} image`}
        onLoadEnd={revealImageAfterRandomDelay}
        source={{ uri: set.imageUrl }}
        style={[styles.image, { height: imageLoaded ? 180 : 0 }]}
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
  card: { gap: 4, borderColor: '#d1d5db', borderWidth: 1, borderRadius: 8, padding: 12 },
  gridCard: { width: '48%' },
  image: { width: '100%', resizeMode: 'contain' },
  name: { fontWeight: '600' },
});
