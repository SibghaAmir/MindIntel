import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, SectionHeader, AnimatedPressable } from '@/src/components';
import { colors, spacing, typography } from '@/src/theme';
import { useSettingsStore, Difficulty } from '@/src/store/settingsStore';

const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: 'easy', label: 'Easy' },
  { id: 'normal', label: 'Normal' },
  { id: 'expert', label: 'Expert' },
];

function SettingRow({
  icon,
  label,
  right,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  const Wrapper = onPress ? AnimatedPressable : View;
  return (
    <Wrapper
      style={styles.row}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
    >
      <View style={styles.rowLeft}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={17} color={colors.textSecondary} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      {right ?? <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />}
    </Wrapper>
  );
}

export default function SettingsScreen() {
  const {
    soundEnabled,
    hapticsEnabled,
    difficulty,
    toggleSound,
    toggleHaptics,
    setDifficulty,
  } = useSettingsStore();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={typography.h1}>Settings</Text>

        <SectionHeader title="Game" style={styles.sectionHeader} />
        <GlassCard style={styles.groupCard} padded={false}>
          <SettingRow
            icon="volume-high-outline"
            label="Sound"
            right={
              <Switch
                value={soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: colors.cardSecondary, true: colors.primaryBlue }}
                thumbColor={colors.textPrimary}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="phone-portrait-outline"
            label="Haptic Feedback"
            right={
              <Switch
                value={hapticsEnabled}
                onValueChange={toggleHaptics}
                trackColor={{ false: colors.cardSecondary, true: colors.primaryBlue }}
                thumbColor={colors.textPrimary}
              />
            }
          />
          <View style={styles.divider} />
          <View style={styles.difficultyRow}>
            <View style={styles.rowLeft}>
              <View style={styles.iconWrap}>
                <Ionicons name="speedometer-outline" size={17} color={colors.textSecondary} />
              </View>
              <Text style={styles.rowLabel}>Difficulty</Text>
            </View>
            <View style={styles.segmented}>
              {DIFFICULTIES.map((d) => (
                <AnimatedPressable
                  key={d.id}
                  onPress={() => setDifficulty(d.id)}
                  style={[styles.segment, difficulty === d.id && styles.segmentActive]}
                >
                  <Text style={[styles.segmentLabel, difficulty === d.id && styles.segmentLabelActive]}>
                    {d.label}
                  </Text>
                </AnimatedPressable>
              ))}
            </View>
          </View>
        </GlassCard>

        <SectionHeader title="Appearance" style={styles.sectionHeader} />
        <GlassCard style={styles.groupCard} padded={false}>
          <SettingRow
            icon="moon-outline"
            label="Dark Theme"
            right={<Switch value disabled trackColor={{ false: colors.cardSecondary, true: colors.primaryBlue }} thumbColor={colors.textPrimary} />}
          />
        </GlassCard>

        <SectionHeader title="About" style={styles.sectionHeader} />
        <GlassCard style={styles.groupCard} padded={false}>
          <SettingRow icon="book-outline" label="How to Play" onPress={() => router.push('/how-to-play')} />
          <View style={styles.divider} />
          <SettingRow icon="information-circle-outline" label="About Kasoti" />
          <View style={styles.divider} />
          <SettingRow icon="pricetag-outline" label="Version" right={<Text style={styles.versionText}>1.0.0</Text>} />
        </GlassCard>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.huge * 2,
  },
  sectionHeader: {
    marginTop: spacing.lg,
  },
  groupCard: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(155,168,192,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  rowLabel: {
    ...typography.bodyMedium,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 32 + spacing.sm,
  },
  difficultyRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  segmented: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    backgroundColor: 'rgba(155,168,192,0.08)',
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: colors.primaryBlue,
  },
  segmentLabel: {
    ...typography.caption,
    fontWeight: '700',
  },
  segmentLabelActive: {
    color: colors.textPrimary,
  },
  versionText: {
    ...typography.caption,
  },
});
