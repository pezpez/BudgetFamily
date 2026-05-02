import { useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, FAB, Surface, Switch, IconButton, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { useRecurringStore } from '../../store/useRecurringStore';
import { palette } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useCurrency } from '../../hooks/useCurrency';
import { frequencyLabel, getNextOccurrence } from '../../utils/recurring';

export default function RecurringListScreen() {
  const { rules, isLoading, loadRules, toggleRule, deleteRule } = useRecurringStore();
  const { format: fmt } = useCurrency();
  const { colors } = useAppTheme();

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
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {rules.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="repeat-off" size={56} color={colors.border} />
          <Text variant="bodyLarge" style={[styles.emptyTitle, { color: colors.textSecondary }]}>
            Aucune récurrence
          </Text>
          <Text variant="bodySmall" style={[styles.emptyHint, { color: colors.textSecondary }]}>
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
                    <View style={[styles.iconWrap, { backgroundColor: item.categoryColor + '20' }]}>
                      <MaterialCommunityIcons name={item.subcategoryIcon as any} size={22} color={item.categoryColor} />
                    </View>
                    <View style={styles.info}>
                      <Text variant="bodyMedium"
                        style={[styles.subName, { color: item.isActive ? colors.textPrimary : colors.textSecondary }]}>
                        {item.subcategoryName}
                      </Text>
                      <Text variant="labelSmall" style={[styles.catName, { color: colors.textSecondary }]}>
                        {item.categoryName}
                      </Text>
                      <View style={styles.badgeRow}>
                        <View style={[styles.badge, { backgroundColor: colors.primary + '18' }]}>
                          <Text variant="labelSmall" style={[styles.badgeText, { color: colors.primary }]}>
                            {frequencyLabel(item.frequency)}
                          </Text>
                        </View>
                        {item.note ? (
                          <Text variant="labelSmall" style={[styles.note, { color: colors.textSecondary }]} numberOfLines={1}>
                            {item.note}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    <View style={styles.right}>
                      <Text style={[styles.amount, { color: amountColor }]}>
                        {sign}{fmt(item.amount)}
                      </Text>
                      <Switch
                        value={item.isActive}
                        onValueChange={(val) => toggleRule(item.id, val)}
                        color={colors.primary}
                      />
                    </View>
                  </View>
                  <Divider style={styles.divider} />
                  <View style={styles.cardBottom}>
                    <MaterialCommunityIcons name="calendar-clock" size={14} color={colors.textSecondary} />
                    <Text variant="labelSmall" style={[styles.nextDate, { color: colors.textSecondary }]}>
                      Prochaine : {format(nextDate, 'd MMMM yyyy', { locale: fr })}
                    </Text>
                    <Text variant="labelSmall" style={[styles.startDate, { color: colors.textSecondary }]}>
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
        style={[styles.fab, { backgroundColor: colors.primary }]}
        color="#fff"
        onPress={() => router.push('/recurring/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { fontWeight: '600' },
  emptyHint: { textAlign: 'center', paddingHorizontal: 40 },
  list: { padding: 16, paddingBottom: 100 },
  card: { borderRadius: 16, overflow: 'hidden' },
  cardInactive: { opacity: 0.55 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingBottom: 10 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  subName: { fontWeight: '600' },
  catName: { marginTop: 1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontWeight: '600' },
  note: { fontStyle: 'italic', flex: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 16, fontWeight: '700' },
  divider: { marginHorizontal: 14 },
  cardBottom: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  nextDate: { flex: 1 },
  startDate: {},
  deleteBtn: { margin: 0 },
  fab: { position: 'absolute', right: 20, bottom: 24, borderRadius: 16 },
});
