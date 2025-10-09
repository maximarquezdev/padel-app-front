import { AuthProvider, useAuth } from "@/providers/auth";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, isRestoring } = useAuth();
  const isEmailVerified = !!session.user?.emailVerified;
  const shouldShowAuthStack = !session.user || !isEmailVerified;
  const shouldShowAppStack = !!session.user && isEmailVerified;

  useEffect(() => {
    if (!isRestoring) {
      SplashScreen.hideAsync();
    }
  }, [isRestoring]);

  if (isRestoring) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={shouldShowAuthStack}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={shouldShowAppStack}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar animated={true} barStyle="dark-content" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
