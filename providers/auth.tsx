// providers/auth.tsx
import { api, clearAuthTokens, setAuthTokens } from "@/lib/api";
import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Alert } from "react-native";

type Session = {
  user: { id: string; email: string } | null;
  accessToken?: string | null;
};

const AuthCtx = createContext<{
  session: Session;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  restore: () => Promise<void>;
  isRestoring: boolean;
  error: string;
  isSubmitting: boolean;
}>({} as any);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [session, setSession] = useState<Session>({
    user: null,
    accessToken: null,
  });
  const [isRestoring, setIsRestoring] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const restore = async () => {
    setIsRestoring(true);
    const at = await SecureStore.getItemAsync("access_token");
    const rt = await SecureStore.getItemAsync("refresh_token");
    const user = await SecureStore.getItemAsync("user");
    if (at && rt && user) {
      setAuthTokens({ accessToken: at, refreshToken: rt });
      setSession({ user: JSON.parse(user), accessToken: at });
    }
    setIsRestoring(false);
  };

  useEffect(() => {
    restore();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsSubmitting(true);
      setError("");
      const res = await api.post("/auth/sign-in", { email, password });

      const { accessToken, refreshToken, user } = res.data;
      await SecureStore.setItemAsync("access_token", accessToken);
      await SecureStore.setItemAsync("refresh_token", refreshToken);
      await SecureStore.setItemAsync("user", JSON.stringify(user));
      setAuthTokens({ accessToken, refreshToken });
      setSession({ user, accessToken });
      setError("");
      router.replace("/(app)/home");
      setIsSubmitting(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Credenciales inválidas.";
        setError(apiMsg);
        setIsSubmitting(false);
      } else {
        Alert.alert("Error", "Ocurrió un error inesperado.");
      }
    }
  };

  const signOut = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    await SecureStore.deleteItemAsync("user");
    clearAuthTokens();
    setSession({ user: null, accessToken: null });
    router.replace("/(auth)/sign-in");
  };

  const value = useMemo(
    () => ({
      session,
      signIn,
      signOut,
      restore,
      isRestoring,
      error,
      isSubmitting,
    }),
    [session, isRestoring, isSubmitting, error]
  );
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export const useAuth = () => useContext(AuthCtx);
