import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, spacing, typography } from '@/src/theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SectionHeader({ title, actionLabel, onActionPress, style }: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <Text style={typography.eyebrow}>{title}</Text>
      {actionLabel && (
        <Text onPress={onActionPress} style={styles.action} accessibilityRole="button">
          {actionLabel}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  action: {
    ...typography.caption,
    color: colors.glowBlue,
    fontWeight: '700',
  },
});
