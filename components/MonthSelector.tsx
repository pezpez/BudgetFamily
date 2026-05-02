import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, addMonths, subMonths, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAppTheme } from '../hooks/useAppTheme';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

export function MonthSelector({ value, onChange }: Props) {
  const { colors } = useAppTheme();
  const isCurrentMonth = isSameMonth(value, new Date());

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <TouchableOpacity onPress={() => onChange(subMonths(value, 1))} style={styles.arrow}>
        <MaterialCommunityIcons name="chevron-left" size={26} color={colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => !isCurrentMonth && onChange(new Date())} style={styles.label}>
        <Text variant="titleMedium" style={[styles.monthText, { color: colors.textPrimary }]}>
          {format(value, 'MMMM yyyy', { locale: fr })}
        </Text>
        {!isCurrentMonth && (
          <Text variant="labelSmall" style={[styles.backToNow, { color: colors.primary }]}>
            Revenir au mois actuel
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => !isCurrentMonth && onChange(addMonths(value, 1))}
        style={[styles.arrow, isCurrentMonth && styles.disabled]}
      >
        <MaterialCommunityIcons
          name="chevron-right"
          size={26}
          color={isCurrentMonth ? colors.border : colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingVertical: 12,
  },
  arrow: { padding: 4 },
  disabled: { opacity: 0.4 },
  label: { alignItems: 'center', flex: 1 },
  monthText: { fontWeight: '700', textTransform: 'capitalize' },
  backToNow: { marginTop: 2 },
});
