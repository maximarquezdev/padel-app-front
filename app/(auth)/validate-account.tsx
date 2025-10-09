import { OtpInput } from "@/components/form/OtpInput";
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

export default function ValidateAccountScreen() {
  const { validateAccount, signOut } = useAuth();
  const [code, setCode] = useState("");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <ImageBackground
          style={{ width: "100%", height: "100%" }}
          source={require("@/assets/images/img-green.png")}
          resizeMode="stretch"
        />
        <Pressable style={styles.backButton} onPress={() => signOut()}>
          <Image
            source={require("@/assets/images/back-arrow.png")}
            style={{ width: 30, height: 30 }}
          />
        </Pressable>
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Ingresa el código de 6 dígitos</Text>
        <Text style={styles.subtitle}>Te enviamos un código a tu correo.</Text>
        <Text style={styles.subtitle}>
          Revisá tu bandeja de entrada y el spam.
        </Text>
        <View style={{ marginTop: 40 }}>
          <OtpInput
            length={6}
            value={code}
            onChangeValue={setCode}
            onComplete={(fullCode) => console.log("OTP listo:", fullCode)}
            error={
              code.length === 6 && !/^[A-Z0-9]+$/.test(code)
                ? "Código inválido"
                : undefined
            }
          />

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
              marginTop: 20,
              marginBottom: 40,
            }}
          >
            <Text style={{ color: "#88879C" }}>¿No recibiste el código?</Text>
            <Pressable onPress={() => router.replace("/(auth)/sign-in")}>
              <Text style={{ color: "#ff6f3cff" }}>Reenviar</Text>
            </Pressable>
          </View>
        </View>
        <ThemedButton
          text="Continuar"
          style={{ width: "100%" }}
          onPress={() => validateAccount(code)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "500",
    marginBottom: 20,
    color: "#ff6f3cff",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "400",
    lineHeight: 25,
    color: "#545454",
    alignSelf: "flex-start",
  },
});
