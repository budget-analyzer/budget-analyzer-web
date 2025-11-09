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
 * @param params Configuration including exchange rates data and filter checker
 * @returns Object with import message state and handlers
 */
export function useImportMessageHandler({
  exchangeRatesData,
  hasActiveFilters,
}: UseImportMessageHandlerParams): UseImportMessageHandlerReturn {
  const [importMessage, setImportMessage] = useState<ImportMessage | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize the earliest exchange rate date across all currencies
  const earliestExchangeRateDate = useMemo(() => {
    if (exchangeRatesData.length === 0) return null;

    // Find the earliest date across all rates
    const earliestDate = exchangeRatesData.reduce(
      (earliest, rate) => {
        return !earliest || rate.date < earliest ? rate.date : earliest;
      },
      null as string | null,
    );

    return earliestDate;
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

      // Find the earliest transaction date
      const earliestTransaction = importedTransactions.reduce((earliest, current) =>
        current.date < earliest.date ? current : earliest,
      );

      // Check if any transactions are older than our earliest exchange rate
      let hasOldTransactions = false;
      let earliestRateText: string | null = null;

      if (earliestExchangeRateDate) {
        hasOldTransactions = earliestTransaction.date < earliestExchangeRateDate;

        if (hasOldTransactions) {
          earliestRateText = buildExchangeRateAvailabilityText();
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
    [earliestExchangeRateDate, hasActiveFilters],
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
