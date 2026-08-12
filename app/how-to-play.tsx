import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable, GlassCard, PrimaryButton } from '@/src/components';
import { colors, radius, spacing, typography } from '@/src/theme';

const STEPS: { step: string; title: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { step: '01', title: 'THINK', description: 'Think of anything — a person, place, object, or idea.', icon: 'bulb-outline' },
  { step: '02', title: 'ANSWER', description: "Answer the AI's questions honestly with Yes, No, Maybe, or Don't Know.", icon: 'chatbox-ellipses-outline' },
  { step: '03', title: 'INVESTIGATE', description: 'Watch the AI narrow down the possibilities in real time.', icon: 'search-outline' },
  { step: '04', title: 'DISCOVER', description: 'The AI makes its final guess based on the evidence gathered.', icon: 'bulb' },
  { step: '05', title: 'WIN', description: 'If the AI fails to guess correctly, you win the case.', icon: 'trophy-outline' },
];

export default function HowToPlayScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <AnimatedPressable onPress={() => router.back()} style={styles.closeButton} haptic={false}>
          <Ionicons name="close" size={22} color={colors.textPrimary} />
        </AnimatedPressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={typography.h1}>How to Play</Text>
        <Text style={styles.subtitle}>Five steps to outsmart—or be outsmarted by—the AI.</Text>

        {STEPS.map((s) => (
          <GlassCard key={s.step} style={styles.stepCard}>
            <View style={styles.stepIconWrap}>
              <Ionicons name={s.icon} size={22} color={colors.glowBlue} />
            </View>
            <View style={styles.stepTextWrap}>
              <Text style={styles.stepNumber}>STEP {s.step}</Text>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepDescription}>{s.description}</Text>
            </View>
          </GlassCard>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="GOT IT" icon="checkmark" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  stepCard: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  stepIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(111,168,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepTextWrap: {
    flex: 1,
  },
  stepNumber: {
    ...typography.micro,
    color: colors.electricViolet,
  },
  stepTitle: {
    ...typography.h3,
    marginTop: 2,
    marginBottom: 4,
  },
  stepDescription: {
    ...typography.caption,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
});
