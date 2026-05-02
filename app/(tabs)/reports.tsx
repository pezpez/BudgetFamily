import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { palette } from '../../constants/theme';

export default function ReportsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="bodyLarge" style={styles.empty}>Les rapports apparaîtront ici</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.backgroundLight, alignItems: 'center', justifyContent: 'center' },
  empty: { color: palette.textSecondary },
});
