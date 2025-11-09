// src/utils/errorMessages.ts

/**
 * Maps 422 Unprocessable Entity error codes to user-friendly messages.
 *
 * Error codes are only present on 422 responses (validation/business logic errors).
 * Other HTTP status codes (401, 404, 500, etc.) use the message from the API response directly.
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Transaction import errors
  CSV_FORMAT_NOT_SUPPORTED: 'This CSV format is not supported.',
  CSV_PARSING_ERROR: 'Unable to parse the CSV file. Please review the formatting and try again.',
  TRANSACTION_DATE_TOO_OLD: 'Transaction dates before the year 2000 are not supported.',
  TRANSACTION_DATE_TOO_FAR_IN_FUTURE: 'Transaction dates in the future are not supported.',

  // Currency errors
  INVALID_PROVIDER_SERIES_ID: 'The requested currency series id is invalid.',
  DUPLICATE_CURRENCY_CODE: 'The currency code or series id is already taken.',
  INVALID_ISO_CODE: 'Invalid ISO currency code. Please enter a valid 3-letter ISO 4217 code.',
  NO_EXCHANGE_RATE_DATA_AVAILABLE: 'No exchange rate data is available for this currency.',
  START_DATE_OUT_OF_RANGE: 'The start date is outside the available data range for this provider.',
};

/**
 * Gets a user-friendly error message for a given error code.
 *
 * @param code - The error code from a 422 API response
 * @param fallback - Optional fallback message (defaults to API's technical message or generic error)
 * @returns User-friendly error message
 */
export function getErrorMessage(code: string | undefined, fallback?: string): string {
  if (!code) {
    return fallback || 'An unexpected error occurred. Please try again.';
  }

  return ERROR_MESSAGES[code] || fallback || 'An unexpected error occurred. Please try again.';
}

/**
 * Formats field-level validation errors for display.
 *
 * @param fieldErrors - Array of field errors from API response
 * @returns Formatted error message combining all field errors
 */
export function formatFieldErrors(
  fieldErrors: Array<{ field: string; message: string }> | undefined,
): string | undefined {
  if (!fieldErrors || fieldErrors.length === 0) {
    return undefined;
  }

  if (fieldErrors.length === 1) {
    return fieldErrors[0].message;
  }

  return fieldErrors.map((err) => `${err.field}: ${err.message}`).join(', ');
}
