import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { colors } from '@/src/theme';

export type CoreState =
  | 'idle'
  | 'thinking'
  | 'analyzing'
  | 'highConfidence'
  | 'success'
  | 'failure';

interface AIInvestigationCoreProps {
  state?: CoreState;
  size?: number;
}

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedView = Animated.View;

const STATE_COLOR: Record<CoreState, string> = {
  idle: colors.primaryBlue,
  thinking: colors.electricViolet,
  analyzing: colors.glowBlue,
  highConfidence: colors.glowBlue,
  success: colors.success,
  failure: colors.warning,
};

export function AIInvestigationCore({ state = 'idle', size = 200 }: AIInvestigationCoreProps) {
  const pulse = useSharedValue(1);
  const rotate = useSharedValue(0);
  const ringOpacity = useSharedValue(0.5);
  const glowScale = useSharedValue(1);

  useEffect(() => {
    cancelAnimation(pulse);
    cancelAnimation(rotate);
    cancelAnimation(ringOpacity);
    cancelAnimation(glowScale);

    switch (state) {
      case 'idle':
        pulse.value = withRepeat(
          withSequence(
            withTiming(1.04, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
            withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        );
        rotate.value = withRepeat(withTiming(360, { duration: 40000, easing: Easing.linear }), -1);
        glowScale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 2600 }),
            withTiming(0.95, { duration: 2600 })
          ),
          -1,
          true
        );
        break;
      case 'thinking':
        pulse.value = withRepeat(
          withSequence(
            withTiming(1.08, { duration: 700, easing: Easing.inOut(Easing.quad) }),
            withTiming(0.96, { duration: 700, easing: Easing.inOut(Easing.quad) })
          ),
          -1,
          true
        );
        rotate.value = withRepeat(withTiming(360, { duration: 6000, easing: Easing.linear }), -1);
        break;
      case 'analyzing':
        pulse.value = withRepeat(
          withSequence(
            withTiming(1.06, { duration: 900 }),
            withTiming(0.98, { duration: 900 })
          ),
          -1,
          true
        );
        rotate.value = withRepeat(withTiming(360, { duration: 12000, easing: Easing.linear }), -1);
        ringOpacity.value = withRepeat(
          withSequence(withTiming(0.9, { duration: 1000 }), withTiming(0.3, { duration: 1000 })),
          -1,
          true
        );
        break;
      case 'highConfidence':
        pulse.value = withRepeat(
          withSequence(
            withTiming(1.12, { duration: 500 }),
            withTiming(1, { duration: 500 })
          ),
          -1,
          true
        );
        rotate.value = withRepeat(withTiming(360, { duration: 4000, easing: Easing.linear }), -1);
        glowScale.value = withRepeat(
          withSequence(withTiming(1.25, { duration: 700 }), withTiming(1, { duration: 700 })),
          -1,
          true
        );
        break;
      case 'success':
        pulse.value = withSequence(
          withTiming(1.25, { duration: 350, easing: Easing.out(Easing.exp) }),
          withTiming(1.05, { duration: 500 })
        );
        glowScale.value = withTiming(1.3, { duration: 600 });
        break;
      case 'failure':
        pulse.value = withSequence(
          withTiming(0.9, { duration: 300 }),
          withTiming(1, { duration: 300 })
        );
        break;
    }
  }, [state]);

  const coreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: ringOpacity.value,
  }));

  const activeColor = STATE_COLOR[state];
  const center = size / 2;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <AnimatedView style={[StyleSheet.absoluteFill, styles.center, glowAnimatedStyle]}>
        <View
          style={{
            width: size * 0.9,
            height: size * 0.9,
            borderRadius: size,
            backgroundColor: activeColor,
            opacity: 0.18,
          }}
        />
      </AnimatedView>

      <AnimatedView style={[StyleSheet.absoluteFill, styles.center, ringAnimatedStyle]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <RadialGradient id="ringGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={activeColor} stopOpacity="0" />
              <Stop offset="100%" stopColor={activeColor} stopOpacity="0.9" />
            </RadialGradient>
          </Defs>
          <Circle
            cx={center}
            cy={center}
            r={size * 0.42}
            stroke={activeColor}
            strokeOpacity={0.35}
            strokeWidth={1.5}
            fill="none"
            strokeDasharray="4 10"
          />
          <Circle
            cx={center}
            cy={center}
            r={size * 0.36}
            stroke={activeColor}
            strokeOpacity={0.5}
            strokeWidth={1}
            fill="none"
          />
        </Svg>
      </AnimatedView>

      <AnimatedView style={[styles.center, coreAnimatedStyle]}>
        <Svg width={size * 0.56} height={size * 0.56} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="coreGrad" cx="38%" cy="32%" r="70%">
              <Stop offset="0%" stopColor={colors.white} stopOpacity="0.9" />
              <Stop offset="35%" stopColor={activeColor} stopOpacity="0.95" />
              <Stop offset="100%" stopColor={colors.electricViolet} stopOpacity="0.9" />
            </RadialGradient>
          </Defs>
          <Circle cx={50} cy={50} r={44} fill="url(#coreGrad)" />
        </Svg>
      </AnimatedView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
