export function getApiConfig() {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const apiKey = process.env.EXPO_PUBLIC_WORKSHOP_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error(
      'Missing Expo public API configuration. Set EXPO_PUBLIC_API_BASE_URL and EXPO_PUBLIC_WORKSHOP_API_KEY in app/.env.local.',
    );
  }

  return { baseUrl, apiKey };
}
