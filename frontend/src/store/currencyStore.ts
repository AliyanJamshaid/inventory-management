import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Currency } from '@/types/currency';
import { convertCurrency } from '@/lib/currencyUtils';

interface CurrencyState {
  // Selected display currency (user preference)
  selectedDisplayCurrency: string | null;

  // Currencies cache
  baseCurrency: Currency | null;
  activeCurrencies: Currency[];

  // Actions
  setSelectedCurrency: (code: string) => void;
  setBaseCurrency: (currency: Currency | null) => void;
  setActiveCurrencies: (currencies: Currency[]) => void;
  getCurrencyByCode: (code: string) => Currency | undefined;
  convertAmount: (amount: number, fromCode: string, toCode?: string) => number;
  resetCurrency: () => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      selectedDisplayCurrency: null,
      baseCurrency: null,
      activeCurrencies: [],

      setSelectedCurrency: (code: string) => {
        set({ selectedDisplayCurrency: code });
      },

      setBaseCurrency: (currency: Currency | null) => {
        set({ baseCurrency: currency });
        // If no display currency is set, use base currency
        if (!get().selectedDisplayCurrency && currency) {
          set({ selectedDisplayCurrency: currency.code });
        }
      },

      setActiveCurrencies: (currencies: Currency[]) => {
        set({ activeCurrencies: currencies });
      },

      getCurrencyByCode: (code: string) => {
        const state = get();
        return state.activeCurrencies.find((c) => c.code === code);
      },

      convertAmount: (amount: number, fromCode: string, toCode?: string) => {
        const state = get();

        // If no target currency specified, use selected display currency
        const targetCode = toCode || state.selectedDisplayCurrency;

        // If same currency or no target, return original amount
        if (!targetCode || fromCode === targetCode) {
          return amount;
        }

        // Get currencies
        const fromCurrency = state.getCurrencyByCode(fromCode);
        const toCurrency = state.getCurrencyByCode(targetCode);

        if (!fromCurrency || !toCurrency) {
          console.warn(
            `Currency not found: ${!fromCurrency ? fromCode : targetCode}`
          );
          return amount;
        }

        // Convert using exchange rates
        return convertCurrency(
          amount,
          fromCurrency.exchangeRate,
          toCurrency.exchangeRate,
          toCurrency.decimalPlaces
        );
      },

      resetCurrency: () => {
        set({
          selectedDisplayCurrency: null,
          baseCurrency: null,
          activeCurrencies: [],
        });
      },
    }),
    {
      name: 'currency-storage', // localStorage key
      partialize: (state) => ({
        // Only persist selected currency, not the full currency data
        selectedDisplayCurrency: state.selectedDisplayCurrency,
      }),
    }
  )
);
