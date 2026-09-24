import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import { Share } from 'react-native';

import { fetchSet } from '@/api';
import { SetDetailScreen } from '@/screens/set-detail-screen';

jest.mock('@/api', () => ({ fetchSet: jest.fn() }));
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: jest.fn(),
}));

const fetchSetMock = fetchSet as jest.MockedFunction<typeof fetchSet>;
const paramsMock = useLocalSearchParams as jest.MockedFunction<typeof useLocalSearchParams>;
const set = {
  setNumber: '10300-1', name: 'Back to the Future Time Machine', theme: 'LEGO Icons',
  year: 2022, pieceCount: 1872, imageUrl: 'https://images.example.test/10300-1.jpg',
};

beforeEach(() => {
  jest.resetAllMocks();
  paramsMock.mockReturnValue({ setNumber: '10300-1' });
});

it('loads selected set and renders every detail field', async () => {
  fetchSetMock.mockResolvedValue(set);
  render(<SetDetailScreen />);
  await waitFor(() => expect(screen.getByText('Back to the Future Time Machine')).toBeTruthy());
  expect(fetchSetMock).toHaveBeenCalledWith('10300-1', expect.anything());
  expect(screen.getByLabelText('Back to the Future Time Machine image')).toBeTruthy();
  expect(screen.getByText('Set number: 10300-1')).toBeTruthy();
  expect(screen.getByText('Theme: LEGO Icons')).toBeTruthy();
  expect(screen.getByText('Year: 2022')).toBeTruthy();
  expect(screen.getByText('Pieces: 1872')).toBeTruthy();
});

it('shows retry after detail request fails', async () => {
  fetchSetMock.mockRejectedValueOnce(new Error('404: Set not found')).mockResolvedValueOnce(set);
  render(<SetDetailScreen />);
  await waitFor(() => expect(screen.getByText('Could not load set: 404: Set not found')).toBeTruthy());
  fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
  await waitFor(() => expect(screen.getByText('Back to the Future Time Machine')).toBeTruthy());
});

it('shares selected set details with the device share sheet', async () => {
  fetchSetMock.mockResolvedValue(set);
  const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction });
  render(<SetDetailScreen />);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Share set' })).toBeTruthy());
  fireEvent.press(screen.getByRole('button', { name: 'Share set' }));
  await waitFor(() => expect(shareSpy).toHaveBeenCalledWith({
    message: 'Check out Back to the Future Time Machine (10300-1) — 1872 pieces from LEGO Icons!',
  }));
  shareSpy.mockRestore();
});
