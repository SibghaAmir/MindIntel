import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  AnimatedPressable,
  AnswerButton,
  ConfidenceBar,
  GlassCard,
  InvestigationCard,
  ProgressIndicator,
  QuestionCard,
  CandidateCard,
} from '@/src/components';
import { colors, radius, spacing, typography } from '@/src/theme';
import { useGameStore } from '@/src/store/gameStore';
import type { AnswerValue } from '@/src/types/game';
import type { CoreState } from '@/src/components';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ANSWER_LABELS: { value: AnswerValue; label: string }[] = [
  { value: 'yes', label: 'YES' },
  { value: 'no', label: 'NO' },
  { value: 'maybe', label: 'MAYBE' },
  { value: 'unknown', label: "DON'T KNOW" },
];

function coreStateForConfidence(confidence: number): CoreState {
  if (confidence >= 85) return 'highConfidence';
  if (confidence >= 55) return 'analyzing';
  return 'thinking';
}

export default function InvestigationScreen() {
  const {
    caseNumber,
    currentQuestion,
    questionNumber,
    maxQuestions,
    confidence,
    snapshot,
    status,
    answerQuestion,
  } = useGameStore();

  const [expanded, setExpanded] = useState(false);
  const isThinking = status === 'thinking';

  useEffect(() => {
    if (status === 'guessing') {
      router.replace('/conclusion');
    }
  }, [status]);

  const handleAnswer = (value: AnswerValue) => {
    answerQuestion(value);
  };

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((e) => !e);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.caseLabel}>CASE #{String(caseNumber).padStart(3, '0')}</Text>
          <Text style={typography.h2}>Investigation</Text>
        </View>
        <Text style={styles.counter}>
          {String(questionNumber).padStart(2, '0')} / {maxQuestions}
        </Text>
      </View>

      <View style={styles.progressWrap}>
        <ProgressIndicator current={questionNumber} total={maxQuestions} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <InvestigationCard
          status={isThinking ? 'THINKING' : 'ANALYZING'}
          message={
            isThinking
              ? "Processing your answer..."
              : "I'm narrowing down the possibilities."
          }
          coreState={isThinking ? 'thinking' : coreStateForConfidence(confidence)}
        />

        <QuestionCard question={currentQuestion} questionKey={questionNumber} />

        <View style={styles.answerGrid}>
          {ANSWER_LABELS.map((a) => (
            <AnswerButton
              key={a.value}
              value={a.value}
              label={a.label}
              onPress={handleAnswer}
              disabled={isThinking}
            />
          ))}
        </View>

        <AnimatedPressable style={styles.expandRow} onPress={toggleExpanded} haptic={false}>
          <Text style={styles.expandLabel}>VIEW INVESTIGATION</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textSecondary}
          />
        </AnimatedPressable>

        {expanded && (
          <GlassCard style={styles.dataPanel} secondary>
            <Text style={typography.eyebrow}>AI Investigation Data</Text>

            <Text style={styles.dataSubheading}>Likely Category</Text>
            {snapshot.categoryBreakdown.map((item) => (
              <ConfidenceBar key={item.label} label={item.label} percentage={item.percentage} />
            ))}

            <View style={styles.metricRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricValue}>{snapshot.candidatesRemaining}</Text>
                <Text style={styles.metricLabel}>Candidates Remaining</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={[styles.metricValue, { color: colors.glowBlue }]}>
                  {snapshot.aiConfidence}%
                </Text>
                <Text style={styles.metricLabel}>AI Confidence</Text>
              </View>
            </View>
            <ConfidenceBar
              label="Confidence"
              percentage={snapshot.aiConfidence}
              color={colors.electricViolet}
              showValue={false}
            />

            <Text style={[styles.dataSubheading, { marginTop: spacing.sm }]}>Top Possibilities</Text>
            {snapshot.topPossibilities.map((name, i) => (
              <CandidateCard key={name} rank={i + 1} name={name} />
            ))}
          </GlassCard>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  caseLabel: {
    ...typography.micro,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  counter: {
    ...typography.statNumber,
    fontSize: 20,
    color: colors.glowBlue,
  },
  progressWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge * 2,
  },
  answerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  expandLabel: {
    ...typography.micro,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  dataPanel: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  dataSubheading: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  metricBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  metricValue: {
    ...typography.statNumber,
    fontSize: 22,
  },
  metricLabel: {
    ...typography.micro,
    marginTop: 2,
    textAlign: 'center',
  },
});
