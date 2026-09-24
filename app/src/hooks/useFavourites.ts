import { useMemo } from 'react';
import { useMMKVString } from 'react-native-mmkv';

import type { SetRecord } from '@/types';

const storageKey = 'bricklist.favourites';

export function useFavourites() {
  const [stored, setStored] = useMMKVString(storageKey);
  const favourites = useMemo<SetRecord[]>(() => {
    try {
      const value: unknown = JSON.parse(stored ?? '[]');
      return Array.isArray(value) ? value as SetRecord[] : [];
    } catch {
      return [];
    }
  }, [stored]);

  return {
    favourites,
    isFavourite: (setNumber: string) => favourites.some((set) => set.setNumber === setNumber),
    toggleFavourite: (set: SetRecord) => {
      const next = favourites.some((item) => item.setNumber === set.setNumber)
        ? favourites.filter((item) => item.setNumber !== set.setNumber)
        : [...favourites, set];
      setStored(JSON.stringify(next));
    },
  };
}
