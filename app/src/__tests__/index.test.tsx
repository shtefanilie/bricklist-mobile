import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import HomeScreen from '@/app/index';
import { fetchSets } from '@/api';
import type { PaginatedSets, SetRecord } from '@/types';

jest.mock('@/api', () => ({ fetchSets: jest.fn() }));
// Native list virtualization needs a measured viewport, unavailable in the Jest renderer.
jest.mock('@legendapp/list/react-native', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    LegendList: ({ data, renderItem, keyExtractor, ListHeaderComponent, ListFooterComponent, ListEmptyComponent, onEndReached, numColumns, testID }: {
      data: SetRecord[];
      renderItem: (props: { item: SetRecord; index: number }) => React.ReactNode;
      keyExtractor: (item: SetRecord) => string;
      ListHeaderComponent: React.ReactNode;
      ListFooterComponent: React.ReactNode;
      ListEmptyComponent: React.ReactNode;
      onEndReached: () => void;
      numColumns: number;
      testID: string;
    }) => React.createElement(View, { testID, onEndReached, numColumns },
      ListHeaderComponent,
      data.length ? data.map((item, index) => React.createElement(View, { key: keyExtractor(item) }, renderItem({ item, index }))) : ListEmptyComponent,
      ListFooterComponent,
    ),
  };
});

const fetchSetsMock = fetchSets as jest.MockedFunction<typeof fetchSets>;
const pageOne: PaginatedSets = {
  items: [{
    setNumber: '10300-1', name: 'Back to the Future Time Machine', theme: 'LEGO Icons',
    year: 2022, pieceCount: 1872, imageUrl: 'https://images.example.test/10300-1.jpg',
  }],
  page: 1, limit: 20, total: 21,
};
const pageTwo: PaginatedSets = {
  items: [{
    setNumber: '001-1', name: 'Gears', theme: 'Technic',
    year: 1965, pieceCount: 43, imageUrl: 'https://images.example.test/001-1.jpg',
  }],
  page: 2, limit: 20, total: 21,
};

describe('HomeScreen', () => {
  beforeEach(() => jest.resetAllMocks());

  it('shows loading while the first request is pending', async () => {
    fetchSetsMock.mockReturnValue(new Promise(() => {}));
    await render(<HomeScreen />);
    await waitFor(() => expect(screen.getByText('Loading sets…')).toBeTruthy());
  });

  it('renders set fields and reserves image space before it loads', async () => {
    fetchSetsMock.mockResolvedValue(pageOne);
    await render(<HomeScreen />);
    await waitFor(() => expect(screen.getByText('Back to the Future Time Machine')).toBeTruthy());
    expect(screen.getByText('10300-1')).toBeTruthy();
    expect(screen.getByText('LEGO Icons')).toBeTruthy();
    expect(screen.getByText('2022')).toBeTruthy();
    expect(screen.getByText('1872 pieces')).toBeTruthy();
    expect(screen.getByLabelText('Back to the Future Time Machine image')).toHaveStyle({ height: 180 });
    expect(screen.getByRole('button', { name: 'List view' })).toBeTruthy();
    expect(fetchSetsMock).toHaveBeenCalledWith(1, expect.any(Number), '', expect.anything());
  });

  it('toggles grid and list layouts', async () => {
    fetchSetsMock.mockResolvedValue(pageOne);
    await render(<HomeScreen />);
    await waitFor(() => expect(screen.getByText('Back to the Future Time Machine')).toBeTruthy());
    expect(screen.getByTestId('sets-layout').props.numColumns).toBe(2);
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'List view' })));
    expect(screen.getByTestId('sets-layout').props.numColumns).toBe(1);
    expect(screen.getByRole('button', { name: 'Grid view' })).toBeTruthy();
  });

  it('fetches next page once and appends its sets', async () => {
    fetchSetsMock.mockResolvedValueOnce(pageOne).mockResolvedValueOnce(pageTwo);
    await render(<HomeScreen />);
    await waitFor(() => expect(screen.getByText('Back to the Future Time Machine')).toBeTruthy());
    const seed = fetchSetsMock.mock.calls[0][1];
    await act(async () => fireEvent(screen.getByTestId('sets-layout'), 'endReached'));
    await waitFor(() => expect(screen.getByText('Gears')).toBeTruthy());
    expect(screen.getByText('Back to the Future Time Machine')).toBeTruthy();
    expect(fetchSetsMock).toHaveBeenLastCalledWith(2, seed, '', expect.anything());
    await act(async () => fireEvent(screen.getByTestId('sets-layout'), 'endReached'));
    expect(fetchSetsMock).toHaveBeenCalledTimes(2);
  });

  it('submits a new search from page one after loading more', async () => {
    fetchSetsMock.mockResolvedValueOnce(pageOne).mockResolvedValueOnce(pageTwo).mockResolvedValueOnce({ ...pageOne, total: 1 });
    await render(<HomeScreen />);
    await waitFor(() => expect(screen.getByText('Back to the Future Time Machine')).toBeTruthy());
    const seed = fetchSetsMock.mock.calls[0][1];
    await act(async () => fireEvent(screen.getByTestId('sets-layout'), 'endReached'));
    await waitFor(() => expect(screen.getByText('Gears')).toBeTruthy());
    await act(async () => fireEvent.changeText(screen.getByPlaceholderText('Search sets'), '  gear  '));
    expect(fetchSetsMock).toHaveBeenCalledTimes(2);
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Search' })));
    await waitFor(() => expect(fetchSetsMock).toHaveBeenLastCalledWith(1, seed, 'gear', expect.anything()));
    expect(screen.queryByText('Gears')).toBeNull();
  });

  it('retains loaded items and retries a failed next page', async () => {
    fetchSetsMock.mockResolvedValueOnce(pageOne).mockRejectedValueOnce(new Error('Worker unavailable')).mockResolvedValueOnce(pageTwo);
    await render(<HomeScreen />);
    await waitFor(() => expect(screen.getByText('Back to the Future Time Machine')).toBeTruthy());
    await act(async () => fireEvent(screen.getByTestId('sets-layout'), 'endReached'));
    await waitFor(() => expect(screen.getByText('Could not load sets: Worker unavailable')).toBeTruthy());
    expect(screen.getByText('Back to the Future Time Machine')).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Retry' })));
    await waitFor(() => expect(screen.getByText('Gears')).toBeTruthy());
  });

  it('shows an empty message when no sets are returned', async () => {
    fetchSetsMock.mockResolvedValue({ ...pageOne, items: [], total: 0 });
    await render(<HomeScreen />);
    await waitFor(() => expect(screen.getByText('No sets found. Try another search.')).toBeTruthy());
  });
});
