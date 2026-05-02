import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, addMonths, subMonths, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { palette } from '../constants/theme';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

export function MonthSelector({ value, onChange }: Props) {
  const isCurrentMonth = isSameMonth(value, new Date());

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onChange(subMonths(value, 1))} style={styles.arrow}>
        <MaterialCommunityIcons name="chevron-left" size={26} color={palette.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => !isCurrentMonth && onChange(new Date())} style={styles.label}>
        <Text variant="titleMedium" style={styles.monthText}>
          {format(value, 'MMMM yyyy', { locale: fr })}
        </Text>
        {!isCurrentMonth && (
          <Text variant="labelSmall" style={styles.backToNow}>Revenir au mois actuel</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => !isCurrentMonth && onChange(addMonths(value, 1))}
        style={[styles.arrow, isCurrentMonth && styles.disabled]}
      >
        <MaterialCommunityIcons
          name="chevron-right"
          size={26}
          color={isCurrentMonth ? '#D1D5DB' : palette.primary}
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
  monthText: { color: palette.textPrimary, fontWeight: '700', textTransform: 'capitalize' },
  backToNow: { color: palette.primary, marginTop: 2 },
});
