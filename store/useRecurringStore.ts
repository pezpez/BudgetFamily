import { create } from 'zustand';
import { db } from '../db/client';
import { recurringRules, subcategories, categories } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { RecurringRule } from '../db/schema';
import { nanoid } from '../utils/nanoid';

interface RecurringRuleWithMeta extends RecurringRule {
  subcategoryName: string;
  subcategoryIcon: string;
  categoryName: string;
  categoryColor: string;
}

interface RecurringStore {
  rules: RecurringRuleWithMeta[];
  isLoading: boolean;
  loadRules: () => Promise<void>;
  addRule: (rule: Omit<RecurringRule, 'id' | 'lastGeneratedAt'>) => Promise<void>;
  updateRule: (id: string, rule: Partial<Omit<RecurringRule, 'id' | 'lastGeneratedAt'>>) => Promise<void>;
  toggleRule: (id: string, isActive: boolean) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  updateLastGenerated: (id: string, date: Date) => Promise<void>;
  getById: (id: string) => Promise<RecurringRule | null>;
}

export const useRecurringStore = create<RecurringStore>((set, get) => ({
  rules: [],
  isLoading: false,

  loadRules: async () => {
    set({ isLoading: true });
    const rows = await db
      .select({
        id: recurringRules.id,
        subcategoryId: recurringRules.subcategoryId,
        amount: recurringRules.amount,
        type: recurringRules.type,
        frequency: recurringRules.frequency,
        dayOfMonth: recurringRules.dayOfMonth,
        dayOfWeek: recurringRules.dayOfWeek,
        startDate: recurringRules.startDate,
        endDate: recurringRules.endDate,
        isActive: recurringRules.isActive,
        note: recurringRules.note,
        lastGeneratedAt: recurringRules.lastGeneratedAt,
        subcategoryName: subcategories.name,
        subcategoryIcon: subcategories.icon,
        categoryName: categories.name,
        categoryColor: categories.color,
      })
      .from(recurringRules)
      .innerJoin(subcategories, eq(recurringRules.subcategoryId, subcategories.id))
      .innerJoin(categories, eq(subcategories.categoryId, categories.id))
      .orderBy(recurringRules.startDate);

    set({ rules: rows as RecurringRuleWithMeta[], isLoading: false });
  },

  addRule: async (rule) => {
    await db.insert(recurringRules).values({ ...rule, id: nanoid(), lastGeneratedAt: null });
    await get().loadRules();
  },

  toggleRule: async (id, isActive) => {
    await db.update(recurringRules).set({ isActive }).where(eq(recurringRules.id, id));
    await get().loadRules();
  },

  updateRule: async (id, rule) => {
    await db.update(recurringRules).set(rule).where(eq(recurringRules.id, id));
    await get().loadRules();
  },

  deleteRule: async (id) => {
    await db.delete(recurringRules).where(eq(recurringRules.id, id));
    await get().loadRules();
  },

  updateLastGenerated: async (id, date) => {
    await db.update(recurringRules).set({ lastGeneratedAt: date }).where(eq(recurringRules.id, id));
  },

  getById: async (id) => {
    const rows = await db.select().from(recurringRules).where(eq(recurringRules.id, id));
    return rows[0] ?? null;
  },
}));
