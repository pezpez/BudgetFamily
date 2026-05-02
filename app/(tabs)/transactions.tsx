import { useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, Text, ActivityIndicator } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';

import { useTransactionStore } from '../../store/useTransactionStore';
import { TransactionItem } from '../../components/TransactionItem';
import { MonthSelector } from '../../components/MonthSelector';
import { palette } from '../../constants/theme';

export default function TransactionsScreen() {
  const { transactions, isLoading, selectedMonth, setSelectedMonth, loadTransactions } = useTransactionStore();

  useFocusEffect(
    useCallback(() => { loadTransactions(); }, [])
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />

      {transactions.length === 0 ? (
        <View style={styles.center}>
          <Text variant="bodyLarge" style={styles.empty}>Aucune transaction ce mois-ci</Text>
          <Text variant="bodySmall" style={styles.hint}>Appuyez sur + pour en ajouter une</Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 100 },
  empty: { color: palette.textSecondary, marginBottom: 4 },
  hint: { color: palette.textSecondary },
  fab: {
    position: 'absolute', right: 20, bottom: 24,
    backgroundColor: palette.primary, borderRadius: 16,
  },
});
