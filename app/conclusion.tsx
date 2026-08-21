import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AIInvestigationCore, GlassCard, PrimaryButton, SecondaryButton, AnimatedPressable } from '@/src/components';
import { colors, gradients, radius, spacing, typography } from '@/src/theme';
import { useGameStore } from '@/src/store/gameStore';

export default function ConclusionScreen() {
  const guess = useGameStore((s) => s.guess);
  const isAnalyzing = useGameStore((s) => s.isAnalyzing);
  const apiError = useGameStore((s) => s.apiError);
  const confirmGuessCorrect = useGameStore((s) => s.confirmGuessCorrect);
  const rejectGuess = useGameStore((s) => s.rejectGuess);

  const handleCorrect = () => {
    confirmGuessCorrect().then(() => {
        router.replace('/result');
    });
  };

  const handleIncorrect = () => {
    rejectGuess().then(() => {
        const latestStatus = useGameStore.getState().status;
        if (latestStatus === 'playing') {
          router.replace('/investigation');
        } else {
          router.replace('/result');
        }
    });
  };

  useEffect(() => {
    if (apiError) {
      import('expo-haptics').then((Haptics) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      });
    }
  }, [apiError]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {apiError && (
          <AnimatedPressable 
            onPress={() => useGameStore.getState().clearError()}
            style={{ backgroundColor: colors.warning, padding: spacing.sm, borderRadius: radius.sm, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            accessibilityRole="button"
            accessibilityLabel="Dismiss error"
          >
            <Text style={{ color: colors.white, ...typography.caption, flex: 1 }}>{apiError}</Text>
            <Ionicons name="close" size={18} color={colors.white} />
          </AnimatedPressable>
        )}
        <Text style={typography.eyebrow}>Case Conclusion</Text>
        <Text style={styles.headline}>I believe I&apos;ve identified the subject.</Text>

        <View style={styles.coreWrap}>
          <AIInvestigationCore state={isAnalyzing ? 'analyzing' : 'highConfidence'} size={140} />
        </View>

        <LinearGradient colors={gradients.hero} style={styles.candidateCard}>
          <Text style={styles.candidateName}>{guess?.name ?? 'Unknown Subject'}</Text>
          <View style={styles.confidenceRow}>
            <Ionicons name="analytics" size={16} color={colors.glowBlue} />
            <Text style={styles.confidenceText}>{guess?.confidence ?? 0}% Confidence</Text>
          </View>
        </LinearGradient>

        {guess?.reason && (
          <GlassCard style={styles.evidenceCard}>
            <Text style={typography.eyebrow}>AI Explanation</Text>
            <View style={styles.evidenceList}>
                <View style={styles.evidenceRow}>
                  <Ionicons name="information-circle" size={18} color={colors.glowBlue} />
                  <Text style={styles.evidenceText}>{guess.reason}</Text>
                </View>
            </View>
          </GlassCard>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="CASE SOLVED" icon="checkmark-done" onPress={handleCorrect} />
        <SecondaryButton
          label="INCORRECT — CONTINUE"
          icon="refresh"
          onPress={handleIncorrect}
          style={styles.secondaryGap}
        />
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.huge,
  },
  headline: {
    ...typography.h1,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  coreWrap: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  candidateCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  candidateName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 6,
  },
  confidenceText: {
    ...typography.bodyMedium,
    color: colors.glowBlue,
  },
  evidenceCard: {
    marginBottom: spacing.lg,
  },
  evidenceList: {
    marginTop: spacing.sm,
  },
  evidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: spacing.xs,
  },
  evidenceText: {
    ...typography.body,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  secondaryGap: {
    marginTop: spacing.sm,
  },
});
