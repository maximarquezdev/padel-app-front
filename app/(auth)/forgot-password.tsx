import { LabeledTextField } from "@/components/form/LabeledTextField";
import ThemedButton from "@/components/themed-button";
import { useAuth } from "@/providers/auth";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
  const { isSubmitting, forgotPassword } = useAuth();
  const [email, setEmail] = useState("");

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
      <View style={{ flex: 1, paddingHorizontal: 20, marginBottom: 20 }}>
        <View style={{ flex: 1, gap: 20 }}>
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: 12,
            }}
          >
            <Text style={styles.title}>Recuperar contraseña</Text>
            <View style={styles.underline}></View>

            <Text style={styles.subtitle}>
              Ingresá el mail con el que te registraste y te vamos a mandar un
              enlace para que vuelvas a la cancha
            </Text>
          </View>

          <LabeledTextField
            label="Email"
            value={email}
            onChangeText={(t) => setEmail(t)}
            placeholder="ejemplo@correo.com"
          />
          <View />
          <ThemedButton
            text="Continuar"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            onPress={() => forgotPassword(email)}
          />
        </View>
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
  title: { fontSize: 42, fontWeight: "500" },
  underline: {
    width: 80,
    height: 3,
    backgroundColor: "#34A353",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "400",
    lineHeight: 25,
    color: "#545454",
  },
});
