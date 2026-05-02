import { useSettingsStore } from '../store/useSettingsStore';
import { formatCurrency } from '../utils/currency';

export function useCurrency() {
  const { currencyCode, currency } = useSettingsStore();
  return {
    currencyCode,
    symbol: currency.symbol,
    format: (amount: number) => formatCurrency(amount, currencyCode),
  };
}
