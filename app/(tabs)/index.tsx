import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AIInvestigationCore,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
  CaseCard,
  StatCard,
} from '@/src/components';
import { colors, gradients, spacing, typography } from '@/src/theme';
import { useCasesStore } from '@/src/store/casesStore';
import { useGameStore } from '@/src/store/gameStore';

export default function HomeScreen() {
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
            <PrimaryButton label="CREATE NEW CASE" icon="add-circle" onPress={handleNewCase} />
            <SecondaryButton
              label="HOW TO PLAY"
              icon="help-circle-outline"
              onPress={() => router.push('/how-to-play')}
              style={styles.secondaryGap}
            />
          </View>
        </LinearGradient>

        <View style={styles.recordCard}>
          <Text style={typography.eyebrow}>Your Record</Text>
          <View style={styles.recordRow}>
            <StatCard label="Cases" value={record.totalCases} icon="folder-outline" accentColor={colors.glowBlue} />
            <StatCard label="AI Wins" value={record.aiWins} icon="trophy-outline" accentColor={colors.electricViolet} />
            <StatCard label="Your Wins" value={record.playerWins} icon="ribbon-outline" accentColor={colors.success} />
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

const styles = StyleSheet.create({
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
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  heroLine: {
    ...typography.h1,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  heroLineAccent: {
    ...typography.h1,
    color: colors.glowBlue,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  ctaGroup: {
    width: '100%',
  },
  secondaryGap: {
    marginTop: spacing.sm,
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
