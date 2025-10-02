// app/(auth)/_layout.tsx
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function AuthGroupLayout() {
  const { token, status } = useAuth();
  if (status === "loading") return null; // splash opcional

  if (token) {
    // Si ya está logueado, mandalo al área privada
    return <Redirect href="/(app)/home" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
