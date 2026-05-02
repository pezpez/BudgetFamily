import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull().default('shape'),
  color: text('color').notNull().default('#5C6BC0'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const subcategories = sqliteTable('subcategories', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  icon: text('icon').notNull().default('tag'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const recurringRules = sqliteTable('recurring_rules', {
  id: text('id').primaryKey(),
  subcategoryId: text('subcategory_id').notNull().references(() => subcategories.id),
  amount: real('amount').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  frequency: text('frequency', { enum: ['daily', 'weekly', 'monthly', 'yearly'] }).notNull(),
  dayOfMonth: integer('day_of_month'),
  dayOfWeek: integer('day_of_week'),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  note: text('note'),
  lastGeneratedAt: integer('last_generated_at', { mode: 'timestamp' }),
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  subcategoryId: text('subcategory_id').notNull().references(() => subcategories.id),
  amount: real('amount').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  note: text('note'),
  isRecurring: integer('is_recurring', { mode: 'boolean' }).notNull().default(false),
  recurringRuleId: text('recurring_rule_id').references(() => recurringRules.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Subcategory = typeof subcategories.$inferSelect;
export type NewSubcategory = typeof subcategories.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type RecurringRule = typeof recurringRules.$inferSelect;
export type NewRecurringRule = typeof recurringRules.$inferInsert;
