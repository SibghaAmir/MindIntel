import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Share } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AIInvestigationCore, GlassCard, PrimaryButton, SecondaryButton, StatCard, Confetti, BrainScanModal } from '@/src/components';
import { colors, radius, spacing, typography } from '@/src/theme';
import { useGameStore } from '@/src/store/gameStore';
import { useCasesStore } from '@/src/store/casesStore';
import type { CaseRecord } from '@/src/types/game';

export default function ResultScreen() {
  const { status, guess, questionNumber, maxQuestions, caseNumber, category, resetGame } =
    useGameStore();
  const addCase = useCasesStore((s) => s.addCase);

  const isAiWin = status === 'won';
  const [subjectInput, setSubjectInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [scanVisible, setScanVisible] = useState(false);

  useEffect(() => {
    if (!isAiWin) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [isAiWin]);

  const score = useMemo(() => {
    const base = 1000;
    const penalty = questionNumber * 18;
    return Math.max(200, base - penalty + (guess?.confidence ?? 0) * 3);
  }, [questionNumber, guess]);

  const handleNewCase = () => {
    const record: CaseRecord = {
      id: `case-${Date.now()}`,
      caseNumber,
      subject: isAiWin ? guess?.name ?? 'Unknown Subject' : subjectInput || 'Undisclosed subject',
      category: category ?? 'anything',
      questionsUsed: questionNumber,
      maxQuestions,
      result: isAiWin ? 'ai_victory' : 'player_victory',
      confidence: guess?.confidence ?? 0,
      score,
      date: new Date().toISOString().slice(0, 10),
    };
    addCase(record);
    resetGame();
    router.replace('/(tabs)');
  };

  const handleSubmitPlayerCase = () => {
    setSubmitted(true);
  };

  const handleShare = async () => {
    try {
      const message = isAiWin
        ? `I just played Kasoti! The AI guessed my subject ('${guess?.name}') with ${guess?.confidence}% confidence in only ${questionNumber} questions! Can you beat it?`
        : `I just outsmarted the Kasoti AI! It couldn't guess my subject even after ${maxQuestions} questions! Can you beat my record?`;
      
      await Share.share({
        message,
        title: 'MindIntel Kasoti AI',
      });
    } catch (error) {
      console.log('Error sharing', error);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.coreWrap}>
          <AIInvestigationCore state={isAiWin ? 'success' : 'failure'} size={150} />
        </View>

        {isAiWin ? (
          <>
            <Text style={styles.headline}>CASE CLOSED</Text>
            <Text style={styles.subheadline}>Subject Identified</Text>

            <View style={styles.statsRow}>
              <StatCard
                label="Questions Used"
                value={`${questionNumber} / ${maxQuestions}`}
                icon="help-circle-outline"
                accentColor={colors.glowBlue}
              />
              <StatCard
                label="AI Confidence"
                value={`${guess?.confidence ?? 0}%`}
                icon="analytics-outline"
                accentColor={colors.electricViolet}
              />
            </View>
            <StatCard
              label="Investigation Score"
              value={score}
              icon="trophy-outline"
              accentColor={colors.success}
              style={styles.scoreCard}
            />
          </>
        ) : (
          <>
            <Text style={styles.headline}>CASE UNSOLVED</Text>
            <Text style={styles.subheadline}>You Outsmarted the AI</Text>

            <View style={styles.statsRow}>
              <StatCard
                label="Questions Used"
                value={`${maxQuestions} / ${maxQuestions}`}
                icon="help-circle-outline"
                accentColor={colors.warning}
              />
            </View>

            <GlassCard style={styles.inputCard}>
              <Text style={typography.eyebrow}>What were you thinking of?</Text>
              {submitted ? (
                <View style={styles.submittedRow}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={styles.submittedText}>
                    Case added to investigation database.
                  </Text>
                </View>
              ) : (
                <>
                  <TextInput
                    value={subjectInput}
                    onChangeText={setSubjectInput}
                    placeholder="Type the subject here"
                    placeholderTextColor={colors.textTertiary}
                    style={styles.input}
                    accessibilityLabel="What were you thinking of?"
                  />
                  <SecondaryButton
                    label="SUBMIT CASE"
                    icon="send"
                    onPress={handleSubmitPlayerCase}
                    disabled={!subjectInput.trim()}
                    style={styles.submitButton}
                  />
                </>
              )}
            </GlassCard>
          </>
        )}

        <View style={{ marginTop: spacing.lg, width: '100%' }}>
          <SecondaryButton
            label="VIEW AI BRAIN SCAN"
            icon="hardware-chip-outline"
            onPress={() => setScanVisible(true)}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="NEW CASE" icon="add-circle" onPress={handleNewCase} />
        <View style={styles.buttonRow}>
          <SecondaryButton
            label="SHARE"
            icon="share-social-outline"
            onPress={handleShare}
            style={styles.flexButton}
          />
          <SecondaryButton
            label="VIEW CASE"
            icon="document-text-outline"
            onPress={() => router.replace('/(tabs)/cases')}
            style={styles.flexButton}
          />
        </View>
      </View>
      {!isAiWin && <Confetti />}
      <BrainScanModal visible={scanVisible} onClose={() => setScanVisible(false)} />
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.huge,
    alignItems: 'center',
  },
  coreWrap: {
    marginBottom: spacing.lg,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  subheadline: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.sm,
  },
  scoreCard: {
    width: '100%',
  },
  inputCard: {
    width: '100%',
    marginTop: spacing.sm,
  },
  input: {
    marginTop: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 15,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  submittedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  submittedText: {
    ...typography.caption,
    color: colors.success,
  },
  footer: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  secondaryGap: {
    marginTop: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
});
