import React from 'react';
import { View, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius, shadows } from '@/src/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  secondary?: boolean;
  padded?: boolean;
  glow?: boolean;
  blur?: boolean;
}

export function GlassCard({
  children,
  style,
  secondary = false,
  padded = true,
  glow = false,
  blur = false,
}: GlassCardProps) {
  const content = (
    <View
      style={[
        styles.base,
        { backgroundColor: secondary ? colors.cardSecondary : colors.card },
        padded && styles.padded,
        glow && shadows.glowBlue,
        !blur && shadows.cardSoft,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (blur) {
    return (
      <BlurView intensity={30} tint="dark" style={[styles.blurWrap, style]}>
        <View style={[styles.base, styles.transparentBg, padded && styles.padded]}>
          {children}
        </View>
      </BlurView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: {
    padding: 18,
  },
  blurWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  transparentBg: {
    backgroundColor: 'rgba(24,38,64,0.55)',
  },
});
