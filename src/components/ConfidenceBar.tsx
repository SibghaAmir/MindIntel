import { useTheme } from '@/src/theme/ThemeContext';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '@/src/theme';

interface ConfidenceBarProps {
  label: string;
  percentage: number;
  color?: string;
  showValue?: boolean;
}

export function ConfidenceBar({
  label,
  percentage,
  color = colors.glowBlue,
  showValue = true,
}: ConfidenceBarProps) {
  const { colors, gradients } = useTheme();
  const styles = useStyles(colors, gradients);

  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(percentage, { duration: 500 });
  }, [percentage]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={typography.caption}>{label}</Text>
        {showValue && <Text style={styles.value}>{Math.round(percentage)}%</Text>}
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: color }, animatedStyle]} />
      </View>
    </View>
  );
}

const useStyles = (colors: any, gradients: any) => StyleSheet.create({
  wrap: {
    marginBottom: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  value: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(155,168,192,0.15)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
