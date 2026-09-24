import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fetchSet } from '@/api';
import type { SetRecord } from '@/types';

export function SetDetailScreen() {
  const { setNumber } = useLocalSearchParams<{ setNumber: string }>();
  const [set, setSet] = useState<SetRecord | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError('');
      try {
        const result = await fetchSet(setNumber, controller.signal);
        if (!controller.signal.aborted) setSet(result);
      } catch (caughtError) {
        if (!controller.signal.aborted) setError(caughtError instanceof Error ? caughtError.message : 'Request failed');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [setNumber, retryCount]);

  return (
    <>
      <Stack.Screen options={{ title: set?.name ?? 'Set details' }} />
      <ScrollView contentContainerStyle={styles.content}>
        {loading && <Text>Loading set…</Text>}
        {!loading && error !== '' && (
          <View style={styles.status}>
            <Text>Could not load set: {error}</Text>
            <Button onPress={() => setRetryCount((count) => count + 1)} title="Retry" />
          </View>
        )}
        {!loading && error === '' && set && (
          <View style={styles.details}>
            <Image accessibilityLabel={`${set.name} image`} contentFit="contain" source={{ uri: set.imageUrl }} style={styles.image} />
            <Text style={styles.title}>{set.name}</Text>
            <Text>Set number: {set.setNumber}</Text>
            <Text>Theme: {set.theme}</Text>
            <Text>Year: {set.year}</Text>
            <Text>Pieces: {set.pieceCount}</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: 20 },
  details: { gap: 12 },
  image: { width: '100%', height: 260 },
  title: { fontSize: 28, fontWeight: '700' },
  status: { gap: 12 },
});
