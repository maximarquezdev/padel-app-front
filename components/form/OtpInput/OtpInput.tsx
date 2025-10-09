import React from "react";
import {
  NativeSyntheticEvent,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";

const ALPHANUMERIC_FILTER = /[^0-9a-zA-Z]/g;

const sanitizeValue = (
  rawValue: string,
  length: number,
  upperCase: boolean
) => {
  const stripped = rawValue.replace(ALPHANUMERIC_FILTER, "");
  const normalized = upperCase ? stripped.toUpperCase() : stripped;
  return normalized.slice(0, length);
};

const buildCharacterArray = (
  rawValue: string,
  length: number,
  upperCase: boolean
): string[] => {
  const sanitized = sanitizeValue(rawValue, length, upperCase);
  return Array.from({ length }, (_, index) => sanitized[index] ?? "");
};

type OtpInputProps = {
  length?: number;
  value: string;
  onChangeValue: (code: string) => void;
  onComplete?: (code: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputsContainerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputTextStyle?: StyleProp<TextStyle>;
  focusedInputStyle?: StyleProp<ViewStyle>;
  helperText?: string;
  error?: string;
  feedbackTextStyle?: StyleProp<TextStyle>;
  upperCase?: boolean;
  testID?: string;
};

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChangeValue,
  onComplete,
  autoFocus = false,
  disabled = false,
  containerStyle,
  inputsContainerStyle,
  inputContainerStyle,
  inputTextStyle,
  focusedInputStyle,
  helperText,
  error,
  feedbackTextStyle,
  upperCase = true,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [characters, setCharacters] = React.useState<string[]>(() =>
    buildCharacterArray(value, length, upperCase)
  );
  const lastValueRef = React.useRef<string>(
    sanitizeValue(value, length, upperCase)
  );
  const configRef = React.useRef({ length, upperCase });

  const inputsRef = React.useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);

  const baseBorderColor = isDarkMode ? "#e3e3e3ff" : "rgba(17,24,28,0.2)";
  const focusBorderColor = "#34A353";
  const errorBorderColor = "#e54335ff";
  const baseBackgroundColor = isDarkMode ? "#e3e3e3ff" : "rgba(17,24,28,0.06)";
  const textColor = "#34A353";
  const helperColor = isDarkMode
    ? "rgba(236,237,238,0.72)"
    : "rgba(17,24,28,0.6)";

  const emitValue = React.useCallback(
    (nextChars: string[]) => {
      const nextValue = nextChars.join("");

      if (nextValue === lastValueRef.current) {
        return;
      }

      lastValueRef.current = nextValue;
      onChangeValue(nextValue);
    },
    [onChangeValue]
  );

  React.useEffect(() => {
    const configChanged =
      configRef.current.length !== length ||
      configRef.current.upperCase !== upperCase;
    const normalizedValue = sanitizeValue(value, length, upperCase);

    if (!configChanged && normalizedValue === lastValueRef.current) {
      return;
    }

    configRef.current = { length, upperCase };
    lastValueRef.current = normalizedValue;
    setCharacters(buildCharacterArray(value, length, upperCase));
  }, [value, length, upperCase]);

  React.useEffect(() => {
    if (!autoFocus || disabled) {
      return;
    }
    const timer = setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, 120);
    return () => clearTimeout(timer);
  }, [autoFocus, disabled]);

  React.useEffect(() => {
    if (characters.every((char) => char.length > 0)) {
      onComplete?.(characters.join(""));
    }
  }, [characters, onComplete]);

  const registerInput = React.useCallback(
    (index: number) => (ref: TextInput | null) => {
      inputsRef.current[index] = ref;
    },
    []
  );

  const handleChangeText = React.useCallback(
    (incoming: string, index: number) => {
      if (disabled) {
        return;
      }

      const sanitizedInput = sanitizeValue(incoming, length - index, upperCase);
      const nextChars = [...characters];

      if (sanitizedInput.length === 0) {
        if (!nextChars[index]) {
          return;
        }

        nextChars[index] = "";
        setCharacters(nextChars);
        emitValue(nextChars);
        return;
      }

      let cursor = index;
      for (const char of sanitizedInput) {
        if (cursor >= length) {
          break;
        }
        nextChars[cursor] = char;
        cursor += 1;
      }

      setCharacters(nextChars);
      emitValue(nextChars);

      const nextFieldIndex = index + sanitizedInput.length;
      if (nextFieldIndex < length) {
        inputsRef.current[nextFieldIndex]?.focus();
      } else {
        inputsRef.current[length - 1]?.blur();
      }
    },
    [characters, disabled, emitValue, length, upperCase]
  );

  const handleKeyPress = React.useCallback(
    (
      event: NativeSyntheticEvent<TextInputKeyPressEventData>,
      index: number
    ) => {
      if (disabled) {
        return;
      }

      if (event.nativeEvent.key !== "Backspace") {
        return;
      }

      if (characters[index]) {
        return;
      }

      const prevIndex = Math.max(index - 1, 0);

      if (characters[prevIndex]) {
        const nextChars = [...characters];
        nextChars[prevIndex] = "";
        setCharacters(nextChars);
        emitValue(nextChars);
      }

      inputsRef.current[prevIndex]?.focus();
    },
    [characters, disabled, emitValue]
  );

  const keyboardType = Platform.select({
    ios: "ascii-capable" as const,
    default: "visible-password" as const,
  });

  const feedbackMessage = error ?? helperText;

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      <View style={[styles.inputsRow, inputsContainerStyle]}>
        {characters.map((char, index) => {
          const isFocused = focusedIndex === index;
          const borderColor = error
            ? errorBorderColor
            : isFocused
            ? focusBorderColor
            : baseBorderColor;

          return (
            <View
              key={index}
              style={[
                styles.inputBox,
                {
                  borderColor,
                  backgroundColor: baseBackgroundColor,
                  opacity: disabled ? 0.6 : 1,
                },
                inputContainerStyle,
                isFocused && focusedInputStyle,
              ]}
            >
              <TextInput
                ref={registerInput(index)}
                style={[styles.textInput, { color: textColor }, inputTextStyle]}
                value={char}
                editable={!disabled}
                maxLength={length}
                importantForAutofill="yes"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                autoCorrect={false}
                autoCapitalize={upperCase ? "characters" : "none"}
                keyboardType={keyboardType}
                selectTextOnFocus
                onFocus={() => setFocusedIndex(index)}
                onBlur={() =>
                  setFocusedIndex((prev) => (prev === index ? null : prev))
                }
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(event) => handleKeyPress(event, index)}
                returnKeyType="done"
                placeholder=""
                allowFontScaling={false}
                accessibilityLabel={`OTP character ${index + 1}`}
              />
            </View>
          );
        })}
      </View>

      {feedbackMessage ? (
        <Text
          style={[
            styles.helperText,
            { color: error ? errorBorderColor : helperColor },
            feedbackTextStyle,
          ]}
        >
          {feedbackMessage}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputsRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  inputBox: {
    width: 50,
    height: 80,
    borderRadius: 4,
    borderWidth: 1,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    width: "100%",
    fontSize: 36,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
  },
  helperText: {
    marginTop: 8,
    fontSize: 13,
    textAlign: "center",
  },
});
