import { useState, useEffect } from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';

import { TransactionForm } from '../../components/TransactionForm';
import { useTransactionStore } from '../../store/useTransactionStore';
import { palette } from '../../constants/theme';
import type { Transaction } from '../../db/schema';

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { getById, updateTransaction, deleteTransaction } = useTransactionStore();
  const [tx, setTx] = useState<Transaction | null>(null);

  useEffect(() => {
    getById(id).then(setTx);
  }, [id]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleDelete} style={{ marginRight: 16 }}>
          <MaterialCommunityIcons name="delete-outline" size={22} color={palette.danger} />
        </TouchableOpacity>
      ),
    });
  }, [id]);

  function handleDelete() {
    Alert.alert('Supprimer', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          await deleteTransaction(id);
          router.back();
        },
      },
    ]);
  }

  if (!tx) return null;

  return (
    <TransactionForm
      initialType={tx.type as 'expense' | 'income'}
      initialAmount={tx.amount.toString()}
      initialSubId={tx.subcategoryId}
      initialDate={tx.date}
      initialNote={tx.note ?? ''}
      submitLabel="Enregistrer les modifications"
      onSubmit={async (data) => {
        await updateTransaction(id, data);
        router.back();
      }}
    />
  );
}
