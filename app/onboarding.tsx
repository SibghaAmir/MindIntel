import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton, AIInvestigationCore } from '@/src/components';
import { colors, spacing, typography } from '@/src/theme';
import { useCasesStore } from '@/src/store/casesStore';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    title: 'Initialize AI Core',
    description: 'Welcome to Kasoti. I am an advanced Mind Investigation AI designed to extract information from your thoughts.',
    icon: 'hardware-chip-outline',
  },
  {
    title: 'Establish a Subject',
    description: 'Think of any person, place, or object. I will ask you up to 20 Yes/No questions to profile the entity.',
    icon: 'person-outline',
  },
  {
    title: 'Forensic Analysis',
    description: 'If I narrow down the possibilities and guess your subject correctly, I win. If you can stump me... you win.',
    icon: 'analytics-outline',
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const completeTutorial = useCasesStore((s) => s.completeTutorial);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      completeTutorial();
      router.replace('/(tabs)');
    }
  };

  const current = STEPS[step];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Animated.View 
          key={`icon-${step}`}
          entering={FadeIn.duration(600)}
          exiting={FadeOut.duration(400)}
          style={styles.iconWrapper}
        >
          {step === 0 ? (
            <AIInvestigationCore state="thinking" size={160} />
          ) : (
            <Ionicons name={current.icon as any} size={100} color={colors.glowBlue} />
          )}
        </Animated.View>

        <View style={styles.textContainer}>
          <Animated.Text 
            key={`title-${step}`}
            entering={SlideInRight.duration(500)}
            exiting={SlideOutLeft.duration(400)}
            style={styles.title}
          >
            {current.title}
          </Animated.Text>
          <Animated.Text 
            key={`desc-${step}`}
            entering={SlideInRight.duration(500).delay(100)}
            exiting={SlideOutLeft.duration(400)}
            style={styles.description}
          >
            {current.description}
          </Animated.Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {STEPS.map((_, idx) => (
              <View 
                key={idx} 
                style={[styles.dot, step === idx && styles.dotActive]} 
              />
            ))}
          </View>
          <PrimaryButton 
            label={step === STEPS.length - 1 ? 'BEGIN INVESTIGATION' : 'NEXT'} 
            onPress={handleNext} 
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.huge,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    width: '100%',
    paddingBottom: spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderStrong,
  },
  dotActive: {
    backgroundColor: colors.glowBlue,
    width: 24,
  },
});
