import React, { forwardRef } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

type Props = Omit<TouchableOpacityProps, "children"> & {
  text: string;
  isLoading?: boolean;
  style?: React.CSSProperties;
  onPress?: (event: GestureResponderEvent) => void;
};

const ThemedButton = forwardRef<
  React.ElementRef<typeof TouchableOpacity>,
  Props
>(({ text, style, onPress, isLoading, ...rest }, ref) => {
  return (
    <TouchableOpacity
      ref={ref}
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={styles.buttonText}>{text}</Text>
      )}
    </TouchableOpacity>
  );
});

ThemedButton.displayName = "ThemedButton";

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#ff6f3cff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default ThemedButton;
