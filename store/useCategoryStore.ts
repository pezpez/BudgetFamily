import { create } from 'zustand';
import { db } from '../db/client';
import { categories, subcategories } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { Category, Subcategory } from '../db/schema';

interface CategoryWithSubs extends Category {
  subcategories: Subcategory[];
}

interface CategoryStore {
  categories: CategoryWithSubs[];
  isLoading: boolean;
  loadCategories: () => Promise<void>;
  addCategory: (cat: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubcategory: (sub: Omit<Subcategory, 'id' | 'createdAt'>) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  isLoading: false,

  loadCategories: async () => {
    set({ isLoading: true });
    const cats = await db.select().from(categories);
    const subs = await db.select().from(subcategories);

    const result: CategoryWithSubs[] = cats.map((cat) => ({
      ...cat,
      subcategories: subs.filter((s) => s.categoryId === cat.id),
    }));

    set({ categories: result, isLoading: false });
  },

  addCategory: async (cat) => {
    const { nanoid } = await import('../utils/nanoid');
    await db.insert(categories).values({ ...cat, id: nanoid(), createdAt: new Date() });
    await get().loadCategories();
  },

  deleteCategory: async (id) => {
    await db.delete(categories).where(eq(categories.id, id));
    await get().loadCategories();
  },

  addSubcategory: async (sub) => {
    const { nanoid } = await import('../utils/nanoid');
    await db.insert(subcategories).values({ ...sub, id: nanoid(), createdAt: new Date() });
    await get().loadCategories();
  },

  deleteSubcategory: async (id) => {
    await db.delete(subcategories).where(eq(subcategories.id, id));
    await get().loadCategories();
  },
}));
