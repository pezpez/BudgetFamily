import { useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { FAB, Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { useTransactionStore } from '../../store/useTransactionStore';
import { TransactionItem } from '../../components/TransactionItem';
import { MonthSelector } from '../../components/MonthSelector';
import { palette } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';

export default function TransactionsScreen() {
  const { transactions, isLoading, selectedMonth, setSelectedMonth, loadTransactions } = useTransactionStore();
  const { colors } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { loadTransactions(); }, []));

  async function onRefresh() {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  }

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />

      {transactions.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="receipt-text-outline" size={64} color="#D1D5DB" />
          <Text variant="titleMedium" style={[styles.emptyTitle, { color: colors.textSecondary }]}>Aucune transaction</Text>
          <Text variant="bodySmall" style={[styles.emptyHint, { color: colors.textSecondary }]}>
            Appuyez sur + pour enregistrer{'\n'}une dépense ou un revenu
          </Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionItem
              id={item.id}
              amount={item.amount}
              type={item.type}
              date={item.date}
              note={item.note}
              subcategoryName={item.subcategoryName}
              subcategoryIcon={item.subcategoryIcon}
              categoryName={item.categoryName}
              categoryColor={item.categoryColor}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[palette.primary]}
              tintColor={palette.primary}
            />
          }
        />
      )}

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
  container: { flex: 1, backgroundColor: palette.backgroundLight },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  list: { padding: 16, paddingBottom: 100 },
  emptyTitle: { fontWeight: '600' },
  emptyHint: { textAlign: 'center', lineHeight: 20 },
  fab: {
    position: 'absolute', right: 20, bottom: 24,
    backgroundColor: palette.primary, borderRadius: 16,
  },
});
