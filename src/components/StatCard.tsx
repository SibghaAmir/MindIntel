import { useTheme } from '@/src/theme/ThemeContext';
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { colors, spacing, typography } from '@/src/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function StatCard({ label, value, icon, accentColor = colors.glowBlue, style }: StatCardProps) {
  const { colors, gradients } = useTheme();
  const styles = useStyles(colors, gradients);

  return (
    <GlassCard style={[styles.card, style]} secondary>
      {icon && (
        <View style={[styles.iconWrap, { backgroundColor: `${accentColor}22` }]}>
          <Ionicons name={icon} size={16} color={accentColor} />
        </View>
      )}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </GlassCard>
  );
}

const useStyles = (colors: any, gradients: any) => StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.statNumber,
  },
  label: {
    ...typography.caption,
    marginTop: 2,
  },
});
