import { useEffect, useRef, useState } from 'react';

import { fetchSets } from '@/api';
import type { SetRecord } from '@/types';

type FetchState = 'loading' | 'success' | 'empty' | 'error';

export function usePaginatedSets() {
  const [page, setPage] = useState(1);
  const [seed] = useState(() => Math.floor(Math.random() * 2_147_483_647) + 1);
  const [activeSearch, setActiveSearch] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState<FetchState>('loading');
  const [items, setItems] = useState<SetRecord[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const loadingMore = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSets() {
      setState('loading');
      setError('');
      try {
        const response = await fetchSets(page, seed, activeSearch, controller.signal);
        if (controller.signal.aborted) return;
        setItems((current) => page === 1 ? response.items : [...current, ...response.items]);
        setHasMore(response.page * response.limit < response.total);
        setState(response.total === 0 ? 'empty' : 'success');
      } catch (caughtError) {
        if (controller.signal.aborted) return;
        setError(caughtError instanceof Error ? caughtError.message : 'Request failed');
        setState('error');
      } finally {
        if (!controller.signal.aborted) loadingMore.current = false;
      }
    }

    void loadSets();
    return () => controller.abort();
  }, [activeSearch, page, retryCount, seed]);

  return {
    error,
    items,
    loadMore: () => {
      if (state !== 'success' || !hasMore || loadingMore.current) return;
      loadingMore.current = true;
      setPage((current) => current + 1);
    },
    page,
    retry: () => setRetryCount((count) => count + 1),
    state,
    submitSearch: (search: string) => {
      loadingMore.current = false;
      setItems([]);
      setHasMore(false);
      setState('loading');
      setActiveSearch(search.trim());
      setPage(1);
    },
  };
}
