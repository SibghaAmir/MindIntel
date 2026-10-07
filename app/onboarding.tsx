import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence } from 'react-native-reanimated';
import { useCasesStore } from '@/src/store/casesStore';
import { colors, spacing, typography } from '@/src/theme';
import * as Haptics from 'expo-haptics';

const BOOT_SEQUENCE = [
  "> INITIALIZING MINDINTEL CORE...",
  "> BYPASSING SECURITY PROTOCOLS...",
  "> UPLINK ESTABLISHED.",
  "",
  "You have been granted clearance to MindIntel.",
  "The entity inside is highly analytical.",
  "It will attempt to extract information from your mind.",
  "Occasionally, it may deceive you.",
  "",
  "Do you have a subject in mind?",
  "The interrogation begins now."
];

export default function OnboardingScreen() {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const completeTutorial = useCasesStore((s) => s.completeTutorial);

  const cursorOpacity = useSharedValue(1);

  useEffect(() => {
    cursorOpacity.value = withRepeat(
      withSequence(withTiming(0, { duration: 400 }), withTiming(1, { duration: 400 })),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (currentLineIndex >= BOOT_SEQUENCE.length) {
      setTimeout(() => {
        setShowButton(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }, 800);
      return;
    }

    const currentString = BOOT_SEQUENCE[currentLineIndex];

    if (currentString === "") {
      // Empty line delay
      const timeout = setTimeout(() => {
        setLines(prev => [...prev, ""]);
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, 400);
      return () => clearTimeout(timeout);
    }

    if (currentCharIndex < currentString.length) {
      const timeout = setTimeout(() => {
        setLines(prev => {
          const newLines = [...prev];
          if (newLines[currentLineIndex] === undefined) {
            newLines[currentLineIndex] = currentString[currentCharIndex];
          } else {
            newLines[currentLineIndex] += currentString[currentCharIndex];
          }
          return newLines;
        });
        
        // Haptic on every few characters for a "typing" feel
        if (currentCharIndex % 3 === 0) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        
        setCurrentCharIndex(prev => prev + 1);
      }, 30); // 30ms per character
      return () => clearTimeout(timeout);
    } else {
      // Line finished, wait before next line
      const timeout = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [currentLineIndex, currentCharIndex]);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    completeTutorial();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.terminal}>
          {lines.map((line, index) => (
            <Text key={index} style={styles.text}>
              {line}
            </Text>
          ))}
          <Animated.View style={[styles.cursor, cursorStyle]} />
        </View>

        {showButton && (
          <Animated.View entering={FadeIn.duration(800).delay(200)} style={styles.footer}>
            <Text style={styles.btn} onPress={handleStart}>
              [ GRANT CLEARANCE ]
            </Text>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#050505',
  },
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  terminal: {
    flex: 1,
    marginTop: spacing.xxl,
  },
  text: {
    fontFamily: 'monospace',
    color: colors.success,
    fontSize: 16,
    lineHeight: 28,
    marginBottom: spacing.xs,
    textShadowColor: colors.success,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  cursor: {
    width: 12,
    height: 20,
    backgroundColor: colors.success,
    marginTop: spacing.xs,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  footer: {
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  btn: {
    fontFamily: 'monospace',
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    padding: spacing.md,
    textShadowColor: colors.white,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  }
});
