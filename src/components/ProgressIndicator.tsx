import { useTheme } from '@/src/theme/ThemeContext';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/src/theme';

interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  const { colors, gradients } = useTheme();
  const styles = useStyles(colors, gradients);

  const dots = Array.from({ length: total }, (_, i) => i < current);

  return (
    <View style={styles.row} accessibilityLabel={`Question ${current} of ${total}`}>
      {dots.map((filled, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            {
              backgroundColor: filled ? colors.glowBlue : colors.border,
              opacity: filled ? 1 : 0.6,
            },
          ]}
        />
      ))}
    </View>
  );
}

const useStyles = (colors: any, gradients: any) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: spacing.xxs / 4,
  },
});
