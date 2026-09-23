import { useEffect, useRef, useState } from 'react';
import { Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchSets } from '@/api';
import type { PaginatedSets, SetRecord } from '@/types';

type FetchState = 'idle' | 'loading' | 'success' | 'empty' | 'error';

function SetCard({ isGrid, set }: { isGrid: boolean; set: SetRecord }) {
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
    <View style={[styles.setCard, isGrid && styles.gridCard]}>
      <Image
        accessibilityLabel={`${set.name} image`}
        onLoadEnd={revealImageAfterRandomDelay}
        source={{ uri: set.imageUrl }}
        style={[styles.image, { height: imageLoaded ? 180 : 0 }]}
      />
      <Text>{set.setNumber}</Text>
      <Text style={styles.setName}>{set.name}</Text>
      <Text>{set.theme}</Text>
      <Text>{set.year}</Text>
      <Text>{set.pieceCount} pieces</Text>
    </View>
  );
}

export default function HomeScreen() {
  const [page, setPage] = useState(1);
  const [seed] = useState(() => Math.floor(Math.random() * 2_147_483_647) + 1);
  const [isGrid, setIsGrid] = useState(true);
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
        const response = await fetchSets(page, seed, controller.signal);
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
  }, [page, retryCount, seed]);

  const canGoPrevious = page > 1;
  const canGoNext = data !== null && data.page * data.limit < data.total;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>BrickList</Text>
          <Button
            onPress={() => setIsGrid((current) => !current)}
            title={isGrid ? 'List view' : 'Grid view'}
          />
        </View>

        {state === 'loading' && <Text>Loading sets…</Text>}

        {(state === 'success' || state === 'empty') && data && (
          <>
            {state === 'empty' ? (
              <Text>No sets found.</Text>
            ) : (
              <View style={isGrid ? styles.grid : styles.list} testID="sets-layout">
                {data.items.map((set) => <SetCard isGrid={isGrid} key={set.setNumber} set={set} />)}
              </View>
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
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 28, fontWeight: '700' },
  list: { gap: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  setCard: { gap: 4, borderColor: '#d1d5db', borderWidth: 1, borderRadius: 8, padding: 12 },
  gridCard: { width: '48%' },
  image: { width: '100%', resizeMode: 'contain' },
  setName: { fontWeight: '600' },
  pagination: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  error: { gap: 12 },
});
