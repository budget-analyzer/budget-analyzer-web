// src/pages/AnalyticsPage.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactions } from '@/hooks/useTransactions';
import { useExchangeRatesMap } from '@/hooks/useCurrencies';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { fadeInVariants, layoutTransition, fadeVariants, fadeTransition } from '@/lib/animations';
import { ErrorBanner } from '@/components/ErrorBanner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PageHeader } from '@/components/PageHeader';
import { MonthlySpendingGrid } from '@/components/analytics/MonthlySpendingGrid';
import { YearSelector } from '@/components/YearSelector';
import { useAppSelector } from '@/store/hooks';
import { useSearchParams } from 'react-router';
import { useCallback, useEffect, useMemo } from 'react';
import { getCurrentYear } from '@/lib/dateUtils';

export function AnalyticsPage() {
  const { data: transactions, isLoading, error, refetch } = useTransactions();
  const displayCurrency = useAppSelector((state) => state.ui.displayCurrency);
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch exchange rates for currency conversion
  const { exchangeRatesMap, isLoading: isExchangeRatesLoading } = useExchangeRatesMap();

  // Get selected year from URL or default to current year
  const currentYear = useMemo(() => getCurrentYear(), []);
  const yearParam = searchParams.get('year');
  const selectedYear = yearParam ? parseInt(yearParam, 10) : currentYear;

  // Process analytics data with memoization
  const { monthlySpending, earliestYear, latestYear } = useAnalyticsData(
    transactions,
    displayCurrency,
    exchangeRatesMap,
    selectedYear,
  );

  // Redirect to current year if selected year is out of bounds
  useEffect(() => {
    if (yearParam && !isNaN(selectedYear)) {
      if (selectedYear < earliestYear || selectedYear > latestYear) {
        const params = new URLSearchParams(searchParams);
        params.set('year', currentYear.toString());
        setSearchParams(params, { replace: true });
      }
    }
  }, [
    yearParam,
    selectedYear,
    earliestYear,
    latestYear,
    currentYear,
    searchParams,
    setSearchParams,
  ]);

  // Handle year change
  const handleYearChange = useCallback(
    (year: number) => {
      const params = new URLSearchParams(searchParams);
      params.set('year', year.toString());
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading analytics..." />
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
        title="Analytics"
        description={`Monthly spending breakdown for ${selectedYear}`}
      />

      <motion.div
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        transition={layoutTransition}
        className="flex justify-end"
      >
        <YearSelector
          selectedYear={selectedYear}
          earliestYear={earliestYear}
          latestYear={latestYear}
          onChange={handleYearChange}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedYear}
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={fadeTransition}
        >
          <MonthlySpendingGrid monthlyData={monthlySpending} currency={displayCurrency} />
        </motion.div>
      </AnimatePresence>

      {isExchangeRatesLoading && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="sm" text="Loading exchange rates..." />
        </div>
      )}
    </div>
  );
}
