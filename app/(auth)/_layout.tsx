// app/(auth)/_layout.tsx
import { useAuth } from "@/providers/auth";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { session, isRestoring } = useAuth();
  if (!isRestoring && session.user) return <Redirect href="/(app)/home" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
