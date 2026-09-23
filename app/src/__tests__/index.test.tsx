import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import HomeScreen from '@/app/index';
import { fetchSets } from '@/api';
import type { PaginatedSets } from '@/types';

jest.mock('@/api', () => ({ fetchSets: jest.fn() }));

const fetchSetsMock = fetchSets as jest.MockedFunction<typeof fetchSets>;

const pageOne: PaginatedSets = {
  items: [
    {
      setNumber: '10300-1',
      name: 'Back to the Future Time Machine',
      theme: 'LEGO Icons',
      year: 2022,
      pieceCount: 1872,
      imageUrl: 'https://images.example.test/10300-1.jpg',
    },
  ],
  page: 1,
  limit: 20,
  total: 21,
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('shows a loading message while the first request is pending', async () => {
    fetchSetsMock.mockReturnValue(new Promise(() => {}));

    const { getByText } = await render(<HomeScreen />);

    expect(getByText('Loading sets…')).toBeTruthy();
  });

  it('renders every set field and pagination controls', async () => {
    fetchSetsMock.mockResolvedValue(pageOne);

    render(<HomeScreen />);

    await waitFor(() => expect(screen.getByText('Back to the Future Time Machine')).toBeTruthy());

    expect(fetchSetsMock).toHaveBeenCalledWith(1, expect.any(Number), expect.anything());
    expect(screen.getByText('10300-1')).toBeTruthy();
    expect(screen.getByText('LEGO Icons')).toBeTruthy();
    expect(screen.getByText('2022')).toBeTruthy();
    expect(screen.getByText('1872 pieces')).toBeTruthy();
    expect(screen.getByLabelText('Back to the Future Time Machine image')).toBeTruthy();
    expect(screen.getByText('Page 1')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Previous' }).props.accessibilityState.disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Next' }).props.accessibilityState.disabled).toBe(false);
  });

  it('shifts the layout when an image finishes loading', async () => {
    fetchSetsMock.mockResolvedValue(pageOne);

    const { findByLabelText } = await render(<HomeScreen />);

    const image = await findByLabelText('Back to the Future Time Machine image');
    expect(image).toHaveStyle({ height: 0 });

    jest.useFakeTimers();
    await act(async () => fireEvent(image, 'loadEnd'));
    expect(image).toHaveStyle({ height: 0 });

    await act(async () => jest.advanceTimersByTime(500));
    expect(image).toHaveStyle({ height: 180 });
  });

  it('toggles between list and two-column grid layouts', async () => {
    fetchSetsMock.mockResolvedValue(pageOne);

    const { getByTestId } = await render(<HomeScreen />);
    await waitFor(() => expect(screen.getByText('Back to the Future Time Machine')).toBeTruthy());

    expect(screen.getByRole('button', { name: 'Grid view' })).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Grid view' })));

    expect(getByTestId('sets-layout')).toHaveStyle({ flexDirection: 'row', flexWrap: 'wrap' });
    expect(screen.getByRole('button', { name: 'List view' })).toBeTruthy();
  });

  it('loads the next page when Next is pressed', async () => {
    fetchSetsMock.mockResolvedValue(pageOne);

    render(<HomeScreen />);
    await waitFor(() => expect(screen.getByText('Page 1')).toBeTruthy());
    const seed = fetchSetsMock.mock.calls[0][1];

    fireEvent.press(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => expect(fetchSetsMock).toHaveBeenLastCalledWith(2, seed, expect.anything()));
  });

  it('shows a retryable error after a failed request', async () => {
    fetchSetsMock.mockRejectedValue(new Error('Worker unavailable'));

    render(<HomeScreen />);

    await waitFor(() => expect(screen.getByText('Could not load sets: Worker unavailable')).toBeTruthy());
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });

  it('shows an empty message when no sets are returned', async () => {
    fetchSetsMock.mockResolvedValue({ ...pageOne, items: [], total: 0 });

    render(<HomeScreen />);

    await waitFor(() => expect(screen.getByText('No sets found.')).toBeTruthy());
  });
});
