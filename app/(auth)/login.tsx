import { LabeledTextField } from "@/components/form/LabeledTextField";
import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [authData, setAuthData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (key: keyof typeof authData, value: string) => {
    setAuthData((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async () => {
    try {
      setLoading(true);
      await signIn(authData.email, authData.password);
      router.replace("/(app)/home");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <View style={styles.container}>
        <ThemedText type="title">Hola!</ThemedText>

        <LabeledTextField
          label="Email"
          value={authData.email}
          onChangeText={(text) => onChange("email", text)}
          error=""
        />

        <LabeledTextField
          label="Contraseña"
          value={authData.password}
          onChangeText={(text) => onChange("password", text)}
          password
        />

        <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
          <ThemedText style={styles.link}>¿Olvidaste tu contraseña?</ThemedText>
        </Pressable>
        <ThemedButton text="Ingresar" onPress={onSubmit} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, gap: 12 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 6 },
  link: {
    color: "#ff6f3cff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    marginBlock: 10,
  },
});
