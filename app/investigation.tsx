import { useTheme } from '@/src/theme/ThemeContext';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, LayoutAnimation, Platform, UIManager, TextInput } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS, withRepeat } from 'react-native-reanimated';
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
  SuspectCard,
  BlackMarketModal,
  HeartbeatMonitor,
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

function scrambleText(text: string): string {
  if (Math.random() > 0.4) return text;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!';
  return text.split('').map(c => (c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)])).join('');
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
  const baseTimeAttack = useSettingsStore((s) => s.timeAttack);
  const blackoutMode = useSettingsStore((s) => s.blackoutMode);
  const personality = useGameStore((s) => s.personality);
  const timeAttack = baseTimeAttack || personality === 'bad_cop';

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
    hint,
    hintUsed,
    requestHint,
    contradiction,
    clearContradiction,
    evidenceBoard = [],
    polygraphActive,
    doppelgangerHistory = [],
    hivemindLogs = [],
  } = useGameStore();

  const [expanded, setExpanded] = useState(false);
  const [blackMarketVisible, setBlackMarketVisible] = useState(false);
  const coreScale = useSharedValue(1);
  const [reverseInput, setReverseInput] = useState('');
  const [doppelgangerAnswer, setDoppelgangerAnswer] = useState<AnswerValue | null>(null);
  const isThinking = isAnalyzing; // We use isAnalyzing for the loading state

  const isDangerZone = maxQuestions - questionNumber <= 3;
  const dangerPulse = useSharedValue(0);

  const { retconActive, applyRetcon, answers } = useGameStore();

  useEffect(() => {
    if (isDangerZone && status === 'playing' && !isThinking) {
      dangerPulse.value = withRepeat(withTiming(0.15, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true);
    } else {
      dangerPulse.value = withTiming(0, { duration: 500 });
    }
  }, [isDangerZone, status, isThinking]);

  const dangerStyle = useAnimatedStyle(() => ({
    opacity: dangerPulse.value,
  }));

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

  useEffect(() => {
    if (status === 'guessing' && useGameStore.getState().guess?.name) {
      import('@/src/services/audioManager').then(({ audioManager }) => {
        audioManager.speak(`Is it... ${useGameStore.getState().guess?.name}?`);
      });
      return;
    }
    
    const isReverseFamily = mode === 'reverse' || mode === 'deception' || mode === 'decoy' || mode === 'syndicate';
    
    if (isReverseFamily) {
      if (answers.length > 0 && !isAnalyzing) {
        const lastAns = answers[answers.length - 1];
        if (lastAns && lastAns.answer !== '...') {
          import('@/src/services/audioManager').then(({ audioManager }) => {
            audioManager.speak(lastAns.answer);
          });
        }
      }
    } else {
      if (currentQuestion && status === 'playing' && !isAnalyzing) {
        import('@/src/services/audioManager').then(({ audioManager }) => {
          audioManager.speak(currentQuestion);
        });
      }
    }
  }, [currentQuestion, status, answers.length, isAnalyzing]);

  const handleAnswer = (value: AnswerValue) => {
    answerQuestion(value);
  };

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((e) => !e);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.danger, zIndex: 100 }, dangerStyle]} />
      <View style={styles.header}>
        <View>
          <Text style={styles.caseLabel}>CASE #{String(caseNumber).padStart(3, '0')}</Text>
          <Text style={typography.h2}>Investigation</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <AnimatedPressable onPress={() => setBlackMarketVisible(true)} style={{ marginBottom: 4 }}>
            <Ionicons name="cart" size={24} color={colors.danger} />
          </AnimatedPressable>
          <Text style={styles.counter}>
            {String(questionNumber).padStart(2, '0')} / {maxQuestions}
          </Text>
        </View>
      </View>

      <HeartbeatMonitor currentQuestion={questionNumber} maxQuestions={maxQuestions} active={status === 'playing' && !isThinking} />

      <View style={styles.progressWrap}>
        <ProgressIndicator current={questionNumber} total={maxQuestions} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {contradiction && (
          <GlassCard style={{ backgroundColor: colors.danger, marginBottom: spacing.md, padding: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
              <Ionicons name="warning" size={20} color={colors.white} style={{ marginRight: 8 }} />
              <Text style={{ ...typography.h3, color: colors.white }}>CONTRADICTION DETECTED</Text>
            </View>
            <Text style={{ ...typography.bodyMedium, color: colors.white, marginBottom: spacing.md }}>
              {contradiction}
            </Text>
            <Text style={{ ...typography.caption, color: colors.white, marginBottom: spacing.md, fontStyle: 'italic' }}>
              Penalty: 2 Questions Added
            </Text>
            <SecondaryButton 
              label="ACCEPT PENALTY" 
              icon="checkmark-circle-outline" 
              onPress={clearContradiction} 
            />
          </GlassCard>
        )}

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
          status={isThinking ? ((mode === 'reverse' || mode === 'deception') ? 'AI IS THINKING...' : 'AI IS ANALYZING...') : (status === 'desperation' ? 'SYSTEM FAILURE' : ((mode === 'reverse' || mode === 'deception') ? 'YOUR TURN' : 'ANALYZING'))}
          message={
            isThinking
              ? "Communicating with backend..."
              : (status === 'desperation' ? "I cannot compute an answer. Give me one final clue." : ((mode === 'reverse' || mode === 'deception') ? "Ask me a Yes/No question, or guess!" : (polygraphActive ? `Current Confidence: ${confidence}%` : (blackoutMode ? "ERR: [SENSORS OFFLINE]" : "I'm narrowing down the possibilities."))))
          }
          coreState={isThinking ? 'thinking' : (status === 'desperation' ? 'highConfidence' : coreStateForConfidence(confidence))}
        />

        {timeAttack && mode !== 'reverse' && mode !== 'deception' && (
          <TimeAttackBar
            active={!isThinking && status === 'playing'}
            onExpire={() => handleAnswer('unknown')}
            questionKey={questionNumber}
          />
        )}

        {mode === 'reverse' || mode === 'deception' || mode === 'decoy' || mode === 'syndicate' ? (
          <View style={styles.reverseWrap}>
            {mode === 'deception' && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                <Text style={{ ...typography.caption, color: colors.warning }}>THE LIAR'S PARADOX ACTIVE</Text>
                {useGameStore.getState().factChecksRemaining > 0 && answers.length > 0 && (
                  <SecondaryButton 
                    label="FACT CHECK" 
                    icon="shield-checkmark" 
                    onPress={() => useGameStore.getState().factCheck()} 
                    disabled={isThinking}
                    style={{ paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, minHeight: 0 }}
                  />
                )}
              </View>
            )}
            {mode === 'decoy' && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                <Text style={{ ...typography.caption, color: colors.electricViolet }}>THE DECOY PROTOCOL ACTIVE</Text>
              </View>
            )}
            {mode === 'syndicate' && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                <Text style={{ ...typography.caption, color: colors.glowBlue }}>THE SYNDICATE ACTIVE</Text>
              </View>
            )}
            {answers.map((qa, i) => (
              <View key={i} style={styles.reverseQARow}>
                <Text style={styles.reverseQText}>Q: {blackoutMode ? scrambleText(qa.question) : qa.question}</Text>
                <Text style={[styles.reverseAText, qa.answer === 'yes' ? { color: colors.success } : qa.answer === 'no' ? { color: colors.danger } : { color: colors.warning }]}>
                  {qa.agent ? `[${qa.agent.toUpperCase()}]: ` : 'A: '}
                  {blackoutMode ? scrambleText(String(qa.answer || '').toUpperCase()) : String(qa.answer || '').toUpperCase()}
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
                  if (reverseInput.trim() && mode !== 'syndicate') {
                    handleAnswer(reverseInput.trim());
                    setReverseInput('');
                  }
                }}
                editable={!isThinking}
              />
              {mode !== 'syndicate' ? (
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
              ) : null}
            </View>
            
            {mode === 'syndicate' && (
              <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs }}>
                <SecondaryButton 
                  label="SCIENTIST" 
                  onPress={() => {
                    if (reverseInput.trim()) {
                      useGameStore.getState().askSyndicate(reverseInput.trim(), 'scientist');
                      setReverseInput('');
                    }
                  }}
                  disabled={isThinking || !reverseInput.trim()} 
                  style={{ flex: 1, paddingVertical: 8, minHeight: 0 }} 
                />
                <SecondaryButton 
                  label="HISTORIAN" 
                  onPress={() => {
                    if (reverseInput.trim()) {
                      useGameStore.getState().askSyndicate(reverseInput.trim(), 'historian');
                      setReverseInput('');
                    }
                  }}
                  disabled={isThinking || !reverseInput.trim()} 
                  style={{ flex: 1, paddingVertical: 8, minHeight: 0 }} 
                />
                <SecondaryButton 
                  label="DETECTIVE" 
                  onPress={() => {
                    if (reverseInput.trim()) {
                      useGameStore.getState().askSyndicate(reverseInput.trim(), 'detective');
                      setReverseInput('');
                    }
                  }}
                  disabled={isThinking || !reverseInput.trim()} 
                  style={{ flex: 1, paddingVertical: 8, minHeight: 0 }} 
                />
              </View>
            )}

            {mode === 'decoy' && (
              <SecondaryButton
                label="SUBMIT PROTOCOL GUESS"
                icon="checkmark-done"
                onPress={() => useGameStore.setState({ retconActive: false /* fallback */, decoyGuessVisible: true } as any)}
                disabled={isThinking}
                style={{ marginTop: spacing.md, borderColor: colors.electricViolet }}
              />
            )}
          </View>
        ) : status === 'desperation' ? (
          <GlassCard style={{ borderColor: colors.danger, borderWidth: 2, padding: spacing.lg, marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
              <Ionicons name="warning" size={24} color={colors.danger} />
              <Text style={{ ...typography.h3, color: colors.danger, marginLeft: spacing.xs }}>CRITICAL FAILURE</Text>
            </View>
            <Text style={{ ...typography.bodyMedium, color: colors.textPrimary, marginBottom: spacing.md }}>
              I am out of questions and unable to form a conclusion. However, my analytical engine requires resolution.
            </Text>
            <Text style={{ ...typography.bodyMedium, color: colors.warning, marginBottom: spacing.lg }}>
              Provide a SINGLE WORD clue. I will make one final desperation guess based on everything we've gathered.
            </Text>
            
            <View style={styles.reverseInputRow}>
              <import_react_native.TextInput
                style={[styles.reverseInput, { color: colors.textPrimary, borderColor: colors.danger }]}
                placeholder="Enter one final clue..."
                placeholderTextColor={colors.textTertiary}
                value={reverseInput}
                onChangeText={setReverseInput}
                onSubmitEditing={() => {
                  if (reverseInput.trim()) {
                    useGameStore.getState().submitDesperationClue(reverseInput.trim());
                    setReverseInput('');
                  }
                }}
                editable={!isThinking}
              />
              <AnimatedPressable
                onPress={() => {
                  if (reverseInput.trim()) {
                    useGameStore.getState().submitDesperationClue(reverseInput.trim());
                    setReverseInput('');
                  }
                }}
                disabled={isThinking || !reverseInput.trim()}
                style={[styles.reverseSendBtn, { backgroundColor: colors.danger }]}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </AnimatedPressable>
            </View>
          </GlassCard>
        ) : mode === 'doppelganger' ? (
          <View style={styles.reverseWrap}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
              <Text style={{ ...typography.caption, color: colors.electricViolet }}>DOPPELGÄNGER MATCH ACTIVE</Text>
            </View>
            
            {doppelgangerHistory.map((turn, i) => (
              <View key={i} style={[styles.reverseQARow, { borderColor: colors.electricViolet }]}>
                <Text style={{ ...typography.micro, color: colors.textTertiary, marginBottom: 4 }}>TURN {turn.turn}</Text>
                <Text style={styles.reverseQText}>YOU: {turn.player_q}</Text>
                <Text style={[styles.reverseAText, { color: turn.ai_a === 'yes' ? colors.success : colors.danger, marginBottom: spacing.xs }]}>
                  AI: {String(turn.ai_a).toUpperCase()}
                </Text>
                <Text style={styles.reverseQText}>AI: {turn.ai_q}</Text>
                <Text style={[styles.reverseAText, { color: turn.player_a === 'yes' ? colors.success : colors.danger }]}>
                  YOU: {String(turn.player_a).toUpperCase()}
                </Text>
              </View>
            ))}

            <QuestionCard question={currentQuestion} questionKey={questionNumber} />

            <View style={styles.answerGrid}>
              {ANSWER_LABELS.map((a) => (
                <AnswerButton
                  key={a.value}
                  value={a.value}
                  label={a.label}
                  onPress={(val) => setDoppelgangerAnswer(val)}
                  disabled={isThinking || !!contradiction}
                  style={doppelgangerAnswer === a.value ? { borderColor: colors.glowBlue, borderWidth: 2 } : {}}
                />
              ))}
            </View>

            <View style={styles.reverseInputRow}>
              <import_react_native.TextInput
                style={[styles.reverseInput, { color: colors.textPrimary, borderColor: colors.borderStrong }]}
                placeholder="Ask the AI a question..."
                placeholderTextColor={colors.textTertiary}
                value={reverseInput}
                onChangeText={setReverseInput}
                editable={!isThinking}
              />
              <AnimatedPressable
                onPress={() => {
                  if (reverseInput.trim() && doppelgangerAnswer) {
                    useGameStore.getState().submitDoppelgangerTurn(doppelgangerAnswer, reverseInput.trim(), false);
                    setReverseInput('');
                    setDoppelgangerAnswer(null);
                  }
                }}
                disabled={isThinking || !reverseInput.trim() || !doppelgangerAnswer}
                style={[styles.reverseSendBtn, { backgroundColor: doppelgangerAnswer ? colors.glowBlue : colors.borderStrong }]}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </AnimatedPressable>
            </View>

            <SecondaryButton
              label="GUESS AI'S SUBJECT"
              icon="search"
              onPress={() => {
                if (reverseInput.trim() && doppelgangerAnswer) {
                  useGameStore.getState().submitDoppelgangerTurn(doppelgangerAnswer, reverseInput.trim(), true);
                  setReverseInput('');
                  setDoppelgangerAnswer(null);
                }
              }}
              disabled={isThinking || !reverseInput.trim() || !doppelgangerAnswer}
              style={{ marginTop: spacing.md, borderColor: colors.electricViolet }}
            />
          </View>
        ) : (
          <>
            {mode === 'decay' && (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md, backgroundColor: 'rgba(255, 69, 58, 0.1)', paddingVertical: spacing.xs, borderRadius: 8 }}>
                <Ionicons name="skull-outline" size={16} color={colors.danger} style={{ marginRight: spacing.xs }} />
                <Text style={{ ...typography.caption, color: colors.danger, textAlign: 'center' }}>NEURAL DECAY PROTOCOL ACTIVE</Text>
              </View>
            )}
            
            {mode === 'hivemind' && hivemindLogs && hivemindLogs.length > 0 && (
              <View style={{ marginBottom: spacing.md }}>
                <Text style={{ ...typography.caption, color: colors.glowBlue, marginBottom: spacing.xs }}>SWARM DELIBERATION:</Text>
                {hivemindLogs.map((log: any, idx: number) => (
                  <View key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: spacing.sm, borderRadius: 8, marginBottom: 4, borderLeftWidth: 2, borderLeftColor: colors.glowBlue }}>
                    <Text style={{ ...typography.micro, color: colors.textSecondary, marginBottom: 2 }}>AGENT [{log.agent.toUpperCase()}]</Text>
                    <Text style={{ ...typography.bodySmall, color: colors.textPrimary }}>{log.message}</Text>
                  </View>
                ))}
              </View>
            )}
            <QuestionCard question={currentQuestion} questionKey={questionNumber} />

            {hint && (
              <GlassCard style={styles.hintCard} secondary>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                  <Ionicons name="bulb-outline" size={16} color={colors.warning} style={{ marginRight: 4 }} />
                  <Text style={typography.eyebrow}>AI Interrogation Logic</Text>
                </View>
                <Text style={{ ...typography.bodyMedium, color: colors.textSecondary }}>
                  {hint}
                </Text>
              </GlassCard>
            )}

            <View style={styles.answerGrid}>
              {ANSWER_LABELS.map((a) => (
                <AnswerButton
                  key={a.value}
                  value={a.value}
                  label={a.label}
                  onPress={handleAnswer}
                  disabled={isThinking || !!contradiction}
                />
              ))}
            </View>

            <View style={{ marginTop: spacing.md, flexDirection: 'row', gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <SecondaryButton
                  label="FORCE AI TO GUESS NOW"
                  icon="flash"
                  onPress={() => useGameStore.getState().forceGuess()}
                  disabled={isThinking || questionNumber < 3}
                />
              </View>
              {!hintUsed && (
                <View style={{ flex: 1 }}>
                  <SecondaryButton
                    label="INTERROGATE AI"
                    icon="bulb-outline"
                    onPress={requestHint}
                    disabled={isThinking}
                  />
                </View>
              )}
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

            {blackoutMode ? (
              <Text style={{ ...typography.bodyMedium, color: colors.danger, marginTop: spacing.md, textAlign: 'center', paddingVertical: spacing.xl }}>
                [SENSORY DEPRIVATION ERROR: DATA FEED SEVERED]
              </Text>
            ) : (
              <>
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

                <Text style={[styles.dataSubheading, { marginTop: spacing.sm }]}>Evidence Board</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {evidenceBoard.map((item) => (
                    <View key={item.id} style={{ width: '33%' }}>
                      <SuspectCard name={item.name} status={item.status} />
                    </View>
                  ))}
                  {evidenceBoard.length === 0 && (
                    <Text style={{ ...typography.caption, color: colors.textTertiary, paddingVertical: spacing.md }}>
                      Awaiting suspect data...
                    </Text>
                  )}
                </View>
              </>
            )}
          </GlassCard>
        )}
      </ScrollView>

      {retconActive && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 200, padding: spacing.lg, paddingTop: 60 }]}>
          <Text style={{ ...typography.h2, color: colors.electricViolet, marginBottom: spacing.md, textAlign: 'center' }}>TIMELINE MODIFICATION</Text>
          <Text style={{ ...typography.bodyMedium, color: colors.textSecondary, marginBottom: spacing.lg, textAlign: 'center' }}>
            Select a past event to erase it from reality.
          </Text>
          
          <ScrollView style={{ flex: 1 }}>
            {answers.length === 0 && (
              <Text style={{ color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xl }}>No history to erase.</Text>
            )}
            {answers.map((qa, i) => (
              <AnimatedPressable 
                key={i} 
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.electricViolet }}
                onPress={() => applyRetcon(i)}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1, marginRight: spacing.sm }}>
                    <Text style={{ ...typography.caption, color: colors.textSecondary }}>Q{i+1}: {blackoutMode ? scrambleText(qa.question) : qa.question}</Text>
                    <Text style={{ ...typography.bodyMedium, color: colors.textPrimary, marginTop: 4 }}>A: {blackoutMode ? scrambleText(String(qa.answer).toUpperCase()) : String(qa.answer).toUpperCase()}</Text>
                  </View>
                  <Ionicons name="trash" size={20} color={colors.danger} />
                </View>
              </AnimatedPressable>
            ))}
          </ScrollView>
          <SecondaryButton label="CANCEL" onPress={() => useGameStore.setState({ retconActive: false })} style={{ marginTop: spacing.md }} />
        </View>
      )}

      {(useGameStore.getState() as any).decoyGuessVisible && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 200, padding: spacing.lg, paddingTop: 60 }]}>
          <Text style={{ ...typography.h2, color: colors.electricViolet, marginBottom: spacing.md, textAlign: 'center' }}>SUBMIT PROTOCOL GUESS</Text>
          <Text style={{ ...typography.bodyMedium, color: colors.textSecondary, marginBottom: spacing.lg, textAlign: 'center' }}>
            To crack the Decoy Protocol, you must accurately guess BOTH the true subject and the decoy.
          </Text>
          <DecoyGuessForm onClose={() => useGameStore.setState({ decoyGuessVisible: false } as any)} />
        </View>
      )}

      <BlackMarketModal visible={blackMarketVisible} onClose={() => setBlackMarketVisible(false)} />
    </SafeAreaView>
  );
}

