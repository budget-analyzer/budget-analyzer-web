// src/pages/TransactionsPage.tsx
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useTransactions } from '@/hooks/useTransactions';
import { useExchangeRatesMap } from '@/hooks/useCurrencies';
import { useTransactionStats } from '@/hooks/useTransactionStats';
import { useTransactionFiltersSync } from '@/hooks/useTransactionFiltersSync';
import { useImportMessageHandler } from '@/hooks/useImportMessageHandler';
import { fadeInVariants, layoutTransition } from '@/lib/animations';
import { TransactionTable } from '@/components/TransactionTable';
import { ErrorBanner } from '@/components/ErrorBanner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TransactionStatsGrid } from '@/components/TransactionStatsGrid';
import { ImportButton } from '@/components/ImportButton';
import { ImportMessageBanner } from '@/components/ImportMessageBanner';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { useMemo, useState, useEffect } from 'react';
import { buildExchangeRateAvailabilityText } from '@/lib/importMessageBuilder';
import { buildMainStatsConfig, buildMonthlyStatsConfig } from '@/lib/transactionStatsConfig';
import { Transaction } from '@/types/transaction';
import { useAppSelector } from '@/store/hooks';

export function TransactionsPage() {
  const { data: transactions, isLoading, error, refetch } = useTransactions();
  const displayCurrency = useAppSelector((state) => state.ui.displayCurrency);

  // Sync URL params with Redux state for transaction filters
  const { handleDateFilterChange, handleSearchChange, hasActiveFilters } =
    useTransactionFiltersSync();

  // Fetch exchange rates and build map for currency conversion
  const {
    exchangeRatesMap,
    earliestExchangeRateDate,
    isLoading: isExchangeRatesLoading,
  } = useExchangeRatesMap();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(
    transactions || [],
  );

  // Update filteredTransactions when transactions change (on load or after import)
  useEffect(() => {
    if (transactions) {
      setFilteredTransactions(transactions);
    }
  }, [transactions]);

  // Memoize the earliest rate text since it only depends on memoized values
  const earliestRateText = useMemo(
    () => buildExchangeRateAvailabilityText(earliestExchangeRateDate, exchangeRatesMap),
    [earliestExchangeRateDate, exchangeRatesMap],
  );

  // Handle import success/error messages with auto-dismiss
  const { importMessage, handleImportSuccess, handleImportError, clearImportMessage } =
    useImportMessageHandler({
      earliestExchangeRateDate,
      earliestRateText,
      hasActiveFilters,
    });

  // Calculate stats from FILTERED transactions (provided by the table)
  const { stats, monthlyAverages } = useTransactionStats({
    transactions: filteredTransactions,
    displayCurrency,
    exchangeRatesMap,
  });

  // Build stat card configurations using utility functions
  const mainStats = useMemo(
    () => buildMainStatsConfig(stats, displayCurrency),
    [stats, displayCurrency],
  );

  const monthlyStats = useMemo(
    () => buildMonthlyStatsConfig(monthlyAverages, displayCurrency),
    [monthlyAverages, displayCurrency],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading transactions..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md">
          <ErrorBanner error={error} onRetry={() => refetch()} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="View and manage transactions"
        action={<ImportButton onSuccess={handleImportSuccess} onError={handleImportError} />}
      />

      <LayoutGroup>
        <AnimatePresence>
          {importMessage && (
            <ImportMessageBanner
              type={importMessage.type}
              message={importMessage.text}
              onClose={clearImportMessage}
            />
          )}
        </AnimatePresence>

        <motion.div layout transition={layoutTransition}>
          <TransactionStatsGrid stats={mainStats} isLoading={isExchangeRatesLoading} />
        </motion.div>

        <motion.div layout transition={layoutTransition}>
          <TransactionStatsGrid stats={monthlyStats} isLoading={isExchangeRatesLoading} />
        </motion.div>

        <motion.div
          layout
          variants={fadeInVariants}
          initial="initial"
          animate="animate"
          transition={layoutTransition}
        >
          <Card>
            <CardContent className="pt-6">
              {transactions && (
                <TransactionTable
                  transactions={transactions}
                  onFilteredRowsChange={setFilteredTransactions}
                  onDateFilterChange={handleDateFilterChange}
                  onSearchChange={handleSearchChange}
                  displayCurrency={displayCurrency}
                  exchangeRatesMap={exchangeRatesMap}
                  isExchangeRatesLoading={isExchangeRatesLoading}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}
