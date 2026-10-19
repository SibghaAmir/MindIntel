import { useTheme } from '@/src/theme/ThemeContext';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable, GlassCard, PrimaryButton, SectionHeader } from '@/src/components';
import { colors, radius, spacing, typography } from '@/src/theme';

const STEPS: { step: string; title: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { step: '01', title: 'THINK', description: 'Think of anything — a person, place, object, or fictional character.', icon: 'bulb-outline' },
  { step: '02', title: 'ANSWER', description: "Answer the AI's questions honestly with Yes, No, Maybe, or Don't Know.", icon: 'chatbox-ellipses-outline' },
  { step: '03', title: 'INVESTIGATE', description: 'Watch the AI narrow down the possibilities and suspects in real time.', icon: 'search-outline' },
  { step: '04', title: 'DISCOVER', description: 'The AI makes its final forensic guess based on accumulated evidence.', icon: 'bulb' },
  { step: '05', title: 'WIN', description: 'If the AI fails to deduce your subject within the question limit, you win.', icon: 'trophy-outline' },
];

const OPERATIONS_GUIDE: {
  title: string;
  badge: string;
  badgeColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}[] = [
  {
    title: 'The Doppelgänger',
    badge: '1v1 RACE',
    badgeColor: '#A855F7',
    icon: 'git-compare-outline',
    description: 'You and the AI simultaneously hold secret subjects. Each turn, you interrogate each other. Whoever guesses the other entity first wins.',
  },
  {
    title: 'The Hive Mind',
    badge: 'SWARM',
    badgeColor: '#38BDF8',
    icon: 'chatbubbles-outline',
    description: 'Three distinct AI sub-agents deliberate and debate in real time, analyzing edge cases before formulating their consensus question.',
  },
  {
    title: 'Neural Decay',
    badge: 'HARDCORE',
    badgeColor: '#EF4444',
    icon: 'skull-outline',
    description: 'Simulated memory corruption. Every 4 turns, random past answers are permanently wiped from the AI memory bank.',
  },
  {
    title: "The Liar's Paradox",
    badge: 'POLYGRAPH',
    badgeColor: '#F59E0B',
    icon: 'alert-circle-outline',
    description: 'In reverse mode, the AI will fabricate one answer strategically. Use your Polygraph fact-check to catch the contradiction.',
  },
  {
    title: 'The Decoy Protocol',
    badge: 'DUAL TARGET',
    badgeColor: '#10B981',
    icon: 'git-network-outline',
    description: 'The AI holds two classified entities. You must isolate and eliminate the decoy before submitting your final guess for the true target.',
  },
  {
    title: 'The Syndicate',
    badge: 'CONSORTIUM',
    badgeColor: '#8B5CF6',
    icon: 'people-outline',
    description: 'A coalition of 3 agents. Direct your interrogation questions to specific agents to cross-reference conflicting testimonies.',
  },
  {
    title: 'The Gauntlet',
    badge: 'ENDURANCE',
    badgeColor: '#FBBF24',
    icon: 'trophy-outline',
    description: 'A three-stage survival trial across standard, rapid, and reverse modes with cumulative scoring.',
  },
  {
    title: 'Dead Drop Network',
    badge: 'BOUNTIES',
    badgeColor: '#34D399',
    icon: 'globe-outline',
    description: 'Deploy custom encrypted bounties for other players or crack active community dead drops for Intel Credits.',
  },
];

export default function HowToPlayScreen() {
  const { colors, gradients } = useTheme();
  const styles = useStyles(colors, gradients);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <AnimatedPressable onPress={() => router.back()} style={styles.closeButton} haptic={false}>
          <Ionicons name="close" size={22} color={colors.textPrimary} />
        </AnimatedPressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={typography.h1}>How to Play</Text>
        <Text style={styles.subtitle}>Rules of engagement for standard & classified operations.</Text>

        <SectionHeader title="Core Investigation Loop" style={styles.sectionHeader} />
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

        <SectionHeader title="Classified Operations Manual" style={styles.sectionHeader} />
        {OPERATIONS_GUIDE.map((op) => (
          <GlassCard key={op.title} style={styles.opGuideCard}>
            <View style={styles.opGuideHeader}>
              <View style={[styles.opGuideIconWrap, { backgroundColor: `${op.badgeColor}18` }]}>
                <Ionicons name={op.icon} size={20} color={op.badgeColor} />
              </View>
              <View style={styles.opGuideTitleWrap}>
                <Text style={styles.opGuideTitle}>{op.title}</Text>
                <View style={[styles.opGuideBadge, { borderColor: `${op.badgeColor}40`, backgroundColor: `${op.badgeColor}14` }]}>
                  <Text style={[styles.opGuideBadgeText, { color: op.badgeColor }]}>{op.badge}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.opGuideDescription}>{op.description}</Text>
          </GlassCard>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="DISMISS BRIEFING" icon="checkmark" onPress={() => router.back()} />
      </View>
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
  sectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
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
    lineHeight: 18,
  },
  opGuideCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  opGuideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  opGuideIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  opGuideTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  opGuideTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    fontSize: 15,
  },
  opGuideBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  opGuideBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  opGuideDescription: {
    ...typography.caption,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
});
