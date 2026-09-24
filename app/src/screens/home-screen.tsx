import { LegendList } from '@legendapp/list/react-native';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SetCard } from '@/components/set-card';
import { usePaginatedSets } from '@/hooks/usePaginatedSets';

export function HomeScreen() {
  const [isGrid, setIsGrid] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const { error, items, loadMore, page, retry, state, submitSearch } = usePaginatedSets();

  return (
    <SafeAreaView style={styles.safeArea}>
      <LegendList
        contentContainerStyle={styles.content}
        data={items}
        key={isGrid ? 'grid' : 'list'}
        keyExtractor={(set) => set.setNumber}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.heading}>
              <Text style={styles.title}>Welcome to BrickList</Text>
              <Button onPress={() => setIsGrid((current) => !current)} title={isGrid ? 'List view' : 'Grid view'} />
            </View>
            <View style={styles.search}>
              <TextInput accessibilityLabel="Search sets" onChangeText={setSearchInput} placeholder="Search sets" style={styles.searchInput} value={searchInput} />
              <Button onPress={() => submitSearch(searchInput)} title="Search" />
            </View>
          </View>
        }
        ListEmptyComponent={state === 'empty' ? <Text>No sets found. Try another search.</Text> : null}
        ListFooterComponent={
          <View style={styles.footer}>
            {state === 'loading' && <Text>{page === 1 ? 'Loading sets…' : 'Loading more sets…'}</Text>}
            {state === 'error' && (
              <View style={styles.error}>
                <Text>Could not load sets: {error}</Text>
                <Button onPress={retry} title="Retry" />
              </View>
            )}
          </View>
        }
        numColumns={isGrid ? 2 : 1}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        recycleItems
        renderItem={({ item }) => (
          <SetCard
            isGrid={isGrid}
            onPress={() => router.push(`/(sets)/${encodeURIComponent(item.setNumber)}` as Href)}
            set={item}
          />
        )}
        testID="sets-layout"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 16 },
  header: { gap: 16, marginBottom: 16 },
  heading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 28, fontWeight: '700' },
  search: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  searchInput: { borderColor: '#d1d5db', borderRadius: 8, borderWidth: 1, flex: 1, padding: 12 },
  footer: { paddingVertical: 12 },
  error: { gap: 12 },
});
