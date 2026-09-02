import { useTheme } from '@/src/theme/ThemeContext';
import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { GlassCard } from './GlassCard';
import { colors, spacing } from '@/src/theme';

interface QuestionCardProps {
  question: string;
  questionKey: string | number;
}

export function QuestionCard({ question, questionKey }: QuestionCardProps) {
  const { colors, gradients } = useTheme();
  const styles = useStyles(colors, gradients);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = 0;
    translateY.value = 10;
    opacity.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.quad) });
    translateY.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.quad) });
  }, [questionKey]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <GlassCard style={styles.card}>
        <Text style={styles.question}>{question}</Text>
      </GlassCard>
    </Animated.View>
  );
}

const useStyles = (colors: any, gradients: any) => StyleSheet.create({
  card: {
    minHeight: 110,
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  question: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
