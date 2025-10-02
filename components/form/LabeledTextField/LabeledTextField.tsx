import React, { forwardRef, useMemo, useState } from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  /** Texto de ayuda o de validación */
  helperText?: string;
  /** Si existe, se pinta en rojo y se anuncia a accesibilidad */
  error?: string;
  /** Nodo opcional a la izquierda del input (por ej. ícono) */
  left?: React.ReactNode;
  /** Nodo opcional a la derecha del input (por ej. botón mostrar/ocultar) */
  right?: React.ReactNode;
  /** Estilos opcionales para personalizar desde fuera */
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  helperTextStyle?: TextStyle;
  onRightPress?: (e: GestureResponderEvent) => void;

  /** Activa modo contraseña */
  password?: boolean;
  /** Si true y no se pasa `right`, el componente renderiza un toggle de visibilidad */
  showVisibilityToggle?: boolean;
  /** Texto accesible para el botón de visibilidad */
  visibilityLabels?: {
    show: string; // ej: "Mostrar contraseña"
    hide: string; // ej: "Ocultar contraseña"
  };
} & Omit<
  TextInputProps,
  "onChange" | "onChangeText" | "value" | "secureTextEntry"
>;

const LabeledTextField = forwardRef<TextInput, Props>((props, ref) => {
  const {
    label,
    value,
    onChangeText,
    helperText,
    error,
    left,
    right,
    containerStyle,
    labelStyle,
    inputStyle,
    helperTextStyle,
    onRightPress,
    editable = true,
    password = false,
    showVisibilityToggle = true,
    visibilityLabels = {
      show: "Mostrar contraseña",
      hide: "Ocultar contraseña",
    },
    autoCorrect,
    autoCapitalize,
    textContentType,
    autoComplete,
    ...textInputProps
  } = props;

  const hasError = Boolean(error);
  const [isHidden, setIsHidden] = useState<boolean>(true);

  // Defaults sensatos cuando es password (pueden ser override por props)
  const resolvedTextContentType = useMemo(
    () => (password ? textContentType ?? "password" : textContentType),
    [password, textContentType]
  );
  const resolvedAutoComplete = useMemo(
    () => (password ? autoComplete ?? "password" : autoComplete),
    [password, autoComplete]
  );
  const resolvedAutoCorrect = useMemo(
    () => (password ? autoCorrect ?? false : autoCorrect),
    [password, autoCorrect]
  );
  const resolvedAutoCapitalize = useMemo(
    () => (password ? autoCapitalize ?? "none" : autoCapitalize),
    [password, autoCapitalize]
  );

  const renderRight =
    right ??
    (password && showVisibilityToggle && (
      <Pressable
        style={styles.addonRight}
        accessibilityRole="button"
        accessibilityLabel={
          isHidden ? visibilityLabels.show : visibilityLabels.hide
        }
        onPress={(e) => {
          setIsHidden((s) => !s);
          onRightPress?.(e);
        }}
      >
        {/* Reemplaza por tu ícono (ej. Eye/EyeOff) */}
        <Text style={styles.toggleText}>{isHidden ? "👁️" : "🚫"}</Text>
      </Pressable>
    ));

  return (
    <View style={[styles.container, containerStyle]}>
      <Text
        style={[styles.label, labelStyle]}
        accessibilityRole="text"
        accessibilityLabel={`${label}${hasError ? ". Error: " + error : ""}`}
      >
        {label}
      </Text>

      <View
        style={[
          styles.inputWrapper,
          !editable && styles.inputWrapperDisabled,
          hasError && styles.inputWrapperError,
        ]}
      >
        {left ? <View style={styles.addonLeft}>{left}</View> : null}

        <TextInput
          ref={ref}
          style={[styles.input, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          placeholderTextColor="#8E8E93"
          accessibilityLabel={label}
          accessibilityHint={helperText}
          accessibilityState={{ disabled: !editable }}
          secureTextEntry={password ? isHidden : undefined}
          textContentType={resolvedTextContentType}
          autoComplete={resolvedAutoComplete as any}
          autoCorrect={resolvedAutoCorrect}
          autoCapitalize={resolvedAutoCapitalize as any}
          {...textInputProps}
        />

        {renderRight}
      </View>

      {(hasError || helperText) && (
        <Text
          style={[
            styles.helper,
            hasError ? styles.helperError : styles.helperDefault,
            helperTextStyle,
          ]}
          accessibilityLiveRegion="polite"
        >
          {hasError ? error : helperText}
        </Text>
      )}
    </View>
  );
});

LabeledTextField.displayName = "LabeledTextField";

const styles = StyleSheet.create({
  container: { width: "100%" },
  label: {
    fontSize: 14,
    color: "rgba(44, 44, 44, 1)",
    marginBottom: 6,
    fontWeight: "600",
  },
  inputWrapper: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#e1e1e1ff",
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0ff",
  },
  inputWrapperDisabled: {
    backgroundColor: "rgba(245, 245, 245, 1)",
  },
  inputWrapperError: {
    borderColor: "rgba(209, 48, 48, 1)",
    backgroundColor: " rgba(207, 49, 49, 0.2)",
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  addonLeft: {
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addonRight: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleText: {
    fontSize: 16,
  },
  helper: {
    marginTop: 6,
    fontSize: 12,
  },
  helperDefault: {
    color: "#636366",
  },
  helperError: {
    color: "#FF3B30",
  },
});

export default LabeledTextField;
