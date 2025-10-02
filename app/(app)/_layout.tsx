// app/(app)/_layout.tsx
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function AppGroupLayout() {
  const { token, status } = useAuth();
  if (status === "loading") return null; // splash opcional

  if (!token) {
    // Si no está logueado, a Login
    return <Redirect href="/(auth)/login" />;
  }
  return <Stack screenOptions={{ headerShown: true }} />;
}
