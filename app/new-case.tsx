import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable, CategoryCard, PrimaryButton, SectionHeader } from '@/src/components';
import { colors, radius, spacing, typography } from '@/src/theme';
import { CATEGORY_OPTIONS, MODE_OPTIONS } from '@/src/data/mockOptions';
import { useGameStore } from '@/src/store/gameStore';
import type { CaseCategoryId, InvestigationMode } from '@/src/types/game';

export default function NewCaseScreen() {
  const setCategory = useGameStore((s) => s.setCategory);
  const setMode = useGameStore((s) => s.setMode);
  const startInvestigation = useGameStore((s) => s.startInvestigation);

  const [selectedCategory, setSelectedCategory] = useState<CaseCategoryId | null>(null);
  const [selectedMode, setSelectedMode] = useState<InvestigationMode>('standard');

  const handleSelectCategory = (id: CaseCategoryId) => {
    setSelectedCategory(id);
    setCategory(id);
  };

  const handleSelectMode = (id: InvestigationMode) => {
    setSelectedMode(id);
    setMode(id);
  };

  const handleStart = () => {
    if (!selectedCategory) {
      handleSelectCategory('anything');
    }
    setMode(selectedMode);
    startInvestigation();
    router.push('/investigation');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <AnimatedPressable onPress={() => router.back()} style={styles.backButton} haptic={false}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </AnimatedPressable>
        <Text style={typography.h2}>Create New Case</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Case Type" />
        <Text style={styles.prompt}>What are you thinking of?</Text>

        <View style={styles.categoryGrid}>
          {CATEGORY_OPTIONS.map((option) => (
            <CategoryCard
              key={option.id}
              option={option}
              selected={selectedCategory === option.id}
              onPress={() => handleSelectCategory(option.id)}
            />
          ))}
        </View>

        <SectionHeader title="Investigation Mode" style={styles.modeHeader} />
        {MODE_OPTIONS.map((mode) => {
          const selected = selectedMode === mode.id;
          return (
            <AnimatedPressable
              key={mode.id}
              onPress={() => handleSelectMode(mode.id)}
              style={[styles.modeCard, selected && styles.modeCardSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <View
                style={[
                  styles.radioOuter,
                  selected && { borderColor: colors.glowBlue },
                ]}
              >
                {selected && <View style={styles.radioInner} />}
              </View>
              <View style={styles.modeTextWrap}>
                <Text style={styles.modeTitle}>{mode.title}</Text>
                <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
              </View>
            </AnimatedPressable>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="START INVESTIGATION" icon="search" onPress={handleStart} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge * 2,
  },
  prompt: {
    ...typography.h1,
    marginBottom: spacing.lg,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  modeHeader: {
    marginTop: spacing.xl,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  modeCardSelected: {
    borderColor: colors.glowBlue,
    backgroundColor: colors.cardSecondary,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.glowBlue,
  },
  modeTextWrap: {
    flex: 1,
  },
  modeTitle: {
    ...typography.bodyMedium,
    fontSize: 16,
  },
  modeSubtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
