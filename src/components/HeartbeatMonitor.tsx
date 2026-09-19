import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { spacing, typography } from '../theme';

interface HeartbeatMonitorProps {
  currentQuestion: number;
  maxQuestions: number;
  active: boolean;
}

export function HeartbeatMonitor({ currentQuestion, maxQuestions, active }: HeartbeatMonitorProps) {
  const { colors } = useTheme();
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  const dangerRatio = Math.min(currentQuestion / maxQuestions, 1);
  const isDangerZone = maxQuestions - currentQuestion <= 3;
  
  useEffect(() => {
    if (!active) {
      scale.value = withTiming(1);
      opacity.value = withTiming(0.5);
      return;
    }
    
    // BPM from 60 (start) up to 140 (end)
    const bpm = 60 + (dangerRatio * 80);
    const msPerBeat = 60000 / bpm;
    
    const beat = () => {
      // Trigger Haptic safely
      Haptics.impactAsync(isDangerZone ? Haptics.ImpactFeedbackType.Medium : Haptics.ImpactFeedbackType.Soft).catch(() => {});
      
      // Trigger Animation
      scale.value = withSequence(
        withTiming(1.3, { duration: msPerBeat * 0.15, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: msPerBeat * 0.85, easing: Easing.in(Easing.ease) })
      );
      
      opacity.value = withSequence(
        withTiming(1, { duration: msPerBeat * 0.15 }),
        withTiming(0.5, { duration: msPerBeat * 0.85 })
      );
    };

    beat(); // initial beat
    const interval = setInterval(beat, msPerBeat);
    
    return () => clearInterval(interval);
  }, [currentQuestion, maxQuestions, active, isDangerZone, dangerRatio]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const color = isDangerZone ? colors.danger : colors.glowBlue;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconWrap, animatedStyle]}>
        <Ionicons name="fitness" size={28} color={color} />
      </Animated.View>
      <Text style={[styles.label, { color }]}>
        {isDangerZone ? 'STRESS CRITICAL' : 'VITALS STABLE'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  iconWrap: {
    marginRight: spacing.sm,
  },
  label: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 1,
  }
});
