import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Currency {
  code: string;
  symbol: string;
  label: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$',   label: 'Dollar américain ($)' },
  { code: 'EUR', symbol: '€',   label: 'Euro (€)' },
  { code: 'GBP', symbol: '£',   label: 'Livre sterling (£)' },
  { code: 'CAD', symbol: 'CA$', label: 'Dollar canadien (CA$)' },
  { code: 'CHF', symbol: 'CHF', label: 'Franc suisse (CHF)' },
  { code: 'JPY', symbol: '¥',   label: 'Yen japonais (¥)' },
];

const STORAGE_KEY = '@budgetfamily_currency';

interface SettingsStore {
  currencyCode: string;
  currency: Currency;
  loadSettings: () => Promise<void>;
  setCurrency: (code: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  currencyCode: 'USD',
  currency: CURRENCIES[0],

  loadSettings: async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const found = CURRENCIES.find((c) => c.code === stored);
      if (found) set({ currencyCode: found.code, currency: found });
    }
  },

  setCurrency: async (code) => {
    const found = CURRENCIES.find((c) => c.code === code);
    if (!found) return;
    await AsyncStorage.setItem(STORAGE_KEY, code);
    set({ currencyCode: code, currency: found });
  },
}));
