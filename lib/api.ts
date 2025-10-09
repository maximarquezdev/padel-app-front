// lib/api.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";

let auth = { access_token: "", refresh_token: "" };
export const setAuthTokens = (t: {
  access_token: string;
  refresh_token: string;
}) => (auth = t);
export const clearAuthTokens = () =>
  (auth = { access_token: "", refresh_token: "" });

export const api = axios.create({ baseURL: "http://192.168.1.2:3000" });
// export const api = axios.create({
//   baseURL: "https://paddle-app-back.onrender.com",
// });

api.interceptors.request.use((cfg) => {
  if (auth.access_token)
    cfg.headers.Authorization = `Bearer ${auth.access_token}`;
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
        const res = await axios.post("http://192.168.1.2:3000/auth/refresh", {
          refreshToken: rt,
        });
        const { access_token, refresh_token } = res.data;
        await SecureStore.setItemAsync("access_token", access_token);
        await SecureStore.setItemAsync("refresh_token", refresh_token);
        setAuthTokens({ access_token, refresh_token });
        return access_token;
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
