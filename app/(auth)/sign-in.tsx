import { LabeledTextField } from "@/components/form/LabeledTextField";
import ThemedButton from "@/components/themed-button";
import { useAuth } from "@/providers/auth";
import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const image = require("@/assets/images/login-background.png");

export default function LoginScreen() {
  const { signIn, error, isSubmitting } = useAuth();
  const [authData, setAuthData] = useState({
    email: "",
    password: "",
  });

  const onSubmit = async () => {
    try {
      await signIn(authData.email, authData.password);
    } catch (e: any) {
      console.log(e);

      Alert.alert("Error", e?.data ?? "No se pudo iniciar sesión");
    }
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1, justifyContent: "center", gap: 15 }}>
        <ImageBackground
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 300,
          }}
          source={image}
          resizeMode="cover"
        />
        <View style={styles.container}>
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: 12,
            }}
          >
            <Text style={styles.title}>Hola!</Text>
            <View style={styles.underline}></View>
          </View>

          <LabeledTextField
            label="Email"
            value={authData.email}
            placeholder="ejemplo@correo.com"
            onChangeText={(t) => setAuthData(() => ({ ...authData, email: t }))}
          />

          <LabeledTextField
            label="Contraseña"
            value={authData.password}
            placeholder="*********"
            password
            onChangeText={(t) =>
              setAuthData(() => ({ ...authData, password: t }))
            }
          />

          <Pressable
            onPress={() => {
              /* router.push("/(auth)/forgot-password") */
            }}
          >
            <Text
              style={{
                textAlign: "right",
                marginBlock: 10,
                color: "#FF6F3Cff",
              }}
            >
              ¿Olvidaste tu contraseña?
            </Text>
          </Pressable>
          {error && <Text style={{ color: "red" }}>{error}</Text>}
          <ThemedButton
            disabled={isSubmitting}
            isLoading={isSubmitting}
            onPress={onSubmit}
            text="Ingresar"
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={{ marginHorizontal: 20, color: "#E1E1E1" }}>O</Text>
            <View style={styles.divider} />
          </View>

          <Pressable style={styles.googleButton}>
            <Text style={styles.googleText}>Ingresar con Google</Text>
          </Pressable>

          <View
            style={{
              position: "absolute",
              bottom: 20,
              alignSelf: "center",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <Text style={{ color: "#9e9e9eff" }}>¿No tenes cuenta ?</Text>
            <Pressable>
              <Text style={styles.link}>Registrate</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    marginTop: 80,
    gap: 12,
  },
  title: { fontSize: 42, fontWeight: "500" },
  underline: { width: 80, height: 3, backgroundColor: "#ff6f3cff" },
  link: {
    color: "#ff6f3cff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    marginBlock: 10,
  },
  dividerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    width: "30%",
    height: 1,
    backgroundColor: "#E1E1E1",
  },
  googleButton: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "rgba(65, 86, 61, 0.8)",
  },
  googleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2A2A2AE5",
  },
});
