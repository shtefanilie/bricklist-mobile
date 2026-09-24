(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// MMKV requires a native Nitro module; tests exercise its reactive storage contract in JS.
jest.mock('react-native-mmkv', () => {
  const React = jest.requireActual('react') as typeof import('react');
  const values = new Map<string, string>();
  const listeners = new Set<() => void>();
  return {
    useMMKVString: (key: string) => {
      const value = React.useSyncExternalStore(
        (notify) => { listeners.add(notify); return () => { listeners.delete(notify); }; },
        () => values.get(key),
      );
      return [value, (next: string | undefined) => {
        if (next === undefined) values.delete(key);
        else values.set(key, next);
        listeners.forEach((notify) => notify());
      }] as const;
    },
    __clear: () => { values.clear(); listeners.forEach((notify) => notify()); },
  };
});

afterEach(() => {
  const storage = jest.requireMock('react-native-mmkv') as { __clear: () => void };
  storage.__clear();
});
