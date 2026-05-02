import {
  startOfMonth, endOfMonth, startOfQuarter, endOfQuarter,
  startOfYear, endOfYear, subMonths, format, eachMonthOfInterval,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { db } from '../db/client';
import { transactions, subcategories, categories } from '../db/schema';
import { and, gte, lte, eq } from 'drizzle-orm';

export type Period = 'month' | 'quarter' | 'year';

export interface CategorySlice {
  name: string;
  color: string;
  icon: string;
  total: number;
  percentage: number;
}

export interface MonthBar {
  label: string;
  income: number;
  expense: number;
}

export interface ReportData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categorySlices: CategorySlice[];
  monthBars: MonthBar[];
}

function periodRange(period: Period, ref: Date): { start: Date; end: Date } {
  switch (period) {
    case 'month':   return { start: startOfMonth(ref), end: endOfMonth(ref) };
    case 'quarter': return { start: startOfQuarter(ref), end: endOfQuarter(ref) };
    case 'year':    return { start: startOfYear(ref), end: endOfYear(ref) };
  }
}

export async function fetchReportData(period: Period, ref: Date): Promise<ReportData> {
  const { start, end } = periodRange(period, ref);

  const rows = await db
    .select({
      amount: transactions.amount,
      type: transactions.type,
      date: transactions.date,
      categoryName: categories.name,
      categoryColor: categories.color,
      categoryIcon: subcategories.icon,
    })
    .from(transactions)
    .innerJoin(subcategories, eq(transactions.subcategoryId, subcategories.id))
    .innerJoin(categories, eq(subcategories.categoryId, categories.id))
    .where(and(gte(transactions.date, start), lte(transactions.date, end)));

  const totalIncome = rows.filter((r) => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const totalExpense = rows.filter((r) => r.type === 'expense').reduce((s, r) => s + r.amount, 0);

  // Category breakdown (expenses only)
  const catMap: Record<string, { name: string; color: string; icon: string; total: number }> = {};
  for (const r of rows.filter((r) => r.type === 'expense')) {
    if (!catMap[r.categoryName]) {
      catMap[r.categoryName] = { name: r.categoryName, color: r.categoryColor, icon: r.categoryIcon, total: 0 };
    }
    catMap[r.categoryName].total += r.amount;
  }
  const categorySlices: CategorySlice[] = Object.values(catMap)
    .sort((a, b) => b.total - a.total)
    .map((c) => ({
      ...c,
      percentage: totalExpense > 0 ? (c.total / totalExpense) * 100 : 0,
    }));

  // Monthly bars — last 6 months regardless of period
  const monthBars = await buildMonthBars(ref);

  return { totalIncome, totalExpense, balance: totalIncome - totalExpense, categorySlices, monthBars };
}

async function buildMonthBars(ref: Date): Promise<MonthBar[]> {
  const months = eachMonthOfInterval({
    start: subMonths(startOfMonth(ref), 5),
    end: startOfMonth(ref),
  });

  const bars: MonthBar[] = [];
  for (const m of months) {
    const start = startOfMonth(m);
    const end = endOfMonth(m);
    const rows = await db
      .select({ amount: transactions.amount, type: transactions.type })
      .from(transactions)
      .where(and(gte(transactions.date, start), lte(transactions.date, end)));

    bars.push({
      label: format(m, 'MMM', { locale: fr }),
      income: rows.filter((r) => r.type === 'income').reduce((s, r) => s + r.amount, 0),
      expense: rows.filter((r) => r.type === 'expense').reduce((s, r) => s + r.amount, 0),
    });
  }
  return bars;
}