function DecoyGuessForm({ onClose }: { onClose: () => void }) {
  const { colors } = useTheme();
  const [target, setTarget] = useState('');
  const [decoy, setDecoy] = useState('');
  const { isAnalyzing, submitDecoyGuess } = useGameStore();

  const handleSubmit = async () => {
    if (!target.trim() || !decoy.trim()) return;
    await submitDecoyGuess(target.trim(), decoy.trim());
    onClose();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <GlassCard style={{ padding: spacing.lg }}>
        <Text style={{ ...typography.caption, color: colors.textSecondary, marginBottom: 4 }}>True Subject</Text>
        <TextInput
          style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 8, padding: spacing.md, color: colors.textPrimary, marginBottom: spacing.md }}
          placeholder="What is the real answer?"
          placeholderTextColor={colors.textTertiary}
          value={target}
          onChangeText={setTarget}
          editable={!isAnalyzing}
        />
        <Text style={{ ...typography.caption, color: colors.textSecondary, marginBottom: 4 }}>Decoy Subject</Text>
        <TextInput
          style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 8, padding: spacing.md, color: colors.textPrimary, marginBottom: spacing.lg }}
          placeholder="What was the AI steering you towards?"
          placeholderTextColor={colors.textTertiary}
          value={decoy}
          onChangeText={setDecoy}
          editable={!isAnalyzing}
        />
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <SecondaryButton label="CANCEL" onPress={onClose} disabled={isAnalyzing} />
          </View>
          <View style={{ flex: 1 }}>
            <SecondaryButton label="SUBMIT" icon="send" onPress={handleSubmit} disabled={isAnalyzing || !target.trim() || !decoy.trim()} />
          </View>
        </View>
      </GlassCard>
    </View>
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
  hintCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
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
