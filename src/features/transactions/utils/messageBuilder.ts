// src/features/transactions/utils/messageBuilder.ts
import { formatLocalDate } from '@/utils/dates';

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
 * Builds text describing the earliest available exchange rate for a specific currency.
 *
 * @param date - The earliest exchange rate date (LocalDate format: YYYY-MM-DD)
 * @param rate - The exchange rate value
 * @param targetCurrency - The target currency code (e.g., "USD")
 * @param baseCurrency - The base currency code (e.g., "JPY")
 * @returns Formatted text describing the rate, or null if no date provided
 */
export function buildExchangeRateAvailabilityText(
  date: string | null,
  rate: number,
  targetCurrency: string,
  baseCurrency: string,
): string | null {
  if (!date) return null;

  const formattedDate = formatLocalDate(date);
  return `the rate of ${rate.toFixed(4)} ${targetCurrency}/${baseCurrency} from ${formattedDate}`;
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
