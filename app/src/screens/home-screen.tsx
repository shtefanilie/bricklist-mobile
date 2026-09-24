import { useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SetCard } from '@/components/set-card';
import { usePaginatedSets } from '@/hooks/usePaginatedSets';

export function HomeScreen() {
  const [isGrid, setIsGrid] = useState(true);
  const { canGoNext, canGoPrevious, data, error, goNext, goPrevious, retry, state } = usePaginatedSets();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to BrickList</Text>
          <Button
            onPress={() => setIsGrid((current) => !current)}
            title={isGrid ? 'List view' : 'Grid view'}
          />
        </View>

        {state === 'loading' && <Text>Loading sets…</Text>}

        {(state === 'success' || state === 'empty') && data && (
          <>
            {state === 'empty' ? (
              <Text>No sets found. Try another search.</Text>
            ) : (
              <View style={isGrid ? styles.grid : styles.list} testID="sets-layout">
                {data.items.map((set) => <SetCard isGrid={isGrid} key={set.setNumber} set={set} />)}
              </View>
            )}

            <View style={styles.pagination}>
              <Button disabled={!canGoPrevious} onPress={goPrevious} title="Previous" />
              <Text>Page {data.page}</Text>
              <Button disabled={!canGoNext} onPress={goNext} title="Next" />
            </View>
          </>
        )}

        {state === 'error' && (
          <View style={styles.error}>
            <Text>Could not load sets: {error}</Text>
            <Button onPress={retry} title="Retry" />
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
  pagination: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  error: { gap: 12 },
});
