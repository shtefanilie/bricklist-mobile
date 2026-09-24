import { useEffect, useState } from 'react';

import { fetchSets } from '@/api';
import type { PaginatedSets } from '@/types';

type FetchState = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export function usePaginatedSets() {
  const [page, setPage] = useState(1);
  const [seed] = useState(() => Math.floor(Math.random() * 2_147_483_647) + 1);
  const [retryCount, setRetryCount] = useState(0);
  const [activeSearch, setActiveSearch] = useState('');
  const [state, setState] = useState<FetchState>('idle');
  const [data, setData] = useState<PaginatedSets | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadSets() {
      setState('loading');
      setError('');

      try {
        const response = await fetchSets(page, seed, activeSearch, controller.signal);
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
  }, [activeSearch, page, retryCount, seed]);

  return {
    canGoNext: data !== null && data.page * data.limit < data.total,
    canGoPrevious: page > 1,
    data,
    error,
    goNext: () => setPage((current) => current + 1),
    goPrevious: () => setPage((current) => current - 1),
    retry: () => setRetryCount((count) => count + 1),
    state,
    submitSearch: (search: string) => {
      setActiveSearch(search.trim());
      setPage(1);
    },
  };
}
