/** Как в expo-linphone/example: `EXPO_PUBLIC_BACKEND_URL`, иначе прод по умолчанию. */
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_BACKEND_URL ?? 'https://domophone.site:3000'
).replace(/\/$/, '');
