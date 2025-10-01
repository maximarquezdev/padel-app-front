import { LabeledTextField } from "@/components/form/LabeledTextField";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export const LoginPage = () => {
  return (
    <>
      <ThemedView>
        <ThemedText type="title">Hola!</ThemedText>

        <LabeledTextField
          label="Email"
          value=""
          onChangeText={(text) => console.log(text)}
          error="This field is required"
        />

        <LabeledTextField
          label="Contraseña"
          value={"password"}
          onChangeText={(text) => console.log(text)}
          password
        />
      </ThemedView>
    </>
  );
};
