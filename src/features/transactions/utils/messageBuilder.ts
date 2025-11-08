// src/features/transactions/utils/messageBuilder.ts
import { formatLocalDate } from '@/utils/dates';
import { ExchangeRateResponse } from '@/types/currency';

export interface ImportSuccessMessageParams {
  count: number;
  hasOldTransactions: boolean;
  earliestRateText: string | null;
  filtersActive: boolean;
}

export interface ImportSuccessMessage {
  type: 'success' | 'warning';
  text: string;
}

/**
 * Builds text describing the earliest available exchange rate.
 *
 * @param date - The earliest exchange rate date (LocalDate format: YYYY-MM-DD)
 * @param ratesMap - Nested map: date -> (targetCurrency -> ExchangeRateResponse)
 * @returns Formatted text describing the rate, or null if no date provided
 */
export function buildExchangeRateAvailabilityText(
  date: string | null,
  ratesMap: Map<string, Map<string, ExchangeRateResponse>>,
): string | null {
  if (!date) return null;

  const formattedDate = formatLocalDate(date);

  // Get the currency map for this date
  const currencyMap = ratesMap.get(date);

  if (!currencyMap || currencyMap.size === 0) {
    return `the earliest available rate from ${formattedDate}`;
  }

  // Get the first currency rate as an example (they all have the same date)
  const firstRate = currencyMap.values().next().value as ExchangeRateResponse;

  return `the rate of ${firstRate.rate.toFixed(4)} ${firstRate.targetCurrency}/${firstRate.baseCurrency} from ${formattedDate}`;
}

/**
 * Builds an appropriate success message for transaction imports based on various conditions.
 *
 * @param params - Parameters for building the message
 * @returns An object containing the message type and text
 */
export function buildImportSuccessMessage({
  count,
  hasOldTransactions,
  earliestRateText,
  filtersActive,
}: ImportSuccessMessageParams): ImportSuccessMessage {
  const baseMessage = `Successfully imported ${count} transaction(s)`;

  // Warning message for old transactions (takes precedence)
  if (hasOldTransactions && earliestRateText) {
    const filterWarning = filtersActive
      ? '  Some may be hidden by your current filters, [Clear filters] to see all.'
      : '';

    return {
      type: 'warning',
      text: `${baseMessage}.${filterWarning}\nSome transactions are older than our earliest exchange rate. Currency conversions will use ${earliestRateText}.`,
    };
  }

  // Normal success message
  const filterWarning = filtersActive
    ? '  Some may be hidden by your current filters, [Clear filters] to see all.'
    : '';

  return {
    type: 'success',
    text: `${baseMessage}.${filterWarning}`,
  };
}
