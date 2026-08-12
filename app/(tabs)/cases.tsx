import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CaseCard } from '@/src/components';
import { colors, spacing, typography } from '@/src/theme';
import { useCasesStore } from '@/src/store/casesStore';

export default function CasesScreen() {
  const cases = useCasesStore((s) => s.cases);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={typography.h1}>Cases</Text>
        <Text style={styles.subtitle}>Every investigation, filed and searchable.</Text>
      </View>
      <FlatList
        data={cases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CaseCard record={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge * 2,
  },
});
