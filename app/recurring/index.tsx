import { useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, FAB, Surface, Switch, IconButton, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { useRecurringStore } from '../../store/useRecurringStore';
import { router } from 'expo-router';
import { palette } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';
import { frequencyLabel, getNextOccurrence } from '../../utils/recurring';

export default function RecurringListScreen() {
  const { rules, isLoading, loadRules, toggleRule, deleteRule } = useRecurringStore();

  useFocusEffect(useCallback(() => { loadRules(); }, []));

  function confirmDelete(id: string, name: string) {
    Alert.alert(
      'Supprimer la récurrence',
      `Supprimer la règle "${name}" ? Les transactions déjà générées ne seront pas supprimées.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteRule(id) },
      ],
    );
  }

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={palette.primary} /></View>;
  }

  return (
    <View style={styles.root}>
      {rules.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="repeat-off" size={56} color="#D1D5DB" />
          <Text variant="bodyLarge" style={styles.emptyTitle}>Aucune récurrence</Text>
          <Text variant="bodySmall" style={styles.emptyHint}>
            Programmez des dépenses ou revenus automatiques
          </Text>
        </View>
      ) : (
        <FlatList
          data={rules}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => {
            const nextDate = getNextOccurrence(item);
            const isExpense = item.type === 'expense';
            const amountColor = isExpense ? palette.danger : palette.accent;
            const sign = isExpense ? '-' : '+';

            return (
              <TouchableOpacity onPress={() => router.push(`/recurring/${item.id}`)}>
              <Surface style={[styles.card, !item.isActive && styles.cardInactive]} elevation={1}>
                <View style={styles.cardTop}>
                  <View style={[styles.iconWrap, { backgroundColor: item.categoryColor + '22' }]}>
                    <MaterialCommunityIcons name={item.subcategoryIcon as any} size={22} color={item.categoryColor} />
                  </View>
                  <View style={styles.info}>
                    <Text variant="bodyMedium" style={[styles.subName, !item.isActive && styles.inactiveText]}>
                      {item.subcategoryName}
                    </Text>
                    <Text variant="labelSmall" style={styles.catName}>{item.categoryName}</Text>
                    <View style={styles.badgeRow}>
                      <View style={styles.badge}>
                        <Text variant="labelSmall" style={styles.badgeText}>
                          {frequencyLabel(item.frequency)}
                        </Text>
                      </View>
                      {item.note ? (
                        <Text variant="labelSmall" style={styles.note} numberOfLines={1}>
                          {item.note}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.right}>
                    <Text style={[styles.amount, { color: amountColor }]}>
                      {sign}{formatCurrency(item.amount)}
                    </Text>
                    <Switch
                      value={item.isActive}
                      onValueChange={(val) => toggleRule(item.id, val)}
                      color={palette.primary}
                    />
                  </View>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.cardBottom}>
                  <MaterialCommunityIcons name="calendar-clock" size={14} color={palette.textSecondary} />
                  <Text variant="labelSmall" style={styles.nextDate}>
                    Prochaine : {format(nextDate, 'd MMMM yyyy', { locale: fr })}
                  </Text>
                  <Text variant="labelSmall" style={styles.startDate}>
                    Depuis le {format(item.startDate, 'd MMM yyyy', { locale: fr })}
                  </Text>
                  <IconButton
                    icon="delete-outline"
                    size={16}
                    iconColor={palette.danger}
                    style={styles.deleteBtn}
                    onPress={() => confirmDelete(item.id, item.subcategoryName)}
                  />
                </View>
              </Surface>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => router.push('/recurring/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.backgroundLight },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { color: palette.textSecondary, fontWeight: '600' },
  emptyHint: { color: palette.textSecondary, textAlign: 'center', paddingHorizontal: 40 },
  list: { padding: 16, paddingBottom: 100 },
  card: { borderRadius: 16, overflow: 'hidden' },
  cardInactive: { opacity: 0.6 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingBottom: 10 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  subName: { color: palette.textPrimary, fontWeight: '600' },
  inactiveText: { color: palette.textSecondary },
  catName: { color: palette.textSecondary, marginTop: 1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  badge: {
    backgroundColor: palette.primary + '22', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  badgeText: { color: palette.primary, fontWeight: '600' },
  note: { color: palette.textSecondary, fontStyle: 'italic', flex: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 16, fontWeight: '700' },
  divider: { marginHorizontal: 14 },
  cardBottom: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  nextDate: { color: palette.textSecondary, flex: 1 },
  startDate: { color: palette.textSecondary },
  deleteBtn: { margin: 0 },
  fab: {
    position: 'absolute', right: 20, bottom: 24,
    backgroundColor: palette.primary, borderRadius: 16,
  },
});
