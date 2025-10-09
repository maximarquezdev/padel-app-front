import { useAuth } from "@/providers/auth";
import { Redirect } from "expo-router";

export default function Index() {
  const { session } = useAuth();
  const isEmailVerified = !!session?.user?.emailVerified;

  if (session?.user) {
    // Cuando hay sesión, enviamos al home si el correo está verificado;
    // de lo contrario mantenemos al usuario en la pantalla de validación.
    return (
      <Redirect
        href={isEmailVerified ? "/(app)/home" : "/(auth)/validate-account"}
      />
    );
  }

  // Si no hay sesión activa, mandamos a la pantalla de login dentro de (auth)
  return <Redirect href="/(auth)/sign-in" />;
}
