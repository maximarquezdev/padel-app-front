import { LabeledTextField } from "@/components/form/LabeledTextField";
import ThemedButton from "@/components/themed-button";
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateRequired,
} from "@/lib/validation/auth";
import { useAuth } from "@/providers/auth";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SignUpData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type SignUpErrors = Partial<Record<keyof SignUpData, string>>;

export default function SignUpScreen() {
  const { signUp, isSubmitting } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<SignUpData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<SignUpErrors>({});

  const isLastStep = currentStep === 2;

  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  const handleChange = (key: keyof SignUpData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await signUp({
        userData: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        },
      });
      console.log(res);
    } catch (error) {
      console.error(error);
    }
  };

  const animateStepChange = (nextStep: number, direction: 1 | -1) => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 140,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: -20 * direction,
        duration: 140,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentStep(nextStep);

      translateX.setValue(20 * direction);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const validateCurrentStep = () => {
    const stepKeys: Array<keyof SignUpData> = [];
    const nextErrors: SignUpErrors = {};
    const updates: Partial<SignUpData> = {};

    switch (currentStep) {
      case 0: {
        stepKeys.push("email");
        const emailValidation = validateEmail(data.email);

        if (emailValidation.error) {
          nextErrors.email = emailValidation.error;
        } else if (emailValidation.value !== data.email) {
          updates.email = emailValidation.value;
        }
        break;
      }
      case 1: {
        stepKeys.push("firstName", "lastName");

        const firstNameValidation = validateRequired(
          data.firstName,
          "Ingresa tu nombre"
        );
        if (firstNameValidation.error) {
          nextErrors.firstName = firstNameValidation.error;
        } else if (firstNameValidation.value !== data.firstName) {
          updates.firstName = firstNameValidation.value;
        }

        const lastNameValidation = validateRequired(
          data.lastName,
          "Ingresa tu apellido"
        );
        if (lastNameValidation.error) {
          nextErrors.lastName = lastNameValidation.error;
        } else if (lastNameValidation.value !== data.lastName) {
          updates.lastName = lastNameValidation.value;
        }
        break;
      }
      case 2:
      default: {
        stepKeys.push("password", "confirmPassword");

        const passwordValidation = validatePassword(data.password, {
          minLength: 8,
        });
        if (passwordValidation.error) {
          nextErrors.password = passwordValidation.error;
        } else {
          if (passwordValidation.value !== data.password) {
            updates.password = passwordValidation.value;
          }

          const confirmationValidation = validatePasswordConfirmation(
            passwordValidation.value,
            data.confirmPassword
          );
          if (confirmationValidation.error) {
            nextErrors.confirmPassword = confirmationValidation.error;
          } else if (confirmationValidation.value !== data.confirmPassword) {
            updates.confirmPassword = confirmationValidation.value;
          }
        }
        break;
      }
    }

    const hasErrors = stepKeys.some((key) => Boolean(nextErrors[key]));

    setErrors((prev) => {
      const next = { ...prev };
      stepKeys.forEach((key) => {
        if (nextErrors[key]) {
          next[key] = nextErrors[key];
        } else {
          delete next[key];
        }
      });
      return next;
    });

    if (hasErrors) {
      return false;
    }

    if (Object.keys(updates).length > 0) {
      setData((prev) => ({ ...prev, ...updates }));
    }

    return true;
  };

  const handleContinue = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (!isLastStep) {
      animateStepChange(currentStep + 1, 1);
      return;
    }

    handleSubmit();
  };

  const handleBack = () => {
    if (currentStep === 0) {
      router.back();
      return;
    }
    animateStepChange(currentStep - 1, -1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View key={`step-${currentStep}`} style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepSubtitle}>
                Ingresa tu correo electronico para crear la cuenta.
              </Text>
            </View>
            <LabeledTextField
              label="Email"
              placeholder="ejemplo@correo.com"
              placeholderTextColor="#9AA0A6"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={data.email}
              error={errors.email}
              onChangeText={(text) => handleChange("email", text)}
            />
          </View>
        );
      case 1:
        return (
          <View key={`step-${currentStep}`} style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepSubtitle}>Contanos quien sos.</Text>
            </View>
            <LabeledTextField
              label="Nombre"
              placeholder="Nombre"
              placeholderTextColor="#9AA0A6"
              autoCapitalize="words"
              value={data.firstName}
              error={errors.firstName}
              onChangeText={(text) => handleChange("firstName", text)}
            />
            <LabeledTextField
              label="Apellido"
              placeholder="Apellido"
              placeholderTextColor="#9AA0A6"
              autoCapitalize="words"
              value={data.lastName}
              error={errors.lastName}
              onChangeText={(text) => handleChange("lastName", text)}
            />
          </View>
        );
      case 2:
      default:
        return (
          <View key={`step-${currentStep}`} style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepSubtitle}>
                Protege tu cuenta creando una contrasena segura (minimo 8
                caracteres).
              </Text>
            </View>

            <LabeledTextField
              key="password"
              label="Contraseña"
              placeholder="Contraseña"
              value={data.password}
              password
              error={errors.password}
              onChangeText={(text) => handleChange("password", text)}
            />

            <LabeledTextField
              key="confirmPassword"
              label="Confirmar contraseña"
              placeholder="Confirmar contraseña"
              value={data.confirmPassword}
              password
              error={errors.confirmPassword}
              onChangeText={(text) => handleChange("confirmPassword", text)}
            />
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <ImageBackground
          style={{ width: "100%", height: "100%" }}
          source={require("@/assets/images/img-green.png")}
          resizeMode="stretch"
        />
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Image
            source={require("@/assets/images/back-arrow.png")}
            style={{ width: 30, height: 30 }}
          />
        </Pressable>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20, marginBottom: 20 }}>
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.title}>Registrate</Text>
          <Text style={styles.underline} />
        </View>

        <Animated.View
          style={[styles.content, { opacity, transform: [{ translateX }] }]}
        >
          {renderStepContent()}
        </Animated.View>

        <View style={styles.footer}>
          <ThemedButton
            text={isLastStep ? "Crear cuenta" : "Continuar"}
            onPress={handleContinue}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          />
        </View>

        <View
          style={{
            marginTop: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 5,
          }}
        >
          <Text>Ya tenes una cuenta?</Text>
          <Pressable onPress={() => router.replace("/(auth)/sign-in")}>
            <Text style={{ color: "#ff6f3cff" }}>Iniciar sesion</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  content: {
    flex: 1,
  },
  title: {
    fontSize: 42,
    fontWeight: "500",
    color: "#424242",
    marginBottom: 10,
  },
  underline: {
    width: 80,
    height: 3,
    backgroundColor: "#FF6F3C",
    marginBottom: 10,
  },
  stepContent: {
    gap: 30,
  },
  stepHeader: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  stepSubtitle: {
    fontSize: 18,
    fontWeight: "400",
    lineHeight: 22,
    color: "#545454",
  },
  footer: {
    paddingBottom: 24,
  },
});
