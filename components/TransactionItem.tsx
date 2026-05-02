import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { palette } from '../constants/theme';
import { formatCurrency } from '../utils/currency';
import { useTransactionStore } from '../store/useTransactionStore';

interface Props {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
  note: string | null;
  subcategoryName: string;
  subcategoryIcon: string;
  categoryName: string;
  categoryColor: string;
}

export function TransactionItem(props: Props) {
  const { deleteTransaction } = useTransactionStore();
  const isExpense = props.type === 'expense';
  const amountColor = isExpense ? palette.danger : palette.accent;
  const sign = isExpense ? '-' : '+';

  function confirmDelete() {
    Alert.alert(
      'Supprimer',
      `Supprimer cette transaction de ${formatCurrency(props.amount)} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteTransaction(props.id) },
      ],
    );
  }

  return (
    <TouchableOpacity onLongPress={confirmDelete} activeOpacity={0.7}>
      <Surface style={styles.container} elevation={0}>
        <View style={[styles.iconWrap, { backgroundColor: props.categoryColor + '22' }]}>
          <MaterialCommunityIcons
            name={props.subcategoryIcon as any}
            size={22}
            color={props.categoryColor}
          />
        </View>
        <View style={styles.info}>
          <Text variant="bodyMedium" style={styles.subName}>{props.subcategoryName}</Text>
          <Text variant="labelSmall" style={styles.catName}>{props.categoryName}</Text>
          {props.note ? (
            <Text variant="labelSmall" style={styles.note} numberOfLines={1}>{props.note}</Text>
          ) : null}
        </View>
        <View style={styles.right}>
          <Text style={[styles.amount, { color: amountColor }]}>
            {sign}{formatCurrency(props.amount)}
          </Text>
          <Text variant="labelSmall" style={styles.date}>
            {format(props.date, 'd MMM', { locale: fr })}
          </Text>
        </View>
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderRadius: 14, marginBottom: 8,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  subName: { color: palette.textPrimary, fontWeight: '600' },
  catName: { color: palette.textSecondary, marginTop: 1 },
  note: { color: palette.textSecondary, fontStyle: 'italic', marginTop: 1 },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: 16, fontWeight: '700' },
  date: { color: palette.textSecondary, marginTop: 2 },
});
