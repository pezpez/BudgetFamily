import { router } from 'expo-router';
import { TransactionForm } from '../../components/TransactionForm';
import { useTransactionStore } from '../../store/useTransactionStore';

export default function NewTransactionScreen() {
  const { addTransaction } = useTransactionStore();

  return (
    <TransactionForm
      submitLabel="Enregistrer"
      onSubmit={async (data) => {
        await addTransaction({
          ...data,
          isRecurring: false,
          recurringRuleId: null,
        });
        router.back();
      }}
    />
  );
}
