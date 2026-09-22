import { useEffect, useState } from 'react';
import { Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchSets } from '@/api';
import type { PaginatedSets } from '@/types';

type FetchState = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export default function HomeScreen() {
  const [page, setPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState<FetchState>('idle');
  const [data, setData] = useState<PaginatedSets | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadSets() {
      setState('loading');
      setError('');

      try {
        const response = await fetchSets(page, controller.signal);
        if (controller.signal.aborted) return;

        setData(response);
        setState(response.items.length === 0 ? 'empty' : 'success');
      } catch (caughtError) {
        if (controller.signal.aborted) return;

        setData(null);
        setError(caughtError instanceof Error ? caughtError.message : 'Request failed');
        setState('error');
      }
    }

    void loadSets();
    return () => controller.abort();
  }, [page, retryCount]);

  const canGoPrevious = page > 1;
  const canGoNext = data !== null && data.page * data.limit < data.total;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>BrickList</Text>

        {state === 'loading' && <Text>Loading sets…</Text>}

        {(state === 'success' || state === 'empty') && data && (
          <>
            {state === 'empty' ? (
              <Text>No sets found.</Text>
            ) : (
              data.items.map((set) => (
                <View key={set.setNumber} style={styles.setCard}>
                  <Image
                    accessibilityLabel={`${set.name} image`}
                    source={{ uri: set.imageUrl }}
                    style={styles.image}
                  />
                  <Text>{set.setNumber}</Text>
                  <Text style={styles.setName}>{set.name}</Text>
                  <Text>{set.theme}</Text>
                  <Text>{set.year}</Text>
                  <Text>{set.pieceCount} pieces</Text>
                </View>
              ))
            )}

            <View style={styles.pagination}>
              <Button disabled={!canGoPrevious} onPress={() => setPage((current) => current - 1)} title="Previous" />
              <Text>Page {data.page}</Text>
              <Button disabled={!canGoNext} onPress={() => setPage((current) => current + 1)} title="Next" />
            </View>
          </>
        )}

        {state === 'error' && (
          <View style={styles.error}>
            <Text>Could not load sets: {error}</Text>
            <Button onPress={() => setRetryCount((count) => count + 1)} title="Retry" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { gap: 16, padding: 16 },
  title: { fontSize: 28, fontWeight: '700' },
  setCard: { gap: 4, borderColor: '#d1d5db', borderWidth: 1, borderRadius: 8, padding: 12 },
  image: { width: '100%', height: 180, resizeMode: 'contain' },
  setName: { fontWeight: '600' },
  pagination: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  error: { gap: 12 },
});
