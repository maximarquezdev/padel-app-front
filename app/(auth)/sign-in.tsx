import { LabeledTextField } from "@/components/form/LabeledTextField";
import ThemedButton from "@/components/themed-button";
import { ThemedView } from "@/components/themed-view";
import { validateEmail, validatePassword } from "@/lib/validation/auth";
import { useAuth } from "@/providers/auth";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const image = require("@/assets/images/login-background.png");

type AuthFormErrors = {
  email?: string;
  password?: string;
};

type AuthFormValues = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const { signIn, googleSignIn, error, isSubmitting } = useAuth();
  const [authData, setAuthData] = useState<AuthFormValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<AuthFormErrors>({});

  const onSubmit = async () => {
    const emailValidation = validateEmail(authData.email);
    const passwordValidation = validatePassword(authData.password);

    const nextErrors: AuthFormErrors = {};
    if (emailValidation.error) {
      nextErrors.email = emailValidation.error;
    }
    if (passwordValidation.error) {
      nextErrors.password = passwordValidation.error;
    }

    if (nextErrors.email || nextErrors.password) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    const sanitizedValues: AuthFormValues = {
      email: emailValidation.value,
      password: passwordValidation.value,
    };

    const hasSanitizedChanges =
      sanitizedValues.email !== authData.email ||
      sanitizedValues.password !== authData.password;

    if (hasSanitizedChanges) {
      setAuthData((prev) => ({ ...prev, ...sanitizedValues }));
    }

    try {
      await signIn(sanitizedValues.email, sanitizedValues.password);
    } catch (e: any) {
      console.error(error);
    }
  };

  return (
    <>
      <ThemedView style={{ flex: 1 }}>
        <View
          style={{
            position: "relative",
            height: 240,
          }}
        >
          <View
            style={{
              position: "absolute",
              bottom: 20,
              right: 30,
              width: 130,
              height: 130,
              borderRadius: 100,
              backgroundColor: "white",
              zIndex: 1,
            }}
          />
          <ImageBackground
            style={{
              width: "100%",
              height: "100%",
            }}
            source={image}
            resizeMode="stretch"
          />
        </View>
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
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            error={errors.email}
            onChangeText={(text) => {
              setAuthData((prev) => ({ ...prev, email: text }));
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
          />

          <LabeledTextField
            label="Contrasena"
            value={authData.password}
            placeholder="*********"
            password
            error={errors.password}
            onChangeText={(text) => {
              setAuthData((prev) => ({ ...prev, password: text }));
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
          />

          <Pressable
            onPress={() => {
              router.push("/(auth)/forgot-password");
            }}
          >
            <Text
              style={{
                textAlign: "right",
                marginBlock: 10,
                color: "#FF6F3Cff",
              }}
            >
              Olvidaste tu contrasena?
            </Text>
          </Pressable>
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

          <Pressable
            onPress={googleSignIn}
            style={({ pressed }) => [
              styles.googleButton,
              pressed && { backgroundColor: "#CBCBCB80" }, // color de fondo al presionar
            ]}
          >
            <ImageBackground
              source={require("@/assets/images/google-icon.png")}
              resizeMode="contain"
              style={{ width: 24, height: 24 }}
            />
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
            <Text style={{ color: "#9e9e9eff" }}>No tenes cuenta?</Text>
            <Pressable onPress={() => router.push("/(auth)/sign-up")}>
              <Text style={styles.link}>Registrate</Text>
            </Pressable>
          </View>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
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
    marginVertical: 10,
  },
  divider: {
    width: "30%",
    height: 1,
    backgroundColor: "#E1E1E1",
  },
  googleButton: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    width: "100%",
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
