import { api } from "./client";

export type LoginPayload = { email: string; password: string };
export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  user: { id: string; name: string; email: string };
};

export const AuthService = {
  login(payload: LoginPayload) {
    return api<LoginResponse>("/auth/sign-in", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  refresh(token: string) {
    return api<LoginResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: token }),
    });
  },
  logout() {
    return api<void>("/auth/sign-out", { method: "POST" });
  },
};
