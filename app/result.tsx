import { useTheme } from '@/src/theme/ThemeContext';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Share, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { AIInvestigationCore, GlassCard, PrimaryButton, SecondaryButton, StatCard, Confetti, BrainScanModal } from '@/src/components';
import { colors, radius, spacing, typography } from '@/src/theme';
import { useGameStore } from '@/src/store/gameStore';
import { useCasesStore } from '@/src/store/casesStore';
import { useLoreStore } from '@/src/store/loreStore';
import type { CaseRecord } from '@/src/types/game';

import { gameApi } from '@/src/services/gameApi';

export default function ResultScreen() {
  const { colors, gradients } = useTheme();
  const styles = useStyles(colors, gradients);

  const { gameId, status, guess, questionNumber, maxQuestions, caseNumber, category, resetGame, mode, gauntlet, incrementGauntletScore, startGauntletStage, endGauntlet } =
    useGameStore();
  const addCase = useCasesStore((s) => s.addCase);

  const isAiWin = mode === 'reverse' ? status === 'lost' : status === 'won';
  const playerWon = mode === 'reverse' ? status === 'won' : status === 'lost';

  const [subjectInput, setSubjectInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [scanVisible, setScanVisible] = useState(false);
  const [newLore, setNewLore] = useState<any>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  useEffect(() => {
    if (playerWon) {
      // 40% chance to drop lore on win
      if (Math.random() < 0.4) {
        const lore = useLoreStore.getState().unlockRandomLore();
        if (lore) {
          setNewLore(lore);
          import('expo-haptics').then((H) => H.notificationAsync(H.NotificationFeedbackType.Success));
        }
      }
    }
  }, [playerWon]);

  useEffect(() => {
    if (!isAiWin) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      import('@/src/services/audioManager').then((m) => m.audioManager.playSuccess());
    } else {
      import('@/src/services/audioManager').then((m) => m.audioManager.playSuccess());
    }
  }, [isAiWin]);

  const score = useMemo(() => {
    const base = 1000;
    const penalty = questionNumber * 18;
    return Math.max(200, base - penalty + (guess?.confidence ?? 0) * 3);
  }, [questionNumber, guess]);

  const handleNewCase = () => {
    let earnedCredits = 0;
    if (playerWon) {
      const remaining = maxQuestions - questionNumber;
      earnedCredits = 50 + (remaining * 10);
      import('@/src/store/economyStore').then(m => m.useEconomyStore.getState().addCredits(earnedCredits));
    }

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
      questions: useGameStore.getState().questions,
    };
    addCase(record);
    resetGame();
    router.replace('/(tabs)');
  };

  const handleFetchTranscript = async () => {
    if (!gameId) return;
    setLoadingTranscript(true);
    try {
      const text = await gameApi.getTranscript(gameId);
      setTranscript(text);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoadingTranscript(false);
    }
  };

  const handleSubmitPlayerCase = async () => {
    if (!subjectInput.trim()) return;
    try {
      await gameApi.learnSubject(subjectInput.trim(), category ?? 'anything');
      setSubmitted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) {
      console.warn('Failed to submit subject', e);
    }
  };

  const viewShotRef = useRef<ViewShot>(null);

  const handleShare = async () => {
    try {
      if (viewShotRef.current && viewShotRef.current.capture && !useGameStore.getState().isDaily) {
        const uri = await viewShotRef.current.capture();
        const isAvailable = await Sharing.isAvailableAsync();
        
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/jpeg',
            dialogTitle: 'Share your Kasoti result!',
            UTI: 'public.jpeg',
          });
          return;
        }
      }

      let message = '';
      if (useGameStore.getState().isDaily) {
        const dateStr = new Date().toISOString().slice(0, 10);
        const grid = useGameStore.getState().answers.map(qa => {
          if (qa.answer === 'yes') return '🟩';
          if (qa.answer === 'no') return '🟥';
          if (qa.answer === 'maybe') return '🟨';
          return '⬛';
        }).join('');
        const winStr = playerWon ? questionNumber : 'X';
        message = `Kasoti Daily Cipher (${dateStr})\n${winStr}/${maxQuestions}\n\n${grid}\n\nCan you crack the cipher?`;
      } else if (mode === 'reverse') {
        message = isAiWin
          ? `I just played Reverse Kasoti! The AI stumped me with '${guess?.name}' after ${maxQuestions} questions! Can you beat it?`
          : `I just beat Reverse Kasoti! I guessed the AI's secret subject ('${guess?.name}') in only ${questionNumber} questions!`;
      } else {
        message = isAiWin
          ? `I just played Kasoti! The AI guessed my subject ('${guess?.name}') with ${guess?.confidence}% confidence in only ${questionNumber} questions! Can you beat it?`
          : `I just outsmarted the Kasoti AI! It couldn't guess my subject even after ${maxQuestions} questions! Can you beat my record?`;
      }
      
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
        <ViewShot 
          ref={viewShotRef} 
          options={{ format: 'jpg', quality: 0.9 }} 
          style={[styles.shareCard, { backgroundColor: colors.background }]}
        >
          <View style={styles.coreWrap}>
            <AIInvestigationCore state={isAiWin ? 'success' : 'failure'} size={150} />
          </View>

          {isAiWin ? (
            <>
              <Text style={styles.headline}>
                {gauntlet.active ? 'GAUNTLET FAILED' : (mode === 'reverse' ? 'CASE UNSOLVED' : 'CASE CLOSED')}
              </Text>
              <Text style={styles.subheadline}>
                {gauntlet.active ? 'You were defeated' : (mode === 'reverse' ? 'You Ran Out of Questions' : 'Subject Identified')}
              </Text>

              <View style={styles.statsRow}>
                <StatCard
                  label="Questions Used"
                  value={`${questionNumber} / ${maxQuestions}`}
                  icon="help-circle-outline"
                  accentColor={colors.glowBlue}
                />
                {mode !== 'reverse' && (
                  <StatCard
                    label="AI Confidence"
                    value={`${guess?.confidence ?? 0}%`}
                    icon="analytics-outline"
                    accentColor={colors.electricViolet}
                  />
                )}
              </View>
              {mode !== 'reverse' ? (
                <StatCard
                  label="Investigation Score"
                  value={score}
                  icon="trophy-outline"
                  accentColor={colors.success}
                  style={styles.scoreCard}
                />
              ) : (
                <StatCard
                  label="Secret Subject"
                  value={guess?.name || 'Unknown'}
                  icon="person-outline"
                  accentColor={colors.danger}
                  style={styles.scoreCard}
                />
              )}
            </>
          ) : (
            <>
              <Text style={styles.headline}>
                {gauntlet.active ? (gauntlet.stage === 3 ? 'GAUNTLET COMPLETE' : `STAGE ${gauntlet.stage} CLEARED`) : (mode === 'reverse' ? 'CASE CLOSED' : 'CASE UNSOLVED')}
              </Text>
              <Text style={styles.subheadline}>
                {gauntlet.active ? 'You survived the interrogation!' : (mode === 'reverse' ? 'You Guessed the Secret Subject!' : 'You Outsmarted the AI')}
              </Text>

              <View style={styles.statsRow}>
                <StatCard
                  label="Questions Used"
                  value={`${mode === 'reverse' ? questionNumber : maxQuestions} / ${maxQuestions}`}
                  icon="help-circle-outline"
                  accentColor={colors.warning}
                />
              </View>

              {mode !== 'reverse' && !gauntlet.active ? (
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
              ) : (mode === 'reverse' && (
                <StatCard
                  label="Secret Subject"
                  value={guess?.name || 'Unknown'}
                  icon="person-outline"
                  accentColor={colors.success}
                  style={styles.scoreCard}
                />
              ))}
            </>
          )}
        </ViewShot>

        <View style={{ marginTop: spacing.lg, width: '100%', gap: spacing.sm }}>
          <SecondaryButton
            label="VIEW AI BRAIN SCAN"
            icon="hardware-chip-outline"
            onPress={() => setScanVisible(true)}
          />
          <SecondaryButton
            label={loadingTranscript ? "DECRYPTING WIRETAP..." : "DECRYPT WIRETAP TRANSCRIPT"}
            icon="document-text-outline"
            onPress={handleFetchTranscript}
            disabled={loadingTranscript}
          />
        </View>

        {transcript && (
          <GlassCard style={{ backgroundColor: '#f0ebd8', borderColor: '#d3c9a3', marginTop: spacing.lg, width: '100%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: '#d3c9a3', paddingBottom: spacing.xs }}>
              <Ionicons name="finger-print" size={24} color="#1a1a1a" />
              <Text style={{ ...typography.h3, color: '#1a1a1a', marginLeft: spacing.sm, letterSpacing: 2 }}>CLASSIFIED: WIRETAP RECORD</Text>
            </View>
            <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: '#1a1a1a', fontSize: 13, lineHeight: 20 }}>
              {transcript.split('[REDACTED]').map((part, index, array) => (
                <React.Fragment key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <Text style={{ backgroundColor: '#1a1a1a', color: '#1a1a1a' }}>[REDACTED]</Text>
                  )}
                </React.Fragment>
              ))}
            </Text>
          </GlassCard>
        )}

        {newLore && (
          <GlassCard style={{ backgroundColor: 'rgba(0, 255, 100, 0.1)', borderColor: colors.success, marginTop: spacing.md, width: '100%', alignItems: 'center' }}>
            <Ionicons name="lock-open-outline" size={24} color={colors.success} style={{ marginBottom: spacing.xs }} />
            <Text style={{ ...typography.h3, color: colors.success }}>LORE FRAGMENT RECOVERED</Text>
            <Text style={{ ...typography.bodyMedium, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md }}>
              &quot;{newLore.title}&quot; has been added to your Archives.
            </Text>
            <SecondaryButton 
              label="VIEW ARCHIVES" 
              icon="library-outline" 
              onPress={() => {
                useLoreStore.getState().clearNewLoreFlag();
                router.replace('/(tabs)/archives');
              }} 
            />
          </GlassCard>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {gauntlet.active ? (
          playerWon && gauntlet.stage < 3 ? (
            <PrimaryButton 
              label="NEXT STAGE" 
              icon="arrow-forward-circle" 
              onPress={() => {
                incrementGauntletScore(score);
                startGauntletStage();
                router.replace('/investigation');
              }} 
            />
          ) : (
              <PrimaryButton 
              label={playerWon ? "CLAIM TITLE" : "BACK TO HOME"} 
              icon={playerWon ? "trophy" : "home"} 
              onPress={() => {
                if (playerWon) {
                  incrementGauntletScore(score);
                  import('@/src/store/economyStore').then(m => m.useEconomyStore.getState().addCredits(200)); // big bonus
                }
                const record: CaseRecord = {
                  id: `gauntlet-${Date.now()}`,
                  caseNumber,
                  subject: 'Gauntlet Run',
                  category: 'anything',
                  questionsUsed: questionNumber,
                  maxQuestions,
                  result: playerWon ? 'player_victory' : 'ai_victory',
                  confidence: 0,
                  score: gauntlet.cumulativeScore + (playerWon ? score : 0),
                  date: new Date().toISOString().slice(0, 10),
                  questions: useGameStore.getState().questions,
                };
                addCase(record);
                endGauntlet();
                resetGame();
                router.replace('/(tabs)');
              }} 
            />
          )
        ) : (
          <PrimaryButton label="NEW CASE" icon="add-circle" onPress={handleNewCase} />
        )}
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

const useStyles = (colors: any, gradients: any) => StyleSheet.create({
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
  shareCard: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.md,
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
