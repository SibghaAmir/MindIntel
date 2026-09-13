import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withDelay, interpolate, Extrapolation } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface Props {
  name: string;
  status: 'active' | 'eliminated';
}

export function SuspectCard({ name, status }: Props) {
  const { colors } = useTheme();
  const scale = useSharedValue(status === 'eliminated' ? 1 : 0);
  const opacity = useSharedValue(status === 'eliminated' ? 1 : 0);

  useEffect(() => {
    if (status === 'eliminated' && scale.value === 0) {
      // Trigger elimination animation
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      }, 150);
      
      opacity.value = 1;
      scale.value = withSequence(
        withSpring(1.5, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
    }
  }, [status]);

  const stampStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { rotate: '-15deg' }
      ]
    };
  });

  const cardStyle = useAnimatedStyle(() => {
    return {
      opacity: status === 'eliminated' ? withDelay(200, withSpring(0.6)) : 1
    };
  });

  return (
    <Animated.View style={[styles.card, { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: colors.border }, cardStyle]}>
      <View style={styles.iconWrap}>
        <Ionicons name="person-outline" size={24} color={colors.textSecondary} />
      </View>
      <Text style={[typography.caption, { color: colors.textPrimary, textAlign: 'center', marginTop: spacing.sm }]} numberOfLines={2}>
        {name}
      </Text>
      
      <Animated.View style={[styles.stampContainer, stampStyle]} pointerEvents="none">
        <View style={[styles.stamp, { borderColor: colors.danger }]}>
          <Text style={[styles.stampText, { color: colors.danger }]}>ELIMINATED</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    aspectRatio: 0.85,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    overflow: 'hidden',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  stamp: {
    borderWidth: 3,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  stampText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  }
});
