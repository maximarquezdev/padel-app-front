// src/auth/storage.ts
import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export async function saveTokens(access: string, refresh?: string) {
  await SecureStore.setItemAsync(ACCESS_KEY, access);
  if (refresh) await SecureStore.setItemAsync(REFRESH_KEY, refresh);
}
export async function getTokens() {
  const access = await SecureStore.getItemAsync(ACCESS_KEY);
  const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
  return { access, refresh };
}
export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}
