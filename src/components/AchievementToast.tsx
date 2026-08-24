import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { useCasesStore } from '@/src/store/casesStore';
import { ACHIEVEMENTS } from '@/src/data/achievements';

export function AchievementToast() {
  const recentUnlocks = useCasesStore((s) => s.recentUnlocks);
  const clearRecentUnlocks = useCasesStore((s) => s.clearRecentUnlocks);
  const [currentDisplay, setCurrentDisplay] = useState<string | null>(null);

  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (recentUnlocks.length > 0 && !currentDisplay) {
      // Pop the first achievement to display
      const achievementId = recentUnlocks[0];
      setCurrentDisplay(achievementId);
      
      // Haptic and animate in
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      
      translateY.value = withSequence(
        withTiming(60, { duration: 500, easing: Easing.out(Easing.back(1.5)) }),
        withDelay(
          3500,
          withTiming(-100, { duration: 400, easing: Easing.in(Easing.ease) }, (finished) => {
            if (finished) {
              runOnJS(handleToastComplete)();
            }
          })
        )
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withDelay(3600, withTiming(0, { duration: 300 }))
      );
    }
  }, [recentUnlocks, currentDisplay]);

  const handleToastComplete = () => {
    setCurrentDisplay(null);
    clearRecentUnlocks(); // Simplification: we clear all, ideally we'd queue them
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!currentDisplay) return null;

  const achievement = ACHIEVEMENTS.find((a) => a.id === currentDisplay);
  if (!achievement) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle, shadows.lg]}>
      <View style={[styles.iconContainer, { backgroundColor: achievement.color + '20' }]}>
        <Ionicons name={achievement.icon as any} size={24} color={achievement.color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.eyebrow}>ACHIEVEMENT UNLOCKED</Text>
        <Text style={styles.title}>{achievement.title}</Text>
        <Text style={styles.description}>{achievement.description}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  eyebrow: {
    ...typography.micro,
    color: colors.success,
    marginBottom: 2,
  },
  title: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
