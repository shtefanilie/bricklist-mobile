import { getApiConfig } from './config';
import type { PaginatedSets, SetRecord } from './types';

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

export async function fetchSets(page: number, seed: number, search = '', signal?: AbortSignal): Promise<PaginatedSets> {
  const { baseUrl, apiKey } = getApiConfig();
  const url = new URL('/sets', baseUrl);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', '20');
  url.searchParams.set('seed', String(seed));
  if (search.trim()) url.searchParams.set('search', search.trim());

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

export async function fetchSet(setNumber: string, signal?: AbortSignal): Promise<SetRecord> {
  const { baseUrl, apiKey } = getApiConfig();
  const url = new URL(`/sets/${encodeURIComponent(setNumber)}`, baseUrl);
  const response = await fetch(url.toString(), { headers: { 'X-API-Key': apiKey }, signal });

  if (!response.ok) {
    const body = (await response.json()) as ApiErrorResponse;
    throw new Error(`${response.status}: ${body.error?.message ?? 'Request failed'}`);
  }

  return (await response.json()) as SetRecord;
}
