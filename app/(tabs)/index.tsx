import { useTheme } from '@/src/theme/ThemeContext';
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  AIInvestigationCore,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
  CaseCard,
  StatCard,
  AnimatedPressable,
} from '@/src/components';
import { radius, spacing, typography } from '@/src/theme';
import { useCasesStore } from '@/src/store/casesStore';
import { useGameStore } from '@/src/store/gameStore';

const CLASSIFIED_OPERATIONS = [
  {
    id: 'doppelganger',
    title: 'The Doppelgänger',
    subtitle: 'Simultaneous 1v1 deduction race. Deduce each other.',
    badge: '1v1 RACE',
    badgeColor: '#A855F7',
    icon: 'git-compare-outline' as const,
    onPress: () => {
      useGameStore.getState().startDoppelgangerMode();
      router.push('/investigation');
    },
  },
  {
    id: 'hivemind',
    title: 'The Hive Mind',
    subtitle: '3 distinct AI sub-agents deliberate and debate.',
    badge: 'SWARM',
    badgeColor: '#38BDF8',
    icon: 'chatbubbles-outline' as const,
    onPress: () => {
      useGameStore.getState().startHivemindMode();
      router.push('/investigation');
    },
  },
  {
    id: 'decay',
    title: 'Neural Decay',
    subtitle: 'Memory corruption wipes 2 past answers every 4 turns.',
    badge: 'HARDCORE',
    badgeColor: '#EF4444',
    icon: 'skull-outline' as const,
    onPress: () => {
      useGameStore.getState().startDecayMode();
      router.push('/investigation');
    },
  },
  {
    id: 'deception',
    title: "The Liar's Paradox",
    subtitle: 'AI will lie strategically. Use Polygraph to expose it.',
    badge: 'POLYGRAPH',
    badgeColor: '#F59E0B',
    icon: 'alert-circle-outline' as const,
    onPress: () => {
      useGameStore.getState().startDeceptionMode();
      router.push('/investigation');
    },
  },
  {
    id: 'decoy',
    title: 'The Decoy Protocol',
    subtitle: 'Dual targets. Eliminate decoy before naming target.',
    badge: 'DUAL TARGET',
    badgeColor: '#10B981',
    icon: 'git-network-outline' as const,
    onPress: () => {
      useGameStore.getState().startDecoyMode();
      router.push('/investigation');
    },
  },
  {
    id: 'syndicate',
    title: 'The Syndicate',
    subtitle: 'Cross-examine 3 distinct agents with opposing agendas.',
    badge: 'CONSORTIUM',
    badgeColor: '#8B5CF6',
    icon: 'people-outline' as const,
    onPress: () => {
      useGameStore.getState().startSyndicateMode();
      router.push('/investigation');
    },
  },
  {
    id: 'deaddrops',
    title: 'Dead Drop Network',
    subtitle: 'Browse and solve asynchronous player bounties.',
    badge: 'BOUNTIES',
    badgeColor: '#34D399',
    icon: 'globe-outline' as const,
    onPress: () => {
      router.push('/deaddrops');
    },
  },
  {
    id: 'gauntlet',
    title: 'The Gauntlet',
    subtitle: '3-stage escalating interrogation trial with scoring.',
    badge: 'ENDURANCE',
    badgeColor: '#FBBF24',
    icon: 'trophy-outline' as const,
    onPress: () => {
      useGameStore.getState().startGauntlet();
      router.push('/investigation');
    },
  },
];

