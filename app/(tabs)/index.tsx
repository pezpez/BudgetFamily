import { useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Surface, FAB, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { useTransactionStore } from '../../store/useTransactionStore';
import { palette } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';

export default function DashboardScreen() {
  const { transactions, selectedMonth, loadTransactions } = useTransactionStore();

  useFocusEffect(
    useCallback(() => { loadTransactions(); }, [])
  );

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;
  const balanceColor = balance >= 0 ? palette.success : palette.danger;

  // Top 3 categories by expense
  const catTotals = transactions
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, { name: string; color: string; icon: string; total: number }>>((acc, t) => {
      const key = t.categoryName;
      if (!acc[key]) acc[key] = { name: t.categoryName, color: t.categoryColor, icon: t.subcategoryIcon, total: 0 };
      acc[key].total += t.amount;
      return acc;
    }, {});

  const top3 = Object.values(catTotals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  const progress = totalIncome > 0 ? Math.min(totalExpense / totalIncome, 1) : 0;

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Month header */}
        <Text variant="labelLarge" style={styles.monthLabel}>
          {format(selectedMonth, 'MMMM yyyy', { locale: fr }).toUpperCase()}
        </Text>

        {/* Balance card */}
        <Surface style={styles.balanceCard} elevation={2}>
          <Text variant="labelMedium" style={styles.cardLabel}>Solde du mois</Text>
          <Text style={[styles.balanceAmount, { color: balanceColor }]}>
            {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
          </Text>
          <View style={styles.incomeExpenseRow}>
            <View style={styles.incomeExpenseItem}>
              <MaterialCommunityIcons name="arrow-down-circle" size={18} color={palette.accent} />
              <Text variant="labelMedium" style={{ color: palette.accent, marginLeft: 4 }}>
                {formatCurrency(totalIncome)}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.incomeExpenseItem}>
              <MaterialCommunityIcons name="arrow-up-circle" size={18} color={palette.danger} />
              <Text variant="labelMedium" style={{ color: palette.danger, marginLeft: 4 }}>
                {formatCurrency(totalExpense)}
              </Text>
            </View>
          </View>
          {totalIncome > 0 && (
            <View style={styles.progressWrap}>
              <ProgressBar progress={progress} color={progress > 0.9 ? palette.danger : palette.primary} style={styles.progress} />
              <Text variant="labelSmall" style={styles.progressLabel}>
                {Math.round(progress * 100)}% du budget dépensé
              </Text>
            </View>
          )}
        </Surface>

        {/* Top categories */}
        <Surface style={styles.card} elevation={1}>
          <Text variant="titleSmall" style={styles.cardTitle}>Top dépenses</Text>
          {top3.length === 0 ? (
            <Text variant="bodySmall" style={styles.empty}>Aucune dépense ce mois-ci</Text>
          ) : (
            top3.map((cat) => (
              <View key={cat.name} style={styles.catRow}>
                <View style={[styles.catIcon, { backgroundColor: cat.color + '22' }]}>
                  <MaterialCommunityIcons name={cat.icon as any} size={18} color={cat.color} />
                </View>
                <Text variant="bodyMedium" style={styles.catName}>{cat.name}</Text>
                <Text variant="bodyMedium" style={[styles.catAmount, { color: palette.danger }]}>
                  -{formatCurrency(cat.total)}
                </Text>
              </View>
            ))
          )}
        </Surface>

        {/* Recent transactions */}
        <Surface style={styles.card} elevation={1}>
          <Text variant="titleSmall" style={styles.cardTitle}>Dernières transactions</Text>
          {transactions.length === 0 ? (
            <Text variant="bodySmall" style={styles.empty}>Aucune transaction ce mois-ci</Text>
          ) : (
            transactions.slice(0, 5).map((tx) => (
              <View key={tx.id} style={styles.recentRow}>
                <View style={[styles.catIcon, { backgroundColor: tx.categoryColor + '22' }]}>
                  <MaterialCommunityIcons name={tx.subcategoryIcon as any} size={16} color={tx.categoryColor} />
                </View>
                <Text variant="bodySmall" style={styles.catName}>{tx.subcategoryName}</Text>
                <Text
                  variant="bodySmall"
                  style={{ color: tx.type === 'expense' ? palette.danger : palette.accent, fontWeight: '600' }}
                >
                  {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                </Text>
              </View>
            ))
          )}
        </Surface>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => router.push('/transaction/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.backgroundLight },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 100 },
  monthLabel: { color: palette.textSecondary, letterSpacing: 1, marginBottom: 4 },
  balanceCard: { borderRadius: 20, padding: 20 },
  cardLabel: { color: palette.textSecondary, marginBottom: 4 },
  balanceAmount: { fontSize: 36, fontWeight: '800', marginBottom: 12 },
  incomeExpenseRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  incomeExpenseItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  separator: { width: 1, height: 20, backgroundColor: '#E5E7EB' },
  progressWrap: { gap: 4 },
  progress: { height: 6, borderRadius: 3 },
  progressLabel: { color: palette.textSecondary, textAlign: 'right' },
  card: { borderRadius: 16, padding: 16 },
  cardTitle: { color: palette.textPrimary, fontWeight: '700', marginBottom: 12 },
  empty: { color: palette.textSecondary, textAlign: 'center', paddingVertical: 4 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  catIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  catName: { flex: 1, color: palette.textPrimary },
  catAmount: { fontWeight: '600' },
  fab: {
    position: 'absolute', right: 20, bottom: 24,
    backgroundColor: palette.primary, borderRadius: 16,
  },
});
