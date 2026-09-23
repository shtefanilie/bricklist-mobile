import { fetchSets } from '@/api';

const fetchMock = jest.fn();

describe('fetchSets', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.test';
    process.env.EXPO_PUBLIC_WORKSHOP_API_KEY = 'workshop-key';
  });

  it('requests the requested page with the workshop API key', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ items: [], page: 2, limit: 20, total: 0 }),
    });

    await expect(fetchSets(2, 123)).resolves.toEqual({ items: [], page: 2, limit: 20, total: 0 });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.test/sets?page=2&limit=20&seed=123',
      expect.objectContaining({ headers: { 'X-API-Key': 'workshop-key' } }),
    );
  });

  it('reports missing public configuration', async () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;

    await expect(fetchSets(1, 123)).rejects.toThrow('EXPO_PUBLIC_API_BASE_URL');
  });

  it('reports the response status and API error message', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Invalid workshop key' } }),
    });

    await expect(fetchSets(1, 123)).rejects.toThrow('401: Invalid workshop key');
  });
});
