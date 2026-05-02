import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { palette } from '../../constants/theme';

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Surface style={styles.card} elevation={1}>
        <Text variant="labelMedium" style={styles.label}>Solde du mois</Text>
        <Text variant="displaySmall" style={styles.balance}>0,00 €</Text>
      </Surface>

      <Surface style={styles.card} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Top dépenses</Text>
        <Text variant="bodyMedium" style={styles.empty}>Aucune dépense ce mois-ci</Text>
      </Surface>

      <Surface style={styles.card} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Prochaines récurrences</Text>
        <Text variant="bodyMedium" style={styles.empty}>Aucune récurrence programmée</Text>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.backgroundLight },
  content: { padding: 16, gap: 12 },
  card: { borderRadius: 16, padding: 20 },
  label: { color: palette.textSecondary, marginBottom: 4 },
  balance: { color: palette.primary, fontWeight: '700' },
  sectionTitle: { color: palette.textPrimary, fontWeight: '600', marginBottom: 12 },
  empty: { color: palette.textSecondary, textAlign: 'center', paddingVertical: 8 },
});
