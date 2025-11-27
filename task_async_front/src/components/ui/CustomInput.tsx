import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../../theme/colors';

interface CustomInputProps extends TextInputProps {
  multiline?: boolean;
}

export const CustomInput = React.forwardRef<TextInput, CustomInputProps>(
  ({ style, multiline, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        style={[styles.input, multiline && styles.textArea, style]}
        placeholderTextColor={colors.textSecondary}
        {...props}
      />
    );
  }
);

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 120,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
});