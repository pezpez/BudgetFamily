import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import {
  Text, FAB, Dialog, Portal, TextInput, Button,
  IconButton, Divider, Surface,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useCategoryStore } from '../../store/useCategoryStore';
import { useSettingsStore, CURRENCIES } from '../../store/useSettingsStore';
import { palette } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useCurrency } from '../../hooks/useCurrency';
import { exportTransactionsCSV } from '../../utils/exportData';

const ICON_OPTIONS = [
  'cart', 'silverware-fork-knife', 'coffee', 'car', 'gas-station', 'bus',
  'home', 'lightning-bolt', 'wifi', 'gamepad-variant', 'party-popper', 'dumbbell',
  'television-play', 'heart-pulse', 'stethoscope', 'pill', 'cash-plus', 'briefcase',
  'laptop', 'tag', 'shopping', 'taxi', 'home-city', 'weight-lifter', 'plus-circle',
];

const COLOR_OPTIONS = [
  '#EF5350', '#FFA726', '#5C6BC0', '#AB47BC',
  '#26C6DA', '#66BB6A', '#FF7043', '#42A5F5',
];

export default function SettingsScreen() {
  const { categories, loadCategories, addCategory, deleteCategory, addSubcategory, deleteSubcategory, setSubcategoryBudget } = useCategoryStore();
  const { setCurrency } = useSettingsStore();
  const { colors } = useAppTheme();
  const { currencyCode, format: formatAmt } = useCurrency();
  const [exporting, setExporting] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [budgetSubId, setBudgetSubId] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState('');

  // Add category dialog
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('tag');
  const [newCatColor, setNewCatColor] = useState(COLOR_OPTIONS[0]);

  // Add subcategory dialog
  const [showAddSub, setShowAddSub] = useState(false);
  const [addSubForCatId, setAddSubForCatId] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');
  const [newSubIcon, setNewSubIcon] = useState('tag');

  useEffect(() => { loadCategories(); }, []);

  async function handleAddCategory() {
    if (!newCatName.trim()) return;
    await addCategory({ name: newCatName.trim(), icon: newCatIcon, color: newCatColor });
    setNewCatName(''); setNewCatIcon('tag'); setNewCatColor(COLOR_OPTIONS[0]);
    setShowAddCat(false);
  }

  function confirmDeleteCategory(id: string, name: string) {
    Alert.alert(
      'Supprimer la catégorie',
      `Supprimer "${name}" et toutes ses sous-catégories ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteCategory(id) },
      ],
    );
  }

  function openAddSub(catId: string) {
    setAddSubForCatId(catId);
    setNewSubName(''); setNewSubIcon('tag');
    setShowAddSub(true);
  }

  async function handleAddSubcategory() {
    if (!newSubName.trim() || !addSubForCatId) return;
    await addSubcategory({ categoryId: addSubForCatId, name: newSubName.trim(), icon: newSubIcon });
    setShowAddSub(false);
  }

  function confirmDeleteSub(id: string, name: string) {
    Alert.alert(
      'Supprimer',
      `Supprimer la sous-catégorie "${name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteSubcategory(id) },
      ],
    );
  }

  function openBudgetDialog(subId: string, currentBudget: number | null | undefined) {
    setBudgetSubId(subId);
    setBudgetInput(currentBudget ? currentBudget.toString() : '');
  }

  async function handleSaveBudget() {
    if (!budgetSubId) return;
    const val = parseFloat(budgetInput.replace(',', '.'));
    await setSubcategoryBudget(budgetSubId, isNaN(val) || val <= 0 ? null : val);
    setBudgetSubId(null);
    setBudgetInput('');
  }

  async function handleExport() {
    setExporting(true);
    try {
      await exportTransactionsCSV();
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'exporter les données.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Currency */}
        <TouchableOpacity
          style={[styles.recurringLink, { backgroundColor: colors.surface }]}
          onPress={() => setShowCurrencyPicker(true)}
        >
          <View style={styles.recurringLeft}>
            <View style={[styles.recurringIcon, { backgroundColor: palette.primary + '22' }]}>
              <MaterialCommunityIcons name="cash" size={22} color={palette.primary} />
            </View>
            <View>
              <Text variant="bodyMedium" style={[styles.recurringTitle, { color: colors.textPrimary }]}>
                Devise
              </Text>
              <Text variant="labelSmall" style={[styles.recurringSubtitle, { color: colors.textSecondary }]}>
                {CURRENCIES.find((c) => c.code === currencyCode)?.label ?? currencyCode}
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <Divider style={{ marginVertical: 8 }} />

        {/* Recurring shortcut */}
        <TouchableOpacity
          style={[styles.recurringLink, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/recurring/index')}
        >
          <View style={styles.recurringLeft}>
            <View style={[styles.recurringIcon, { backgroundColor: palette.primary + '22' }]}>
              <MaterialCommunityIcons name="repeat" size={22} color={palette.primary} />
            </View>
            <View>
              <Text variant="bodyMedium" style={[styles.recurringTitle, { color: colors.textPrimary }]}>
                Récurrences
              </Text>
              <Text variant="labelSmall" style={[styles.recurringSubtitle, { color: colors.textSecondary }]}>
                Dépenses et revenus automatiques
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <Divider style={{ marginVertical: 8 }} />

        {/* Export */}
        <TouchableOpacity
          style={[styles.recurringLink, { backgroundColor: colors.surface }]}
          onPress={handleExport}
          disabled={exporting}
        >
          <View style={styles.recurringLeft}>
            <View style={[styles.recurringIcon, { backgroundColor: palette.success + '22' }]}>
              <MaterialCommunityIcons name="download" size={22} color={palette.success} />
            </View>
            <View>
              <Text variant="bodyMedium" style={[styles.recurringTitle, { color: colors.textPrimary }]}>
                Exporter les données
              </Text>
              <Text variant="labelSmall" style={[styles.recurringSubtitle, { color: colors.textSecondary }]}>
                {exporting ? 'Export en cours...' : 'Toutes les transactions en CSV'}
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <Divider style={{ marginVertical: 8 }} />

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.textPrimary }]}>Catégories & Sous-catégories</Text>
        <Text variant="bodySmall" style={[styles.hint, { color: colors.textSecondary }]}>Appuyez sur la corbeille pour supprimer</Text>

        {categories.map((cat) => (
          <Surface key={cat.id} style={styles.catCard} elevation={1}>
            <View style={styles.catHeader}>
              <View style={[styles.catIconWrap, { backgroundColor: cat.color + '22' }]}>
                <MaterialCommunityIcons name={cat.icon as any} size={20} color={cat.color} />
              </View>
              <Text variant="titleSmall" style={[styles.catName, { color: cat.color }]}>{cat.name}</Text>
              <IconButton
                icon="delete-outline"
                size={18}
                iconColor={palette.danger}
                onPress={() => confirmDeleteCategory(cat.id, cat.name)}
              />
            </View>
            <Divider style={styles.divider} />
            <View style={styles.subsList}>
              {cat.subcategories.map((sub) => (
                <View key={sub.id} style={styles.subRow}>
                  <MaterialCommunityIcons name={sub.icon as any} size={16} color={cat.color} style={styles.subIcon} />
                  <Text variant="bodyMedium" style={[styles.subName, { color: colors.textPrimary }]}>{sub.name}</Text>
                  <TouchableOpacity
                    style={[styles.budgetChip, { borderColor: sub.monthlyBudget ? cat.color : colors.border }]}
                    onPress={() => openBudgetDialog(sub.id, sub.monthlyBudget)}
                  >
                    <MaterialCommunityIcons name="target" size={12}
                      color={sub.monthlyBudget ? cat.color : colors.textSecondary} />
                    <Text style={[styles.budgetChipText,
                      { color: sub.monthlyBudget ? cat.color : colors.textSecondary }]}>
                      {sub.monthlyBudget ? formatAmt(sub.monthlyBudget) : 'Objectif'}
                    </Text>
                  </TouchableOpacity>
                  <IconButton
                    icon="close"
                    size={14}
                    iconColor={palette.danger}
                    onPress={() => confirmDeleteSub(sub.id, sub.name)}
                  />
                </View>
              ))}
              <Button
                mode="text"
                icon="plus"
                compact
                textColor={cat.color}
                onPress={() => openAddSub(cat.id)}
                style={styles.addSubBtn}
              >
                Ajouter une sous-catégorie
              </Button>
            </View>
          </Surface>
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        label="Catégorie"
        style={styles.fab}
        color="#fff"
        onPress={() => setShowAddCat(true)}
      />

      <Portal>
        {/* Currency Picker */}
        <Dialog visible={showCurrencyPicker} onDismiss={() => setShowCurrencyPicker(false)} style={styles.dialog}>
          <Dialog.Title>Choisir la devise</Dialog.Title>
          <Dialog.Content>
            {CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c.code}
                style={[styles.currencyRow, currencyCode === c.code && { backgroundColor: palette.primary + '18' }]}
                onPress={async () => { await setCurrency(c.code); setShowCurrencyPicker(false); }}
              >
                <Text style={styles.currencySymbol}>{c.symbol}</Text>
                <Text variant="bodyMedium" style={{ flex: 1 }}>{c.label}</Text>
                {currencyCode === c.code &&
                  <MaterialCommunityIcons name="check" size={18} color={palette.primary} />}
              </TouchableOpacity>
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCurrencyPicker(false)}>Fermer</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Budget Dialog */}
        <Dialog visible={!!budgetSubId} onDismiss={() => setBudgetSubId(null)} style={styles.dialog}>
          <Dialog.Title>Objectif mensuel</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={`Montant objectif`}
              value={budgetInput}
              onChangeText={setBudgetInput}
              keyboardType="decimal-pad"
              style={styles.dialogInput}
              placeholder="Laisser vide pour supprimer"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setBudgetSubId(null)}>Annuler</Button>
            <Button onPress={handleSaveBudget}>Enregistrer</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Add Category Dialog */}
        <Dialog visible={showAddCat} onDismiss={() => setShowAddCat(false)} style={styles.dialog}>
          <Dialog.Title>Nouvelle catégorie</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nom"
              value={newCatName}
              onChangeText={setNewCatName}
              style={styles.dialogInput}
            />
            <Text variant="labelMedium" style={styles.pickerLabel}>Icône</Text>
            <View style={styles.iconGrid}>
              {ICON_OPTIONS.map((ico) => (
                <IconButton
                  key={ico}
                  icon={ico}
                  size={22}
                  iconColor={newCatIcon === ico ? '#fff' : palette.textSecondary}
                  style={[styles.iconOption, newCatIcon === ico && { backgroundColor: newCatColor }]}
                  onPress={() => setNewCatIcon(ico)}
                />
              ))}
            </View>
            <Text variant="labelMedium" style={styles.pickerLabel}>Couleur</Text>
            <View style={styles.colorRow}>
              {COLOR_OPTIONS.map((col) => (
                <View
                  key={col}
                  style={[styles.colorDot, { backgroundColor: col }, newCatColor === col && styles.colorDotActive]}
                  onTouchEnd={() => setNewCatColor(col)}
                />
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAddCat(false)}>Annuler</Button>
            <Button onPress={handleAddCategory} disabled={!newCatName.trim()}>Ajouter</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Add Subcategory Dialog */}
        <Dialog visible={showAddSub} onDismiss={() => setShowAddSub(false)} style={styles.dialog}>
          <Dialog.Title>Nouvelle sous-catégorie</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nom"
              value={newSubName}
              onChangeText={setNewSubName}
              style={styles.dialogInput}
            />
            <Text variant="labelMedium" style={styles.pickerLabel}>Icône</Text>
            <View style={styles.iconGrid}>
              {ICON_OPTIONS.map((ico) => (
                <IconButton
                  key={ico}
                  icon={ico}
                  size={22}
                  iconColor={newSubIcon === ico ? '#fff' : palette.textSecondary}
                  style={[styles.iconOption, newSubIcon === ico && { backgroundColor: palette.primary }]}
                  onPress={() => setNewSubIcon(ico)}
                />
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAddSub(false)}>Annuler</Button>
            <Button onPress={handleAddSubcategory} disabled={!newSubName.trim()}>Ajouter</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.backgroundLight },
  content: { padding: 16, gap: 12, paddingBottom: 100 },
  sectionTitle: { color: palette.textPrimary, fontWeight: '700' },
  hint: { color: palette.textSecondary, marginBottom: 4 },
  catCard: { borderRadius: 16, overflow: 'hidden' },
  catHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, paddingRight: 4 },
  catIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  catName: { flex: 1, fontWeight: '700' },
  divider: { marginHorizontal: 12 },
  subsList: { paddingHorizontal: 12, paddingBottom: 8 },
  subRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  subIcon: { marginRight: 4 },
  subName: { flex: 1, color: palette.textPrimary },
  addSubBtn: { alignSelf: 'flex-start', marginTop: 4 },
  fab: {
    position: 'absolute', right: 20, bottom: 24,
    backgroundColor: palette.primary, borderRadius: 16,
  },
  recurringLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
  },
  recurringLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recurringIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: palette.primary + '22', alignItems: 'center', justifyContent: 'center',
  },
  recurringTitle: { fontWeight: '600' },
  recurringSubtitle: { marginTop: 1 },
  budgetChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2,
  },
  budgetChipText: { fontSize: 11, fontWeight: '600' },
  currencyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8, marginBottom: 2,
  },
  currencySymbol: { fontSize: 18, fontWeight: '700', width: 32, textAlign: 'center' },
  dialog: { borderRadius: 20 },
  dialogInput: { marginBottom: 12, backgroundColor: 'transparent' },
  pickerLabel: { color: palette.textSecondary, marginBottom: 6, marginTop: 4 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, marginBottom: 8 },
  iconOption: { margin: 0, borderRadius: 8 },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotActive: { borderWidth: 3, borderColor: '#1A1C2E' },
});
