// app/(auth)/_layout.tsx
import { useAuth } from "@/providers/auth";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";

export default function AuthLayout() {
  const { session, isRestoring } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const isEmailVerified = !!session.user?.emailVerified;
  const inAuthGroup = segments[0] === "(auth)";
  const lastSegment = segments[segments.length - 1];
  const isOnValidateAccount =
    pathname === "/(auth)/validate-account" || lastSegment === "validate-account";
  const hasForcedValidate = useRef(false);

  useEffect(() => {
    if (isRestoring || !session.user) {
      hasForcedValidate.current = false;
      return;
    }

    if (isEmailVerified) {
      hasForcedValidate.current = false;
      if (inAuthGroup) {
        router.replace("/(app)/home");
      }
      return;
    }

    if (isOnValidateAccount) {
      hasForcedValidate.current = false;
      return;
    }

    if (!hasForcedValidate.current) {
      hasForcedValidate.current = true;
      router.replace("/(auth)/validate-account");
    }
  }, [
    isRestoring,
    session.user,
    isEmailVerified,
    inAuthGroup,
    isOnValidateAccount,
    router,
  ]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
