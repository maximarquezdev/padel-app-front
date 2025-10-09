import React, { forwardRef } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

type ButtonColor = "orange" | "green";
type Props = Omit<TouchableOpacityProps, "children"> & {
  text: string;
  isLoading?: boolean;
  style?: React.CSSProperties;
  onPress?: (event: GestureResponderEvent) => void;
  color?: ButtonColor;
};

const ThemedButton = forwardRef<
  React.ElementRef<typeof TouchableOpacity>,
  Props
>(
  (
    { text, style, onPress, isLoading, color = "orange", disabled, ...rest },
    ref
  ) => {
    const baseColor =
      color === "green"
        ? styles.green.backgroundColor
        : styles.orange.backgroundColor;

    const backgroundColor = disabled
      ? styles.disabled.backgroundColor
      : baseColor;

    return (
      <Pressable
        ref={ref}
        style={[styles.button, { backgroundColor }, style]}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={disabled || isLoading}
        {...rest}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={[styles.buttonText, disabled && styles.disabledText]}>
            {text}
          </Text>
        )}
      </Pressable>
    );
  }
);

ThemedButton.displayName = "ThemedButton";

const styles = StyleSheet.create({
  button: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    height: 48,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  orange: {
    backgroundColor: "#ff6f3cff",
  },
  green: {
    backgroundColor: "#34a353ff",
  },
  disabled: {
    backgroundColor: "#ebc894b2",
  },
  disabledText: {
    color: "#f8f8ffff",
  },
});

export default ThemedButton;
