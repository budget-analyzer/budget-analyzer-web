// src/lib/currency.ts
import { ExchangeRateResponse } from '@/types/currency';

/**
 * Build a Map of date -> exchange rate response for fast O(1) lookups
 * @param rates Array of exchange rate responses from API
 * @returns Map with date string (YYYY-MM-DD) as key and full ExchangeRateResponse as value
 */
export function buildExchangeRateMap(
  rates: ExchangeRateResponse[],
): Map<string, ExchangeRateResponse> {
  const map = new Map<string, ExchangeRateResponse>();
  rates.forEach((rate) => {
    map.set(rate.date, rate);
  });
  return map;
}

/**
 * Find the nearest available exchange rate for a given date
 * Falls back to closest available rate if exact date not found.
 *
 * In practice the API will always return a rate for every date
 * it has in a range.  So transactions prior to the range of dates
 * for which we have an exchange rate will always use the earliest
 * rate we have, which is 1981-01-02,20.6611 for THB.  And for
 * transactions that occur after the range of rates for which we
 * have data, we will always use the most recent rate we have.
 *
 * @param date Transaction date (YYYY-MM-DD)
 * @param ratesMap Map of dates to exchange rate responses
 * @returns Exchange rate response for nearest available date, or null if no rates available
 */
export function findNearestExchangeRate(
  date: string,
  ratesMap: Map<string, ExchangeRateResponse>,
): ExchangeRateResponse | null {
  // First try exact match
  const exactMatch = ratesMap.get(date);
  if (exactMatch) {
    return exactMatch;
  }

  // No exact match - find nearest date
  const allDates = Array.from(ratesMap.keys()).sort();
  if (allDates.length === 0) {
    return null;
  }

  const targetDate = new Date(date);
  const targetTime = targetDate.getTime();

  // Find the closest date by comparing absolute time differences
  let closestDate = allDates[0];
  let minDifference = Math.abs(new Date(closestDate).getTime() - targetTime);

  for (const availableDate of allDates) {
    const difference = Math.abs(new Date(availableDate).getTime() - targetTime);
    if (difference < minDifference) {
      minDifference = difference;
      closestDate = availableDate;
    }
  }

  return ratesMap.get(closestDate) || null;
}

/**
 * Convert an amount from one currency to another using exchange rate
 * If no exact rate exists for the date, uses the nearest available rate
 *
 * @param amount Amount in source currency
 * @param date Transaction date (YYYY-MM-DD)
 * @param sourceCurrency Source currency code (e.g., 'THB')
 * @param targetCurrency Target currency code (e.g., 'USD')
 * @param ratesMap Map of dates to exchange rate responses
 * @returns Converted amount in target currency
 */
export function convertCurrency(
  amount: number,
  date: string,
  sourceCurrency: string,
  targetCurrency: string,
  ratesMap: Map<string, ExchangeRateResponse>,
): number {
  // No conversion needed if currencies are the same
  if (sourceCurrency === targetCurrency) {
    return amount;
  }

  // Get the exchange rate response for this date (or nearest available)
  const exchangeRateResponse = findNearestExchangeRate(date, ratesMap);

  // If no rate found at all, return original amount
  if (!exchangeRateResponse) {
    console.warn(
      `No exchange rates available in map for ${date}, ${sourceCurrency} -> ${targetCurrency}`,
    );
    return amount;
  }

  // Log if we're using a fallback rate
  if (exchangeRateResponse.date !== date) {
    console.info(
      `Using nearest exchange rate from ${exchangeRateResponse.date} for transaction dated ${date}`,
    );
  }

  const rate = exchangeRateResponse.rate;

  // Apply conversion
  // Note: Exchange rates are stored as baseCurrency (USD) -> targetCurrency
  // So we need to handle conversion direction appropriately
  if (sourceCurrency === 'USD') {
    // USD -> targetCurrency (e.g., USD -> THB)
    return amount * rate;
  } else {
    // targetCurrency -> USD (e.g., THB -> USD)
    return amount / rate;
  }
}
