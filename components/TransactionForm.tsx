/**
 * Formulaire partagé entre création et édition de transaction.
 * Gère les couleurs dynamiques light/dark.
 */
import { useState, useEffect } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity, Platform, Alert,
} from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { useCategoryStore } from '../store/useCategoryStore';
import { palette } from '../constants/theme';
import { useAppTheme } from '../hooks/useAppTheme';
import { useCurrency } from '../hooks/useCurrency';

export type TransactionType = 'expense' | 'income';

interface Props {
  initialType?: TransactionType;
  initialAmount?: string;
  initialSubId?: string | null;
  initialDate?: Date;
  initialNote?: string;
  submitLabel: string;
  onSubmit: (data: {
    type: TransactionType;
    amount: number;
    subcategoryId: string;
    date: Date;
    note: string | null;
  }) => Promise<void>;
}

export function TransactionForm({
  initialType = 'expense',
  initialAmount = '',
  initialSubId = null,
  initialDate,
  initialNote = '',
  submitLabel,
  onSubmit,
}: Props) {
  const { categories, loadCategories } = useCategoryStore();
  const { colors } = useAppTheme();
  const { symbol } = useCurrency();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState(initialAmount);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(initialSubId);
  const [date, setDate] = useState(initialDate ?? new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCategories(); }, []);

  const typeColor = type === 'expense' ? palette.danger : palette.accent;

  async function handleSubmit() {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Montant invalide', 'Veuillez saisir un montant supérieur à 0.');
      return;
    }
    if (!selectedSubId) {
      Alert.alert('Catégorie manquante', 'Veuillez choisir une sous-catégorie.');
      return;
    }
    setSaving(true);
    await onSubmit({
      type,
      amount: parseFloat(amount.replace(',', '.')),
      subcategoryId: selectedSubId,
      date,
      note: note.trim() || null,
    });
    setSaving(false);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Type toggle */}
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeBtn, { backgroundColor: colors.surfaceVariant },
            type === 'expense' && { backgroundColor: palette.danger }]}
          onPress={() => setType('expense')}
        >
          <MaterialCommunityIcons name="arrow-up-circle" size={20}
            color={type === 'expense' ? '#fff' : palette.danger} />
          <Text style={[styles.typeBtnLabel,
            { color: type === 'expense' ? '#fff' : palette.danger }]}>Dépense</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, { backgroundColor: colors.surfaceVariant },
            type === 'income' && { backgroundColor: palette.accent }]}
          onPress={() => setType('income')}
        >
          <MaterialCommunityIcons name="arrow-down-circle" size={20}
            color={type === 'income' ? '#fff' : palette.accent} />
          <Text style={[styles.typeBtnLabel,
            { color: type === 'income' ? '#fff' : palette.accent }]}>Entrée</Text>
        </TouchableOpacity>
      </View>

      {/* Amount */}
      <Surface style={[styles.amountCard, { backgroundColor: colors.surface }]} elevation={1}>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0,00"
          style={[styles.amountInput, { backgroundColor: 'transparent' }]}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          textColor={typeColor}
          placeholderTextColor={colors.textSecondary}
          contentStyle={{ fontSize: 42, fontWeight: '700', textAlign: 'center' }}
          right={<TextInput.Affix text={symbol} textStyle={{ fontSize: 28, color: typeColor }} />}
        />
      </Surface>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled">
        {/* Subcategory */}
        <Text variant="labelLarge" style={[styles.label, { color: colors.textSecondary }]}>
          Catégorie
        </Text>
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
                    style={[
                      styles.subChip,
                      { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
                      active && { backgroundColor: cat.color, borderColor: cat.color },
                    ]}
                    onPress={() => setSelectedSubId(sub.id)}
                  >
                    <MaterialCommunityIcons name={sub.icon as any} size={16}
                      color={active ? '#fff' : cat.color} />
                    <Text style={[styles.subChipLabel,
                      { color: active ? '#fff' : colors.textPrimary }]}>
                      {sub.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Date */}
        <Text variant="labelLarge" style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>
          Date
        </Text>
        <TouchableOpacity
          style={[styles.datePicker, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialCommunityIcons name="calendar" size={20} color={colors.textSecondary} />
          <Text style={[styles.dateText, { color: colors.textPrimary }]}>
            {format(date, 'EEEE d MMMM yyyy', { locale: fr })}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_, selected) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selected) setDate(selected);
            }}
            maximumDate={new Date()}
          />
        )}

        {/* Note */}
        <Text variant="labelLarge" style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>
          Note (optionnel)
        </Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Ajouter une note..."
          placeholderTextColor={colors.textSecondary}
          style={[styles.noteInput, { backgroundColor: colors.inputBg }]}
          multiline
          numberOfLines={2}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={saving}
          disabled={saving}
          style={[styles.saveBtn, { backgroundColor: typeColor }]}
          contentStyle={{ height: 52 }}
          labelStyle={{ fontSize: 16, fontWeight: '700', color: '#fff' }}
        >
          {submitLabel}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  typeRow: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 8 },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 12,
  },
  typeBtnLabel: { fontSize: 15, fontWeight: '700' },
  amountCard: { marginHorizontal: 16, marginBottom: 8, borderRadius: 16 },
  amountInput: { textAlign: 'center' },
  form: { flex: 1 },
  formContent: { padding: 16, gap: 4, paddingBottom: 40 },
  label: { marginBottom: 8, marginTop: 4, fontWeight: '600' },
  catHeader: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 6, marginTop: 10 },
  subsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5,
  },
  subChipLabel: { fontSize: 13, fontWeight: '600' },
  datePicker: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 12, borderWidth: 1.5,
  },
  dateText: { fontSize: 14, textTransform: 'capitalize', fontWeight: '500' },
  noteInput: { borderRadius: 12 },
  saveBtn: { marginTop: 24, borderRadius: 14 },
});
