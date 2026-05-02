import { create } from 'zustand';
import { db } from '../db/client';
import { transactions, subcategories, categories } from '../db/schema';
import { eq, desc, gte, lte, and } from 'drizzle-orm';
import type { Transaction } from '../db/schema';

interface TransactionWithMeta extends Transaction {
  subcategoryName: string;
  subcategoryIcon: string;
  categoryName: string;
  categoryColor: string;
}

interface TransactionStore {
  transactions: TransactionWithMeta[];
  isLoading: boolean;
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
  loadTransactions: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, tx: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getById: (id: string) => Promise<Transaction | null>;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  isLoading: false,
  selectedMonth: new Date(),

  setSelectedMonth: (date) => {
    set({ selectedMonth: date });
    get().loadTransactions();
  },

  loadTransactions: async () => {
    set({ isLoading: true });
    const month = get().selectedMonth;
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);

    const rows = await db
      .select({
        id: transactions.id,
        subcategoryId: transactions.subcategoryId,
        amount: transactions.amount,
        type: transactions.type,
        date: transactions.date,
        note: transactions.note,
        isRecurring: transactions.isRecurring,
        recurringRuleId: transactions.recurringRuleId,
        createdAt: transactions.createdAt,
        subcategoryName: subcategories.name,
        subcategoryIcon: subcategories.icon,
        categoryName: categories.name,
        categoryColor: categories.color,
      })
      .from(transactions)
      .innerJoin(subcategories, eq(transactions.subcategoryId, subcategories.id))
      .innerJoin(categories, eq(subcategories.categoryId, categories.id))
      .where(and(gte(transactions.date, start), lte(transactions.date, end)))
      .orderBy(desc(transactions.date));

    set({ transactions: rows as TransactionWithMeta[], isLoading: false });
  },

  addTransaction: async (tx) => {
    const { nanoid } = await import('../utils/nanoid');
    const now = new Date();
    await db.insert(transactions).values({
      ...tx,
      id: nanoid(),
      createdAt: now,
    });
    await get().loadTransactions();
  },

  updateTransaction: async (id, tx) => {
    await db.update(transactions).set(tx).where(eq(transactions.id, id));
    await get().loadTransactions();
  },

  deleteTransaction: async (id) => {
    await db.delete(transactions).where(eq(transactions.id, id));
    await get().loadTransactions();
  },

  getById: async (id) => {
    const rows = await db.select().from(transactions).where(eq(transactions.id, id));
    return rows[0] ?? null;
  },
}));
