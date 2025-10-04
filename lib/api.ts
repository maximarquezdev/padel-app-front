// lib/api.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";

let auth = { accessToken: "", refreshToken: "" };
export const setAuthTokens = (t: {
  accessToken: string;
  refreshToken: string;
}) => (auth = t);
export const clearAuthTokens = () =>
  (auth = { accessToken: "", refreshToken: "" });

export const api = axios.create({ baseURL: "http://192.168.1.2:3000/api" });

api.interceptors.request.use((cfg) => {
  if (auth.accessToken)
    cfg.headers.Authorization = `Bearer ${auth.accessToken}`;
  return cfg;
});

let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      refreshing ||= (async () => {
        const rt = await SecureStore.getItemAsync("refresh_token");
        if (!rt) return null;
        const res = await axios.post(
          "http://192.168.1.2:3000/api/auth/refresh",
          {
            refreshToken: rt,
          }
        );
        const { accessToken, refreshToken } = res.data;
        await SecureStore.setItemAsync("access_token", accessToken);
        await SecureStore.setItemAsync("refresh_token", refreshToken);
        setAuthTokens({ accessToken, refreshToken });
        return accessToken;
      })();
      const newAT = await refreshing;
      refreshing = null;
      if (newAT) {
        original.headers.Authorization = `Bearer ${newAT}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);
