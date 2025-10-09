import ThemedButton from "@/components/themed-button";
import { useAuth } from "@/providers/auth";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordSuccessScreen() {
  const { forgotPassword } = useAuth();
  const [timer, setTimer] = useState(30);

  const { email } = useLocalSearchParams();
  const emailString = Array.isArray(email) ? email[0] : email;

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    setTimer(30);
    forgotPassword(emailString);
  };

  const formattedTimer = `00:${timer < 10 ? `0${timer}` : timer}`;

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("@/assets/images/illustration-message.png")}
        style={{ width: 100, height: 100 }}
        resizeMode="contain"
      />

      <Text style={styles.title}>¡Perfecto!</Text>
      <Text style={styles.subtitle}>
        Si el correo está registrado,{" "}
        <Text style={{ fontWeight: "bold" }}>vas a recibir un enlace</Text> para
        crear una nueva contraseña. Revisá tu bandeja de entrada
      </Text>

      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{formattedTimer}</Text>
        <View style={styles.resend}>
          <Text style={{ color: "#88879C" }}>¿No recibiste el enlace?</Text>
          <Pressable onPress={handleResend} disabled={timer > 0}>
            <Text
              style={{
                color: timer > 0 ? "#CCC" : "#FF6F3C",
              }}
            >
              Reenviar
            </Text>
          </Pressable>
        </View>
      </View>

      <ThemedButton
        text="Continuar"
        color="green"
        onPress={() => router.replace("/(auth)/sign-in")}
        style={{ width: "100%", marginTop: 10 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 15,
  },
  title: {
    fontSize: 42,
    fontWeight: "500",
    marginBottom: 20,
    color: "#34A353",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "400",
    lineHeight: 25,
    color: "#545454",
    textAlign: "center",
  },
  timerContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 30,
  },
  timer: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 25,
  },
  resend: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
});
