import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/src/theme';
import { useGameStore } from '@/src/store/gameStore';
import { ConfidenceBar } from './ConfidenceBar';
import { CandidateCard } from './CandidateCard';

interface BrainScanModalProps {
  visible: boolean;
  onClose: () => void;
}

export function BrainScanModal({ visible, onClose }: BrainScanModalProps) {
  const { snapshot, questions, answers } = useGameStore();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>AI Brain Scan</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Final Confidence</Text>
            <ConfidenceBar 
              label="AI Confidence" 
              percentage={snapshot.aiConfidence} 
              color={colors.electricViolet} 
            />

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{snapshot.candidatesRemaining}</Text>
                <Text style={styles.statLabel}>Candidates Remaining</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.primaryBlue }]}>
                  {snapshot.categoryBreakdown.length > 0 ? snapshot.categoryBreakdown[0].label : 'Unknown'}
                </Text>
                <Text style={styles.statLabel}>Top Category</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Top Possibilities</Text>
            {snapshot.topPossibilities.map((name, i) => (
              <CandidateCard key={name} rank={i + 1} name={name} />
            ))}

            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Category Breakdown</Text>
            {snapshot.categoryBreakdown.map((item) => (
              <ConfidenceBar key={item.label} label={item.label} percentage={item.percentage} />
            ))}

            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Investigation Log</Text>
            <View style={styles.logContainer}>
              {answers.map((qa, i) => (
                <View key={i} style={styles.logItem}>
                  <Text style={styles.logQuestion}>Q{i + 1}: {qa.question}</Text>
                  <Text style={styles.logAnswer}>Answer: {qa.answer || 'No Answer'}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 80,
    backgroundColor: colors.backgroundElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
    fontSize: 20,
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  sectionTitle: {
    ...typography.eyebrow,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    ...typography.statNumber,
    fontSize: 20,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.micro,
    marginTop: 4,
    color: colors.textSecondary,
  },
  logContainer: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logItem: {
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  logQuestion: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  logAnswer: {
    ...typography.caption,
    color: colors.glowBlue,
    marginTop: 4,
    textTransform: 'uppercase',
  },
});
