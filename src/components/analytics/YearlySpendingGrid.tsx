// src/components/analytics/YearlySpendingGrid.tsx
import { YearlySpendingCard } from './YearlySpendingCard';
import { YearlySpending } from '@/hooks/useAnalyticsData';
import { ViewMode, TransactionTypeParam } from '@/pages/analytics/urlState';

interface YearlySpendingGridProps {
  yearlyData: YearlySpending[];
  currency: string;
  viewMode: ViewMode;
  transactionType: TransactionTypeParam;
}

export function YearlySpendingGrid({
  yearlyData,
  currency,
  viewMode,
  transactionType,
}: YearlySpendingGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {yearlyData.map((year) => (
        <YearlySpendingCard
          key={year.year}
          year={year.year}
          yearLabel={year.yearLabel}
          totalSpending={year.totalSpending}
          transactionCount={year.transactionCount}
          currency={currency}
          viewMode={viewMode}
          transactionType={transactionType}
        />
      ))}
    </div>
  );
}
