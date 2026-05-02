import { db } from './client';
import { categories, subcategories } from './schema';
import { eq } from 'drizzle-orm';

const DEFAULT_CATEGORIES = [
  {
    id: 'cat-food',
    name: 'Alimentation',
    icon: 'cart',
    color: '#EF5350',
    subs: [
      { id: 'sub-groceries', name: 'Courses', icon: 'shopping' },
      { id: 'sub-restaurant', name: 'Restaurant', icon: 'silverware-fork-knife' },
      { id: 'sub-cafe', name: 'Café', icon: 'coffee' },
    ],
  },
  {
    id: 'cat-transport',
    name: 'Transport',
    icon: 'car',
    color: '#FFA726',
    subs: [
      { id: 'sub-fuel', name: 'Carburant', icon: 'gas-station' },
      { id: 'sub-transit', name: 'Transport en commun', icon: 'bus' },
      { id: 'sub-taxi', name: 'Taxi / VTC', icon: 'taxi' },
    ],
  },
  {
    id: 'cat-home',
    name: 'Logement',
    icon: 'home',
    color: '#5C6BC0',
    subs: [
      { id: 'sub-rent', name: 'Loyer', icon: 'home-city' },
      { id: 'sub-utilities', name: 'Charges', icon: 'lightning-bolt' },
      { id: 'sub-internet', name: 'Internet / Téléphone', icon: 'wifi' },
    ],
  },
  {
    id: 'cat-leisure',
    name: 'Loisirs',
    icon: 'gamepad-variant',
    color: '#AB47BC',
    subs: [
      { id: 'sub-outings', name: 'Sorties', icon: 'party-popper' },
      { id: 'sub-sport', name: 'Sport', icon: 'dumbbell' },
      { id: 'sub-streaming', name: 'Streaming', icon: 'television-play' },
    ],
  },
  {
    id: 'cat-health',
    name: 'Santé',
    icon: 'heart-pulse',
    color: '#26C6DA',
    subs: [
      { id: 'sub-doctor', name: 'Médecin', icon: 'stethoscope' },
      { id: 'sub-pharmacy', name: 'Pharmacie', icon: 'pill' },
      { id: 'sub-gym', name: 'Salle de sport', icon: 'weight-lifter' },
    ],
  },
  {
    id: 'cat-income',
    name: 'Revenus',
    icon: 'cash-plus',
    color: '#66BB6A',
    subs: [
      { id: 'sub-salary', name: 'Salaire', icon: 'briefcase' },
      { id: 'sub-freelance', name: 'Freelance', icon: 'laptop' },
      { id: 'sub-other-income', name: 'Autre revenu', icon: 'plus-circle' },
    ],
  },
];

export async function seedDefaultCategories() {
  const existing = await db.select().from(categories).limit(1);
  if (existing.length > 0) return;

  const now = new Date();

  for (const cat of DEFAULT_CATEGORIES) {
    await db.insert(categories).values({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      createdAt: now,
    });

    for (const sub of cat.subs) {
      await db.insert(subcategories).values({
        id: sub.id,
        categoryId: cat.id,
        name: sub.name,
        icon: sub.icon,
        createdAt: now,
      });
    }
  }
}
