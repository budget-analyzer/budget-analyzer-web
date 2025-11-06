// src/lib/importMessageBuilder.ts

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
      ? ' Some may be hidden by your current filters. [Clear filters] to see all.'
      : '';

    return {
      type: 'warning',
      text: `${baseMessage}.${filterWarning}\nSome transactions are older than our earliest exchange rate. Currency conversions will use ${earliestRateText}.`,
    };
  }

  // Normal success message
  const filterWarning = filtersActive
    ? ' Some may be hidden by your current filters. [Clear filters] to see all.'
    : '';

  return {
    type: 'success',
    text: `${baseMessage}.${filterWarning}`,
  };
}
