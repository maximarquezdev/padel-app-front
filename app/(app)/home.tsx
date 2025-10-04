import { useAuth } from "@/providers/auth";
import { Button, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const { session, signOut } = useAuth();
  console.log(session?.user?.email);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido {session?.user?.email}</Text>
      <Button title="Cerrar Sesión" onPress={() => signOut()} />
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
