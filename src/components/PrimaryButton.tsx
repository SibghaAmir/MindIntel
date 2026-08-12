import React from 'react';
import { StyleSheet, Text, ViewStyle, StyleProp, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable } from './AnimatedPressable';
import { colors, gradients, radius, shadows, spacing, typography } from '@/src/theme';

interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  icon,
  style,
  fullWidth = true,
}: PrimaryButtonProps) {
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={[fullWidth && styles.fullWidth, shadows.button, style, disabled && styles.disabled]}
    >
      <LinearGradient
        colors={disabled ? [colors.cardSecondary, colors.cardSecondary] : gradients.cta}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={18} color={colors.textPrimary} style={styles.icon} />}
            <Text style={styles.label}>{label}</Text>
          </>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  button: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    ...typography.button,
    color: colors.textPrimary,
  },
});
