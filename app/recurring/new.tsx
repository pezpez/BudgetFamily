import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { useCategoryStore } from '../../store/useCategoryStore';
import { useRecurringStore } from '../../store/useRecurringStore';
import { useCurrency } from '../../hooks/useCurrency';
import { useAppTheme } from '../../hooks/useAppTheme';
import { palette } from '../../constants/theme';

type TxType = 'expense' | 'income';
type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function NewRecurringScreen() {
  const theme = useTheme();
  const { categories, loadCategories } = useCategoryStore();
  const { addRule } = useRecurringStore();
  const { symbol } = useCurrency();
  const { colors } = useAppTheme();

  const [type, setType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('');
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCategories(); }, []);

  const typeColor = type === 'expense' ? palette.danger : palette.accent;

  async function handleSave() {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Montant invalide', 'Veuillez saisir un montant supérieur à 0.');
      return;
    }
    if (!selectedSubId) {
      Alert.alert('Catégorie manquante', 'Veuillez choisir une sous-catégorie.');
      return;
    }
    setSaving(true);
    await addRule({
      subcategoryId: selectedSubId,
      amount: parseFloat(amount.replace(',', '.')),
      type,
      frequency,
      dayOfMonth: frequency === 'monthly' ? startDate.getDate() : null,
      dayOfWeek: frequency === 'weekly' ? startDate.getDay() : null,
      startDate,
      endDate: null,
      isActive: true,
      note: note.trim() || null,
    });
    setSaving(false);
    router.back();
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {/* Type toggle */}
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeBtn, { backgroundColor: colors.surfaceVariant },
            type === 'expense' && { backgroundColor: palette.danger }]}
          onPress={() => setType('expense')}
        >
          <MaterialCommunityIcons name="arrow-up-circle" size={20} color={type === 'expense' ? '#fff' : palette.danger} />
          <Text style={[styles.typeBtnLabel, { color: type === 'expense' ? '#fff' : palette.danger }]}>Dépense</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, { backgroundColor: colors.surfaceVariant },
            type === 'income' && { backgroundColor: palette.accent }]}
          onPress={() => setType('income')}
        >
          <MaterialCommunityIcons name="arrow-down-circle" size={20} color={type === 'income' ? '#fff' : palette.accent} />
          <Text style={[styles.typeBtnLabel, { color: type === 'income' ? '#fff' : palette.accent }]}>Entrée</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {/* Amount */}
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0,00"
          label={`Montant (${symbol})`}
          style={[styles.input, { backgroundColor: colors.inputBg }]}
          textColor={typeColor}
        />

        {/* Frequency */}
        <Text variant="labelLarge" style={[styles.label, { color: colors.textSecondary }]}>Fréquence</Text>
        <SegmentedButtons
          value={frequency}
          onValueChange={(v) => setFrequency(v as Frequency)}
          buttons={[
            { value: 'daily', label: 'Jour' },
            { value: 'weekly', label: 'Semaine' },
            { value: 'monthly', label: 'Mois' },
            { value: 'yearly', label: 'Année' },
          ]}
          style={styles.segmented}
        />

        {/* Start date */}
        <Text variant="labelLarge" style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>Date de début</Text>
        <TouchableOpacity
          style={[styles.datePicker, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialCommunityIcons name="calendar" size={20} color={colors.textSecondary} />
          <Text style={[styles.dateText, { color: colors.textPrimary }]}>
            {format(startDate, 'EEEE d MMMM yyyy', { locale: fr })}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_, selected) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selected) setStartDate(selected);
            }}
          />
        )}

        {/* Subcategory */}
        <Text variant="labelLarge" style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>Catégorie</Text>
        {categories.map((cat) => (
          <View key={cat.id}>
            <Text variant="labelSmall" style={[styles.catHeader, { color: cat.color }]}>
              {cat.name.toUpperCase()}
            </Text>
            <View style={styles.subsRow}>
              {cat.subcategories.map((sub) => {
                const active = selectedSubId === sub.id;
                return (
                  <TouchableOpacity
                    key={sub.id}
                    style={[styles.subChip, { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
                      active && { backgroundColor: cat.color, borderColor: cat.color }]}
                    onPress={() => setSelectedSubId(sub.id)}
                  >
                    <MaterialCommunityIcons name={sub.icon as any} size={16} color={active ? '#fff' : cat.color} />
                    <Text style={[styles.subChipLabel, { color: active ? '#fff' : colors.textPrimary }]}>
                      {sub.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Note */}
        <Text variant="labelLarge" style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>Note (optionnel)</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Ex: Loyer mensuel..."
          style={[styles.input, { backgroundColor: colors.inputBg }]}
          multiline
          numberOfLines={2}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={[styles.saveBtn, { backgroundColor: typeColor }]}
          contentStyle={{ height: 52 }}
          labelStyle={{ fontSize: 16, fontWeight: '700' }}
        >
          Créer la récurrence
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  typeRow: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 4 },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: 'transparent', backgroundColor: palette.backgroundLight,
  },
  typeBtnLabel: { fontSize: 15, fontWeight: '600' },
  form: { padding: 16, gap: 4, paddingBottom: 40 },
  input: { backgroundColor: '#F9FAFB', marginBottom: 4 },
  label: { color: palette.textSecondary, marginBottom: 8, marginTop: 4 },
  segmented: { marginBottom: 4 },
  datePicker: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 12, borderWidth: 1, backgroundColor: '#F9FAFB',
  },
  dateText: { fontSize: 14, color: palette.textPrimary, textTransform: 'capitalize' },
  catHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6, marginTop: 8 },
  subsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB',
  },
  subChipLabel: { fontSize: 13, fontWeight: '500' },
  saveBtn: { marginTop: 24, borderRadius: 14 },
});
