// src/auth/auth.context.tsx
import {
  AuthService,
  LoginPayload,
  LoginResponse,
} from "@/src/api/auth.service";
import React, { createContext, useContext, useEffect, useState } from "react";
import { clearTokens, getTokens, saveTokens } from "./storage";

type AuthState = {
  user: LoginResponse["user"] | null;
  accessToken: string | null;
  loading: boolean;
  signInWithCredentials: (payload: LoginPayload) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthState["user"]>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión al abrir la app
  useEffect(() => {
    (async () => {
      const { access } = await getTokens();
      if (access) {
        setAccessToken(access);
        // Opcional: pegarle a /me para obtener el usuario actual
        // const me = await api<User>('/me', { headers: { Authorization: `Bearer ${access}` }});
        // setUser(me);
      }
      setLoading(false);
    })();
  }, []);

  async function signInWithCredentials(payload: LoginPayload) {
    setLoading(true);
    try {
      const res = await AuthService.login(payload);
      console.log("login response", res);

      await saveTokens(res.accessToken, res.refreshToken);
      setAccessToken(res.accessToken);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);
    try {
      // opcional: await AuthService.logout();
      await clearTokens();
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, accessToken, loading, signInWithCredentials, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
