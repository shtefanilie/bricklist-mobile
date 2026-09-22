import { getApiConfig } from './config';
import type { PaginatedSets } from './types';

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

export async function fetchSets(page: number, signal?: AbortSignal): Promise<PaginatedSets> {
  const { baseUrl, apiKey } = getApiConfig();
  const url = new URL('/sets', baseUrl);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', '20');

  const response = await fetch(url.toString(), {
    headers: { 'X-API-Key': apiKey },
    signal,
  });

  if (!response.ok) {
    const body = (await response.json()) as ApiErrorResponse;
    throw new Error(`${response.status}: ${body.error?.message ?? 'Request failed'}`);
  }

  return (await response.json()) as PaginatedSets;
}
