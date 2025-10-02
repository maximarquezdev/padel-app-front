// app/_layout.tsx
import { AuthProvider, useAuth } from "@/src/auth/auth.context";
import { Redirect, Slot } from "expo-router";

function Root() {
  const { loading, accessToken } = useAuth();

  // if (loading) return <Text>Loading...</Text>;
  // <SplashScreen />;

  const isAuthed = !!accessToken;
  // Si estás en un segmento protegido y no hay sesión, redirige a login
  // (también podés separar segmentos (auth)/(app) y usar layouts independientes)
  return isAuthed ? <Slot /> : <Redirect href="/(auth)/login" />;
}

export default function Layout() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
