import {
  addDays, addWeeks, addMonths, addYears,
  isBefore, isAfter, startOfDay,
} from 'date-fns';
import { db } from '../db/client';
import { recurringRules, transactions } from '../db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from './nanoid';

export async function generateRecurringTransactions() {
  const rules = await db.select().from(recurringRules).where(eq(recurringRules.isActive, true));
  const today = startOfDay(new Date());

  for (const rule of rules) {
    const since = rule.lastGeneratedAt
      ? startOfDay(rule.lastGeneratedAt)
      : startOfDay(rule.startDate);

    // Collect all dates that need a transaction
    const dates = getDueDates(rule.frequency, since, today, rule.startDate, rule.endDate);
    if (dates.length === 0) continue;

    const now = new Date();
    const rows = dates.map((date) => ({
      id: nanoid(),
      subcategoryId: rule.subcategoryId,
      amount: rule.amount,
      type: rule.type,
      date,
      note: rule.note ?? null,
      isRecurring: true,
      recurringRuleId: rule.id,
      createdAt: now,
    }));

    for (const row of rows) {
      await db.insert(transactions).values(row);
    }

    // Update lastGeneratedAt to today
    await db
      .update(recurringRules)
      .set({ lastGeneratedAt: today })
      .where(eq(recurringRules.id, rule.id));
  }
}

function getDueDates(
  frequency: string,
  since: Date,
  today: Date,
  startDate: Date,
  endDate: Date | null,
): Date[] {
  const dates: Date[] = [];
  // Start from the day after last generation (or start date if never generated)
  let cursor = nextOccurrence(frequency, since, startDate);

  while (!isAfter(cursor, today)) {
    if (endDate && isAfter(cursor, endDate)) break;
    if (!isBefore(cursor, startOfDay(startDate))) {
      dates.push(new Date(cursor));
    }
    cursor = nextOccurrence(frequency, cursor, startDate);
  }

  return dates;
}

function nextOccurrence(frequency: string, from: Date, startDate: Date): Date {
  switch (frequency) {
    case 'daily':   return addDays(from, 1);
    case 'weekly':  return addWeeks(from, 1);
    case 'monthly': return addMonths(from, 1);
    case 'yearly':  return addYears(from, 1);
    default:        return addMonths(from, 1);
  }
}

export function getNextOccurrence(rule: { frequency: string; lastGeneratedAt: Date | null; startDate: Date }): Date {
  const base = rule.lastGeneratedAt ?? rule.startDate;
  return nextOccurrence(rule.frequency, startOfDay(base), rule.startDate);
}

export function frequencyLabel(frequency: string): string {
  switch (frequency) {
    case 'daily':   return 'Quotidien';
    case 'weekly':  return 'Hebdomadaire';
    case 'monthly': return 'Mensuel';
    case 'yearly':  return 'Annuel';
    default:        return frequency;
  }
}
