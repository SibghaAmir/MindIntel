import { useTheme } from '@/src/theme/ThemeContext';
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable } from './AnimatedPressable';
import { colors, radius, spacing, typography } from '@/src/theme';
import type { AnswerValue } from '@/src/types/game';

interface AnswerButtonProps {
  value: AnswerValue;
  label: string;
  onPress: (value: AnswerValue) => void;
  disabled?: boolean;
}

const ICONS: Record<AnswerValue, keyof typeof Ionicons.glyphMap> = {
  yes: 'checkmark-circle',
  no: 'close-circle',
  maybe: 'help-circle',
  unknown: 'remove-circle',
};

const ACCENT: Record<AnswerValue, string> = {
  yes: colors.success,
  no: colors.danger,
  maybe: colors.warning,
  unknown: colors.textSecondary,
};

export function AnswerButton({ value, label, onPress, disabled }: AnswerButtonProps) {
  const { colors, gradients } = useTheme();
  const styles = useStyles(colors, gradients);

  const accent = ACCENT[value];

  return (
    <AnimatedPressable
      onPress={() => onPress(value)}
      disabled={disabled}
      haptic
      accessibilityRole="button"
      accessibilityLabel={`Answer: ${label}`}
      style={[styles.button, disabled && styles.disabled]}
    >
      <Ionicons name={ICONS[value]} size={22} color={accent} style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
    </AnimatedPressable>
  );
}

const useStyles = (colors: any, gradients: any) => StyleSheet.create({
  button: {
    flexBasis: '48%',
    minHeight: 64,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    ...typography.bodyMedium,
  },
});
