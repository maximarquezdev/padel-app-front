import { LabeledTextField } from "@/components/form/LabeledTextField";
import ThemedButton from "@/components/themed-button";
import { api } from "@/lib/api";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const token = useMemo(
    () => (Array.isArray(params.token) ? params.token.at(0) : params.token),
    [params.token]
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert(
        "Enlace inválido",
        "No encontramos el token de recuperación en el enlace. Solicitá uno nuevo desde la app."
      );
      return;
    }

    if (!password.trim() || !confirmPassword.trim()) {
      Alert.alert(
        "Datos incompletos",
        "Ingresá y confirmá tu nueva contraseña para continuar."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Contraseñas distintas",
        "La confirmación no coincide. Revisá los datos e intentá nuevamente."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/auth/reset-password", {
        token,
        password,
      });

      Alert.alert(
        "Contraseña actualizada",
        "Ya podés iniciar sesión con tu nueva contraseña.",
        [
          {
            text: "Ingresar",
            onPress: () => router.replace("/(auth)/sign-in"),
          },
        ]
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage =
          error.response?.data?.message || error.response?.data?.error;
        Alert.alert(
          "No pudimos actualizar la contraseña",
          backendMessage || "Intentá nuevamente en unos segundos."
        );
      } else {
        Alert.alert(
          "No pudimos actualizar la contraseña",
          "Intentá nuevamente en unos segundos."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <ImageBackground
          style={{ width: "100%", height: "100%" }}
          source={require("@/assets/images/img-orange.png")}
          resizeMode="stretch"
        />
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Image
            source={require("@/assets/images/back-arrow.png")}
            style={{ width: 30, height: 30 }}
          />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Restablecer contraseña</Text>
          <View style={styles.underline} />
          <Text style={styles.subtitle}>
            Elegí tu nueva contraseña para seguir disfrutando de la app.
          </Text>
          {!token && (
            <Text style={styles.tokenWarning}>
              Abrí este enlace desde el mail que recibiste para completar el
              proceso.
            </Text>
          )}
        </View>

        <View style={styles.form}>
          <LabeledTextField
            label="Nueva contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="********"
            password
          />
          <LabeledTextField
            label="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="********"
            password
          />
        </View>

        <ThemedButton
          text="Actualizar contraseña"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          disabled={isSubmitting}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "relative",
    height: 200,
  },
  backButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: "30%",
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: "white",
    zIndex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 24,
  },
  titleContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: "500",
  },
  underline: {
    width: 80,
    height: 3,
    backgroundColor: "#34A353",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 22,
    color: "#545454",
  },
  tokenWarning: {
    fontSize: 14,
    color: "#B3261E",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
});