export default function HomeScreen() {
  const { colors, gradients } = useTheme();
  const styles = useStyles(colors, gradients);

  const cases = useCasesStore((s) => s.cases).slice(0, 3);
  const record = useCasesStore((s) => s.record);
  const resetGame = useGameStore((s) => s.resetGame);
  const hasSeenTutorial = useCasesStore((s) => s.hasSeenTutorial);
  const hasHydrated = useCasesStore((s) => s.hasHydrated);

  if (hasHydrated && !hasSeenTutorial) {
    return <Redirect href="/onboarding" />;
  }

  const handleNewCase = () => {
    resetGame();
    router.push('/new-case');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.brand}>KASOTI</Text>
          <Text style={typography.eyebrow}>AI Mind Investigation</Text>
        </View>

        <LinearGradient colors={gradients.hero} style={styles.hero}>
          <AIInvestigationCore state="idle" size={168} />
          <Text style={styles.heroLine}>Think of anything.</Text>
          <Text style={styles.heroLineAccent}>I&apos;ll investigate it.</Text>

          <View style={styles.ctaGroup}>
            <PrimaryButton label="INITIALIZE CASE" icon="add-circle" onPress={handleNewCase} />
            <View style={styles.heroSecondaryRow}>
              <SecondaryButton
                label="DAILY CIPHER"
                icon="calendar-outline"
                onPress={() => {
                  useGameStore.getState().startDailyCipher();
                  router.push('/investigation');
                }}
                style={styles.heroSecondaryBtn}
              />
              <SecondaryButton
                label="HOW TO PLAY"
                icon="help-circle-outline"
                onPress={() => router.push('/how-to-play')}
                style={styles.heroSecondaryBtn}
              />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.operationsSection}>
          <SectionHeader
            title="Classified Operations"
            actionLabel="All Modes"
            onActionPress={handleNewCase}
          />
          <Text style={styles.operationsSubtitle}>
            Specialized AI protocols and adversarial modifiers.
          </Text>

          <View style={styles.operationsGrid}>
            {CLASSIFIED_OPERATIONS.map((op) => (
              <AnimatedPressable
                key={op.id}
                onPress={op.onPress}
                style={styles.opCard}
                accessibilityRole="button"
                accessibilityLabel={op.title}
              >
                <View style={styles.opHeaderRow}>
                  <View style={[styles.opIconWrap, { backgroundColor: `${op.badgeColor}18` }]}>
                    <Ionicons name={op.icon} size={18} color={op.badgeColor} />
                  </View>
                  <View style={[styles.opBadge, { borderColor: `${op.badgeColor}40`, backgroundColor: `${op.badgeColor}14` }]}>
                    <Text style={[styles.opBadgeText, { color: op.badgeColor }]}>{op.badge}</Text>
                  </View>
                </View>
                <Text style={styles.opTitle} numberOfLines={1}>
                  {op.title}
                </Text>
                <Text style={styles.opSubtitle} numberOfLines={2}>
                  {op.subtitle}
                </Text>
              </AnimatedPressable>
            ))}
          </View>
        </View>

        <View style={styles.recordCard}>
          <Text style={typography.eyebrow}>Your Record</Text>
          <View style={styles.recordRow}>
            <StatCard label="Cases" value={record.totalCases} icon="folder-outline" accentColor={colors.glowBlue} />
            <StatCard label="AI Wins" value={record.aiWins} icon="trophy-outline" accentColor={colors.electricViolet} />
            <StatCard label="Your Wins" value={record.playerWins} icon="ribbon-outline" accentColor={colors.success} />
          </View>
          <View style={[styles.recordRow, { marginTop: spacing.sm }]}>
            <StatCard label="Daily Streak" value={`${record.currentStreak || 0} 🔥`} icon="flame-outline" accentColor={colors.warning} style={{ flex: 1 }} />
            <StatCard label="Best Score" value={record.bestScore} icon="star-outline" accentColor={colors.success} style={{ flex: 1 }} />
          </View>
        </View>

        <View style={styles.recentSection}>
          <SectionHeader
            title="Recent Cases"
            actionLabel="View All"
            onActionPress={() => router.push('/(tabs)/cases')}
          />
          {cases.map((c) => (
            <CaseCard key={c.id} record={c} />
          ))}
        </View>
      </ScrollView>
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
    paddingBottom: spacing.huge * 2,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  brand: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 4,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  hero: {
    borderRadius: 28,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  heroLine: {
    ...typography.h1,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  heroLineAccent: {
    ...typography.h1,
    color: colors.glowBlue,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  ctaGroup: {
    width: '100%',
  },
  heroSecondaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  heroSecondaryBtn: {
    flex: 1,
  },
  operationsSection: {
    marginBottom: spacing.xl,
  },
  operationsSubtitle: {
    ...typography.caption,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  operationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  opCard: {
    width: '48.5%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    justifyContent: 'space-between',
    minHeight: 116,
  },
  opHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  opIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  opBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  opTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  opSubtitle: {
    ...typography.caption,
    fontSize: 11,
    lineHeight: 15,
  },
  recordCard: {
    marginBottom: spacing.xl,
  },
  recordRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  recentSection: {
    marginBottom: spacing.lg,
  },
});
