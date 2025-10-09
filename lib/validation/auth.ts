export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldValidationResult = {
  value: string;
  error?: string;
};

type PasswordValidationOptions = {
  minLength?: number;
  fieldLabel?: string;
  missingMessage?: string;
  tooShortMessage?: (minLength: number, fieldLabel: string) => string;
};

type PasswordConfirmationOptions = {
  emptyMessage?: string;
  mismatchMessage?: string;
};

export const defaultFieldMessages = {
  emailRequired: "Ingresa tu email",
  emailInvalid: "Ingresa un email valido",
  passwordRequired: (fieldLabel: string) => `Ingresa tu ${fieldLabel}`,
  passwordTooShort: (fieldLabel: string, minLength: number) =>
    `La ${fieldLabel} debe tener al menos ${minLength} caracteres`,
  passwordConfirmationRequired: "Confirma tu contrasena",
  passwordMismatch: "Las contrasenas no coinciden",
};

const defaultPasswordFieldLabel = "contrasena";

export const validateEmail = (value: string): FieldValidationResult => {
  const trimmed = value.trim();

  if (!trimmed) {
    return { value: trimmed, error: defaultFieldMessages.emailRequired };
  }

  if (!emailPattern.test(trimmed)) {
    return { value: trimmed, error: defaultFieldMessages.emailInvalid };
  }

  return { value: trimmed };
};

export const validatePassword = (
  value: string,
  options: PasswordValidationOptions = {}
): FieldValidationResult => {
  const {
    minLength = 8,
    fieldLabel = defaultPasswordFieldLabel,
    missingMessage,
    tooShortMessage,
  } = options;

  const trimmed = value.trim();

  if (!trimmed) {
    return {
      value: trimmed,
      error:
        missingMessage ?? defaultFieldMessages.passwordRequired(fieldLabel),
    };
  }

  if (trimmed.length < minLength) {
    return {
      value: trimmed,
      error:
        tooShortMessage?.(minLength, fieldLabel) ??
        defaultFieldMessages.passwordTooShort(fieldLabel, minLength),
    };
  }

  return { value: trimmed };
};

export const validatePasswordConfirmation = (
  password: string,
  confirmation: string,
  options: PasswordConfirmationOptions = {}
): FieldValidationResult => {
  const {
    emptyMessage = defaultFieldMessages.passwordConfirmationRequired,
    mismatchMessage = defaultFieldMessages.passwordMismatch,
  } = options;

  const sanitizedPassword = password.trim();
  const trimmedConfirmation = confirmation.trim();

  if (!trimmedConfirmation) {
    return { value: trimmedConfirmation, error: emptyMessage };
  }

  if (sanitizedPassword !== trimmedConfirmation) {
    return { value: trimmedConfirmation, error: mismatchMessage };
  }

  return { value: trimmedConfirmation };
};

export const validateRequired = (
  value: string,
  message: string
): FieldValidationResult => {
  const trimmed = value.trim();

  if (!trimmed) {
    return { value: trimmed, error: message };
  }

  return { value: trimmed };
};
