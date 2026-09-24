import { fetchSet, fetchSets } from '@/api';

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

  it('encodes a trimmed search while preserving the workshop key', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ items: [], page: 1, limit: 20, total: 0 }) });

    await fetchSets(1, 123, '  gear set  ');

    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.test/sets?page=1&limit=20&seed=123&search=gear+set',
      expect.objectContaining({ headers: { 'X-API-Key': 'workshop-key' } }),
    );
  });

  it('omits search for blank text', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ items: [], page: 1, limit: 20, total: 0 }) });
    await fetchSets(1, 123, '   ');
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.example.test/sets?page=1&limit=20&seed=123');
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

  it('fetches an encoded set number from the detail endpoint with authentication', async () => {
    const set = { setNumber: '10300-1', name: 'Time Machine', theme: 'Icons', year: 2022, pieceCount: 1872, imageUrl: 'https://images.example.test/10300-1.jpg' };
    fetchMock.mockResolvedValue({ ok: true, json: async () => set });

    await expect(fetchSet('10300-1')).resolves.toEqual(set);
    expect(fetch).toHaveBeenCalledWith('https://api.example.test/sets/10300-1', expect.objectContaining({ headers: { 'X-API-Key': 'workshop-key' } }));
    await fetchSet('one two');
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.example.test/sets/one%20two');
  });

  it('reports detail API errors', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404, json: async () => ({ error: { message: 'Set not found' } }) });
    await expect(fetchSet('missing')).rejects.toThrow('404: Set not found');
  });
});
