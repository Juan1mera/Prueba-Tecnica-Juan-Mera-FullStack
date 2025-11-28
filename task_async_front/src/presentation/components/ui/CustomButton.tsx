import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { colors } from '../../theme/colors';

type Variant = 'primary' | 'cancel' | 'disabled';

interface CustomButtonProps extends Omit<TouchableOpacityProps, 'disabled'> {
  title: string;
  variant?: Variant;
  disabled?: boolean;
}

export function CustomButton({
  title,
  variant = 'primary',
  disabled = false,
  style,
  ...props
}: CustomButtonProps) {
  const buttonStyle = [
    styles.button,
    variant === 'primary' && styles.primary,
    variant === 'cancel' && styles.cancel,
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    variant === 'cancel' && styles.cancelText,
    variant === 'primary' && styles.primaryText,
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      activeOpacity={0.8}
      disabled={disabled}
      {...props}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  cancel: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: colors.surface,
  },
  cancelText: {
    color: colors.text,
  },
  disabledText: {
    color: colors.surface,
  },
});