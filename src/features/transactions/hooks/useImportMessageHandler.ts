// src/features/transactions/hooks/useImportMessageHandler.ts
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Transaction } from '@/types/transaction';
import {
  buildImportSuccessMessage,
  buildExchangeRateAvailabilityText,
} from '@/features/transactions/utils/messageBuilder';
import { ExchangeRateResponse } from '@/types/currency';

interface ImportMessage {
  type: 'success' | 'error' | 'warning';
  text: string;
}

interface UseImportMessageHandlerParams {
  exchangeRatesData: ExchangeRateResponse[];
  displayCurrency: string;
  hasActiveFilters: () => boolean;
}

interface UseImportMessageHandlerReturn {
  importMessage: ImportMessage | null;
  handleImportSuccess: (count: number, importedTransactions: Transaction[]) => void;
  handleImportError: (error: { message?: string }) => void;
  clearImportMessage: () => void;
}

/**
 * Custom hook to handle import success/error messages with auto-dismiss functionality
 *
 * @param params Configuration including exchange rates data, display currency, and filter checker
 * @returns Object with import message state and handlers
 */
export function useImportMessageHandler({
  exchangeRatesData,
  displayCurrency,
  hasActiveFilters,
}: UseImportMessageHandlerParams): UseImportMessageHandlerReturn {
  const [importMessage, setImportMessage] = useState<ImportMessage | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize a map of currency pairs to their earliest exchange rate
  // Key format: "TARGETCURRENCY_BASECURRENCY" (e.g., "USD_JPY")
  const earliestRatesByCurrency = useMemo(() => {
    const map = new Map<string, ExchangeRateResponse>();

    exchangeRatesData.forEach((rate) => {
      const key = `${rate.targetCurrency}_${rate.baseCurrency}`;
      const existing = map.get(key);

      // Keep the rate with the earliest date
      if (!existing || rate.date < existing.date) {
        map.set(key, rate);
      }
    });

    return map;
  }, [exchangeRatesData]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const clearImportMessage = useCallback(() => {
    setImportMessage(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleImportSuccess = useCallback(
    (count: number, importedTransactions: Transaction[]) => {
      if (importedTransactions.length === 0) {
        // No transactions, show simple success message
        const message = buildImportSuccessMessage({
          count,
          hasOldTransactions: false,
          earliestRateText: null,
          filtersActive: hasActiveFilters(),
        });
        setImportMessage(message);
        return;
      }

      // Get the currency from imported transactions (all transactions in an import have the same currency)
      const importCurrency = importedTransactions[0].currencyIsoCode;

      // Find the earliest transaction date
      const earliestTransaction = importedTransactions.reduce((earliest, current) =>
        current.date < earliest.date ? current : earliest,
      );

      // Look up the earliest exchange rate for this currency pair (O(1) lookup)
      const currencyPairKey = `${displayCurrency}_${importCurrency}`;
      const earliestRate = earliestRatesByCurrency.get(currencyPairKey);

      let hasOldTransactions = false;
      let earliestRateText: string | null = null;

      if (earliestRate) {
        // Check if transaction is older than available rates for this currency
        hasOldTransactions = earliestTransaction.date < earliestRate.date;

        if (hasOldTransactions) {
          earliestRateText = buildExchangeRateAvailabilityText(
            earliestRate.date,
            earliestRate.rate,
            earliestRate.targetCurrency,
            earliestRate.baseCurrency,
          );
        }
      }

      // Build the success message based on conditions
      const message = buildImportSuccessMessage({
        count,
        hasOldTransactions,
        earliestRateText,
        filtersActive: hasActiveFilters(),
      });

      setImportMessage(message);

      // Auto-dismiss success messages (but not warnings)
      if (message.type === 'success') {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        // Set new timeout
        timeoutRef.current = setTimeout(() => {
          setImportMessage(null);
          timeoutRef.current = null;
        }, 5000);
      }
    },
    [earliestRatesByCurrency, displayCurrency, hasActiveFilters],
  );

  const handleImportError = useCallback((error: { message?: string }) => {
    setImportMessage({
      type: 'error',
      text: error.message || 'Failed to import transactions',
    });
  }, []);

  return {
    importMessage,
    handleImportSuccess,
    handleImportError,
    clearImportMessage,
  };
}
