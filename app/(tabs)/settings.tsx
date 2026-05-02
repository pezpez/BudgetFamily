import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  Text, FAB, List, Dialog, Portal, TextInput, Button,
  IconButton, Divider, Surface,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useCategoryStore } from '../../store/useCategoryStore';
import { palette } from '../../constants/theme';

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
  const { categories, loadCategories, addCategory, deleteCategory, addSubcategory, deleteSubcategory } = useCategoryStore();

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

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Catégories & Sous-catégories</Text>
        <Text variant="bodySmall" style={styles.hint}>Appuyez longuement sur un élément pour le supprimer</Text>

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
                  <Text variant="bodyMedium" style={styles.subName}>{sub.name}</Text>
                  <IconButton
                    icon="close"
                    size={14}
                    iconColor={palette.textSecondary}
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
  dialog: { borderRadius: 20 },
  dialogInput: { marginBottom: 12, backgroundColor: 'transparent' },
  pickerLabel: { color: palette.textSecondary, marginBottom: 6, marginTop: 4 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, marginBottom: 8 },
  iconOption: { margin: 0, borderRadius: 8 },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotActive: { borderWidth: 3, borderColor: '#1A1C2E' },
});
