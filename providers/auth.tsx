import { api, clearAuthTokens, setAuthTokens } from "@/lib/api";
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import axios from "axios";
import * as Linking from "expo-linking";
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

type SessionUser = {
  id: string;
  email: string;
  emailVerified?: boolean;
  [key: string]: any;
};

type Session = {
  user: SessionUser | null;
  access_token?: string | null;
};

type userSignup = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const truthyStringValues = new Set(["true", "1", "yes", "y"]);
const falsyStringValues = new Set(["false", "0", "no", "n"]);

const coerceBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
    return undefined;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return undefined;
    if (truthyStringValues.has(normalized)) return true;
    if (falsyStringValues.has(normalized)) return false;
    return undefined;
  }
  return undefined;
};

const normalizeUser = (user: any): SessionUser | null => {
  if (!user) return null;

  const explicit = coerceBoolean(
    user.emailVerified ??
      user.email_verified ??
      user.isEmailVerified ??
      user.is_email_verified ??
      user.isVerified ??
      user.verified
  );

  let emailVerified = explicit ?? false;

  if (!emailVerified) {
    const verificationTimestamp =
      user.emailVerifiedAt ??
      user.email_verified_at ??
      user.verifiedAt ??
      user.verified_at ??
      user.emailConfirmation ??
      user.email_confirmation;

    if (verificationTimestamp) {
      emailVerified = true;
    }
  }

  return {
    ...user,
    emailVerified,
  };
};

GoogleSignin.configure({
  webClientId:
    "354577248613-1u519rm71sal02r5k1gluqmv6e9pkjvp.apps.googleusercontent.com",
});

const AuthCtx = createContext<{
  session: Session;
  signIn: (email: string, password: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  signUp: (userData: any) => Promise<void>;
  validateAccount: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
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
    access_token: null,
  });
  const [isRestoring, setIsRestoring] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const restore = async () => {
    setIsRestoring(true);
    const at = await SecureStore.getItemAsync("access_token");
    const rt = await SecureStore.getItemAsync("refresh_token");
    const user = await SecureStore.getItemAsync("user");
    const storedUser = user ? normalizeUser(JSON.parse(user)) : null;
    if (at && rt) {
      setAuthTokens({ access_token: at, refresh_token: rt });
      setSession({ user: storedUser, access_token: at });
    }
    setIsRestoring(false);
  };

  useEffect(() => {
    restore();
  }, []);

  useEffect(() => {
    const handleDeepLink = (url?: string | null) => {
      if (!url) return;
      const parsed = Linking.parse(url);
      const { path, queryParams } = parsed;

      const normalizedPath = Array.isArray(path) ? path.join("/") : path ?? "";

      if (normalizedPath.replace(/^\//, "") === "reset-password") {
        const token = queryParams?.token;
        router.navigate({
          pathname: "/(auth)/reset-password",
          params:
            typeof token === "string"
              ? {
                  token,
                }
              : undefined,
        });
      }
    };

    if (!isRestoring) {
      Linking.getInitialURL().then(handleDeepLink);
    }

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, [isRestoring, session.user]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsSubmitting(true);
      const res = await api.post("/auth/sign-in", { email, password });

      const { access_token, refresh_token, user } = res.data;
      const normalizedUser = normalizeUser(user);
      await SecureStore.setItemAsync("access_token", access_token);
      await SecureStore.setItemAsync("refresh_token", refresh_token);
      await SecureStore.setItemAsync("user", JSON.stringify(normalizedUser));
      setAuthTokens({ access_token, refresh_token });
      setSession({ user: normalizedUser, access_token });
      const destination = normalizedUser?.emailVerified
        ? "/(app)/home"
        : "/(auth)/validate-account";
      router.replace(destination);
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

  const googleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        setIsSubmitting(true);
        setError("");
        try {
          const res = await api.post("/auth/google", {
            idToken: response?.data?.idToken,
          });

          if (res.status === 200) {
            const { access_token, refresh_token, user } = res.data;
            const normalizedUser = normalizeUser(user);
            await SecureStore.setItemAsync("access_token", access_token);
            await SecureStore.setItemAsync("refresh_token", refresh_token);
            await SecureStore.setItemAsync(
              "user",
              JSON.stringify(normalizedUser)
            );
            setAuthTokens({ access_token, refresh_token });
            setSession({ user: normalizedUser, access_token });
            setError("");
            const destination = normalizedUser?.emailVerified
              ? "/(app)/home"
              : "/(auth)/validate-account";
            router.replace(destination);
            setIsSubmitting(false);
          }
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
        } finally {
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const signUp = async ({ userData }: { userData: userSignup }) => {
    try {
      setIsSubmitting(true);
      setError("");
      const res = await api.post("/users", userData);
      if (res.status === 200 || res.status === 201) {
        const { access_token, refresh_token, user } = res.data;
        const normalizedUser = normalizeUser(user);
        await SecureStore.setItemAsync("access_token", access_token);
        await SecureStore.setItemAsync("refresh_token", refresh_token);
        await SecureStore.setItemAsync("user", JSON.stringify(normalizedUser));
        setAuthTokens({ access_token, refresh_token });
        setSession({ user: normalizedUser, access_token });
        setError("");
        const destination = normalizedUser?.emailVerified
          ? "/(app)/home"
          : "/(auth)/validate-account";
        router.replace(destination);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
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
    // try {
    //   await api.post("/auth/logout");
    // } catch {
    //   console.error(error);
    // }
    await GoogleSignin.signOut();
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    await SecureStore.deleteItemAsync("user");
    clearAuthTokens();
    setSession({ user: null, access_token: null });
    router.replace("/(auth)/sign-in");
  };

  const forgotPassword = async (email: string) => {
    setIsSubmitting(true);
    setError("");
    try {
      const res = await api.post("/email-test/restart-password", { email });
      if (res.status === 200 || res.status === 201) {
        setIsSubmitting(false);
        router.push(`/(auth)/forgot-password-success?email=${email}`);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateAccount = async (code: string) => {
    try {
      const { id } = session.user!;
      setIsSubmitting(true);
      setError("");
      const res = await api.post("/auth/validate-email", { code, id });

      if (res.status === 200 || res.status === 201) {
        const normalizedUser = normalizeUser(res.data);
        await SecureStore.setItemAsync("user", JSON.stringify(normalizedUser));
        setSession({ user: normalizedUser });
        setIsSubmitting(false);
        router.replace("/(app)/home");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const value = useMemo(
    () => ({
      session,
      signIn,
      googleSignIn,
      signUp,
      validateAccount,
      signOut,
      forgotPassword,
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
