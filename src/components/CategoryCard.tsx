import { useTheme } from '@/src/theme/ThemeContext';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from './AnimatedPressable';
import { colors, gradients, radius, shadows, spacing, typography } from '@/src/theme';
import type { CategoryOption } from '@/src/types/game';

interface CategoryCardProps {
  option: CategoryOption;
  selected: boolean;
  onPress: () => void;
}

export function CategoryCard({ option, selected, onPress }: CategoryCardProps) {
  const { colors, gradients } = useTheme();
  const styles = useStyles(colors, gradients);

  const emphasized = option.emphasized;

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${option.label}. ${option.description}`}
      accessibilityState={{ selected }}
      style={[
        styles.card,
        emphasized && styles.emphasizedCard,
        selected && styles.selectedCard,
        selected && shadows.glowBlue,
      ]}
    >
      {selected ? (
        <LinearGradient
          colors={gradients.cardSheen}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: selected ? 'rgba(111,168,255,0.18)' : 'rgba(155,168,192,0.08)' },
        ]}
      >
        <Ionicons
          name={option.icon}
          size={22}
          color={selected ? colors.glowBlue : colors.textSecondary}
        />
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
      {emphasized && <Text style={styles.badge}>ALL POSSIBILITIES</Text>}
    </AnimatedPressable>
  );
}

const useStyles = (colors: any, gradients: any) => StyleSheet.create({
  card: {
    flexBasis: '48%',
    minHeight: 108,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.md,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emphasizedCard: {
    borderColor: 'rgba(123,97,255,0.4)',
    backgroundColor: colors.cardSecondary,
  },
  selectedCard: {
    borderColor: colors.glowBlue,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.bodyMedium,
  },
  labelSelected: {
    color: colors.glowBlue,
  },
  badge: {
    ...typography.micro,
    color: colors.electricViolet,
    marginTop: 4,
  },
});
