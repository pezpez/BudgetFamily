import { router } from 'expo-router';
import { TransactionForm } from '../../components/TransactionForm';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useRecurringStore } from '../../store/useRecurringStore';

export default function NewTransactionScreen() {
  const { addTransaction } = useTransactionStore();
  const { addRule } = useRecurringStore();

  return (
    <TransactionForm
      submitLabel="Enregistrer"
      showRecurring
      onSubmit={async (data) => {
        await addTransaction({
          subcategoryId: data.subcategoryId,
          amount: data.amount,
          type: data.type,
          date: data.date,
          note: data.note,
          isRecurring: data.isRecurring,
          recurringRuleId: null,
        });

        if (data.isRecurring) {
          await addRule({
            subcategoryId: data.subcategoryId,
            amount: data.amount,
            type: data.type,
            frequency: data.frequency,
            dayOfMonth: data.frequency === 'monthly' ? data.date.getDate() : null,
            dayOfWeek:  data.frequency === 'weekly'  ? data.date.getDay()  : null,
            startDate:  data.date,
            endDate:    null,
            isActive:   true,
            note:       null,
          });
        }

        router.back();
      }}
    />
  );
}
