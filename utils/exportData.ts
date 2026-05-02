import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { db } from '../db/client';
import { transactions, subcategories, categories } from '../db/schema';
import { eq } from 'drizzle-orm';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function exportTransactionsCSV(): Promise<void> {
  const rows = await db
    .select({
      date: transactions.date,
      type: transactions.type,
      amount: transactions.amount,
      subcategoryName: subcategories.name,
      categoryName: categories.name,
      note: transactions.note,
      isRecurring: transactions.isRecurring,
    })
    .from(transactions)
    .innerJoin(subcategories, eq(transactions.subcategoryId, subcategories.id))
    .innerJoin(categories, eq(subcategories.categoryId, categories.id))
    .orderBy(transactions.date);

  const header = 'Date;Type;Montant;Catégorie;Sous-catégorie;Note;Récurrent\n';
  const lines = rows.map((r) => {
    const date = format(r.date, 'dd/MM/yyyy', { locale: fr });
    const type = r.type === 'income' ? 'Entrée' : 'Dépense';
    const amount = r.amount.toFixed(2).replace('.', ',');
    const note = (r.note ?? '').replace(/;/g, ',');
    const recurring = r.isRecurring ? 'Oui' : 'Non';
    return `${date};${type};${amount};${r.categoryName};${r.subcategoryName};${note};${recurring}`;
  });

  const csv = header + lines.join('\n');
  const filename = `budget_export_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;
  const path = FileSystem.documentDirectory + filename;

  await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(path, {
      mimeType: 'text/csv',
      dialogTitle: 'Exporter les transactions',
      UTI: 'public.comma-separated-values-text',
    });
  }
}
