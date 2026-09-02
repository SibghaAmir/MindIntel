import { useTheme } from '@/src/theme/ThemeContext';
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import { colors } from '@/src/theme';

const { width, height } = Dimensions.get('window');
const NUM_CONFETTI = 40;
const CONFETTI_COLORS = [colors.primaryBlue, colors.glowBlue, colors.electricViolet, colors.white];

interface ParticleProps {
  index: number;
}

const Particle = ({ index }: ParticleProps) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Randomize initial positions and targets
  const startX = Math.random() * width;
  const targetY = height + 50;
  const targetX = startX + (Math.random() - 0.5) * 200;
  const spinSpeed = Math.random() * 720 + 360;
  const duration = Math.random() * 2000 + 2000;
  const delay = Math.random() * 500;
  
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const size = Math.random() * 6 + 6;

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(targetY, { duration, easing: Easing.in(Easing.quad) })
    );
    translateX.value = withDelay(
      delay,
      withTiming(targetX, { duration, easing: Easing.linear })
    );
    rotate.value = withDelay(
      delay,
      withRepeat(withTiming(spinSpeed, { duration: duration / 2, easing: Easing.linear }), -1)
    );
    opacity.value = withDelay(
      delay + duration * 0.7,
      withTiming(0, { duration: duration * 0.3 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: startX + translateX.value },
        { translateY: translateY.value },
        { rotateX: `${rotate.value}deg` },
        { rotateY: `${rotate.value * 1.2}deg` },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size * 1.5,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

export const Confetti = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: NUM_CONFETTI }).map((_, i) => (
        <Particle key={i} index={i} />
      ))}
    </View>
  );
};

const useStyles = (colors: any, gradients: any) => StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 2,
  },
});
