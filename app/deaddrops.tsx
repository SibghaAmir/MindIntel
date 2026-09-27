import { useTheme } from '@/src/theme/ThemeContext';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, PrimaryButton, SecondaryButton, AnimatedPressable, SectionHeader } from '@/src/components';
import { colors, radius, spacing, typography } from '@/src/theme';
import { useGameStore } from '@/src/store/gameStore';
import { gameApi } from '@/src/services/gameApi';
import { useEconomyStore } from '@/src/store/economyStore';

export default function DeadDropsScreen() {
  const { colors, gradients } = useTheme();
  const styles = useStyles(colors, gradients);
  
  const [drops, setDrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [subject, setSubject] = useState('');
  const [bounty, setBounty] = useState('100');
  const intelCredits = useEconomyStore(s => s.intelCredits);

  const fetchDrops = async () => {
    try {
      setLoading(true);
      const data = await gameApi.getDeadDrops();
      setDrops(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrops();
  }, []);

  const handleCreate = async () => {
    const bountyAmount = parseInt(bounty, 10);
    if (!subject.trim() || isNaN(bountyAmount) || bountyAmount <= 0) return;
    
    if (bountyAmount > intelCredits) {
      Alert.alert("Insufficient Funds", "You don't have enough Intel Credits to post this bounty.");
      return;
    }

    try {
      useEconomyStore.getState().spendCredits(bountyAmount);
      await gameApi.createDeadDrop("Anonymous", subject.trim(), bountyAmount, "anything");
      setIsCreating(false);
      setSubject('');
      setBounty('100');
      fetchDrops();
    } catch (e) {
      Alert.alert("Error", "Failed to create Dead Drop.");
    }
  };

  const handleAccept = async (drop: any) => {
    Alert.alert(
      "Accept Bounty",
      Are you sure you want to attempt this Dead Drop for  IC? You will play a Reverse game where you must guess the creator's secret subject.,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Accept", 
          onPress: async () => {
            await useGameStore.getState().startDeadDropGame(drop.subject, drop.category, drop.bounty);
            router.replace('/investigation');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <AnimatedPressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </AnimatedPressable>
        <Text style={styles.title}>Dead Drop Network</Text>
        <View style={styles.creditsBadge}>
          <Ionicons name="diamond" size={12} color={colors.glowBlue} style={{ marginRight: 4 }} />
          <Text style={styles.creditsText}>{intelCredits} IC</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Asynchronous global bounties. Post a subject and fund a bounty, or accept another detective's challenge.
        </Text>

        {isCreating ? (
          <GlassCard style={{ borderColor: colors.danger, borderWidth: 1 }}>
            <Text style={{ ...typography.h3, color: colors.danger, marginBottom: spacing.md }}>CREATE DEAD DROP</Text>
            
            <Text style={{ ...typography.caption, color: colors.textSecondary, marginBottom: 4 }}>Secret Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. The Antikythera Mechanism"
              placeholderTextColor={colors.textTertiary}
              value={subject}
              onChangeText={setSubject}
            />
            
            <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: 4 }}>Bounty (IC)</Text>
            <TextInput
              style={styles.input}
              placeholder="100"
              placeholderTextColor={colors.textTertiary}
              keyboardType="number-pad"
              value={bounty}
              onChangeText={setBounty}
            />

            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
              <View style={{ flex: 1 }}>
                <SecondaryButton label="CANCEL" onPress={() => setIsCreating(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <PrimaryButton label="POST BOUNTY" onPress={handleCreate} />
              </View>
            </View>
          </GlassCard>
        ) : (
          <PrimaryButton label="CREATE NEW DEAD DROP" icon="add" onPress={() => setIsCreating(true)} style={{ marginBottom: spacing.lg }} />
        )}

        <SectionHeader title="Active Bounties" actionLabel="Refresh" onActionPress={fetchDrops} style={{ marginTop: spacing.md }} />
        
        {loading ? (
          <ActivityIndicator size="large" color={colors.glowBlue} style={{ marginTop: spacing.xl }} />
        ) : drops.length === 0 ? (
          <Text style={{ ...typography.bodyMedium, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xl }}>
            No active drops on the network.
          </Text>
        ) : (
          drops.map(drop => (
            <GlassCard key={drop.id} style={styles.dropCard}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Text style={{ ...typography.caption, color: colors.textSecondary }}>Posted by {drop.creator}</Text>
                <Text style={{ ...typography.h3, color: colors.textPrimary, marginTop: 4 }}>UNKNOWN SUBJECT</Text>
                <Text style={{ ...typography.micro, color: colors.warning, marginTop: 4 }}>Category: {drop.category.toUpperCase()}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <View style={styles.bountyBadge}>
                  <Text style={{ ...typography.caption, color: colors.danger, fontWeight: 'bold' }}>{drop.bounty} IC</Text>
                </View>
                <AnimatedPressable onPress={() => handleAccept(drop)} style={styles.acceptBtn}>
                  <Text style={styles.acceptText}>ACCEPT</Text>
                </AnimatedPressable>
              </View>
            </GlassCard>
          ))
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    ...typography.h2,
    fontSize: 20,
  },
  creditsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  creditsText: {
    ...typography.caption,
    color: colors.glowBlue,
    fontWeight: '700',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    ...typography.bodyMedium,
  },
  dropCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
  },
  bountyBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 8,
  },
  acceptBtn: {
    backgroundColor: colors.primaryBlue,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  acceptText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: 'bold',
  },
});
