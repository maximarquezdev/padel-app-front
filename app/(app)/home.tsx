// app/(app)/home.tsx
import { router } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function HomeScreen() {
  const { signOut } = useAuth();

  const onLogout = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Área privada</Text>
      <Button title="Cerrar sesión" onPress={onLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  title: { fontSize: 22 },
});
