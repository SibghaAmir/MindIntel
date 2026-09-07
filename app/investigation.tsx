import { useTheme } from '@/src/theme/ThemeContext';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, LayoutAnimation, Platform, UIManager, TextInput } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS } from 'react-native-reanimated';
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
  SecondaryButton,
} from '@/src/components';
import { colors, radius, spacing, typography } from '@/src/theme';
import { useGameStore } from '@/src/store/gameStore';
import { useSettingsStore } from '@/src/store/settingsStore';
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

function TimeAttackBar({ active, onExpire, questionKey }: { active: boolean, onExpire: () => void, questionKey: number }) {
  const { colors } = useTheme();
  const progress = useSharedValue(1);

  useEffect(() => {
    if (active) {
      progress.value = 1;
      progress.value = withTiming(0, { duration: 10000, easing: Easing.linear }, (finished) => {
        if (finished) {
          runOnJS(onExpire)();
        }
      });
    } else {
      progress.value = 1;
    }
  }, [active, questionKey]);

  const style = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    backgroundColor: progress.value < 0.25 ? colors.danger : colors.glowBlue
  }));

  return (
    <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: spacing.md }}>
      <Animated.View style={[{ height: '100%', borderRadius: 3 }, style]} />
    </View>
  );
}

export default function InvestigationScreen() {
  const { colors, gradients } = useTheme();
  const styles = useStyles(colors, gradients);
  const timeAttack = useSettingsStore((s) => s.timeAttack);

  const {
    caseNumber,
    mode,
    questions,
    answers,
    currentQuestion,
    questionNumber,
    maxQuestions,
    confidence,
    snapshot,
    status,
    isAnalyzing,
    apiError,
    answerQuestion,
  } = useGameStore();

  const [expanded, setExpanded] = useState(false);
  const [reverseInput, setReverseInput] = useState('');
  const isThinking = isAnalyzing; // We use isAnalyzing for the loading state

  useEffect(() => {
    if (status === 'won' || status === 'lost' || (status === 'guessing' && !isAnalyzing)) {
      router.replace('/conclusion');
    }
  }, [status, isAnalyzing]);

  useEffect(() => {
    if (apiError) {
      import('expo-haptics').then((Haptics) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      });
    }
  }, [apiError]);

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
        <InvestigationCard
          status={isThinking ? (mode === 'reverse' ? 'AI IS THINKING...' : 'AI IS ANALYZING...') : (mode === 'reverse' ? 'YOUR TURN' : 'ANALYZING')}
          message={
            isThinking
              ? "Communicating with backend..."
              : (mode === 'reverse' ? "Ask me a Yes/No question, or guess!" : "I'm narrowing down the possibilities.")
          }
          coreState={isThinking ? 'thinking' : coreStateForConfidence(confidence)}
        />

        {timeAttack && mode !== 'reverse' && (
          <TimeAttackBar
            active={!isThinking && status === 'playing'}
            onExpire={() => handleAnswer('unknown')}
            questionKey={questionNumber}
          />
        )}

        {mode === 'reverse' ? (
          <View style={styles.reverseWrap}>
            {answers.map((qa, i) => (
              <View key={i} style={styles.reverseQARow}>
                <Text style={styles.reverseQText}>Q: {qa.question}</Text>
                <Text style={[styles.reverseAText, qa.answer === 'yes' ? { color: colors.success } : qa.answer === 'no' ? { color: colors.danger } : { color: colors.warning }]}>
                  A: {String(qa.answer || '').toUpperCase()}
                </Text>
              </View>
            ))}
            
            <View style={styles.reverseInputRow}>
              <import_react_native.TextInput
                style={[styles.reverseInput, { color: colors.textPrimary, borderColor: colors.borderStrong }]}
                placeholder="Ask a Yes/No question..."
                placeholderTextColor={colors.textTertiary}
                value={reverseInput}
                onChangeText={setReverseInput}
                onSubmitEditing={() => {
                  if (reverseInput.trim()) {
                    handleAnswer(reverseInput.trim());
                    setReverseInput('');
                  }
                }}
                editable={!isThinking}
              />
              <AnimatedPressable
                onPress={() => {
                  if (reverseInput.trim()) {
                    handleAnswer(reverseInput.trim());
                    setReverseInput('');
                  }
                }}
                disabled={isThinking || !reverseInput.trim()}
                style={[styles.reverseSendBtn, { backgroundColor: colors.glowBlue }]}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </AnimatedPressable>
            </View>
          </View>
        ) : (
          <>
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

            <View style={{ marginTop: spacing.md }}>
              <SecondaryButton
                label="FORCE AI TO GUESS NOW"
                icon="flash"
                onPress={() => useGameStore.getState().forceGuess()}
                disabled={isThinking || questionNumber < 3}
              />
            </View>
          </>
        )}

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

const useStyles = (colors: any, gradients: any) => StyleSheet.create({
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
  reverseWrap: {
    flex: 1,
  },
  reverseQARow: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  reverseQText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  reverseAText: {
    ...typography.caption,
    fontWeight: '800',
  },
  reverseInputRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  reverseInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    fontSize: 15,
  },
  reverseSendBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
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
