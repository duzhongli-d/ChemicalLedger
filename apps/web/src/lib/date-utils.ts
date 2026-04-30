/**
 * Shared date utilities for the QC ledger platform.
 * centralizes date arithmetic to avoid scattered magic numbers like 86400000.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Returns the number of days remaining until the given date string.
 * Positive = future, negative = past, 0 = today.
 */
export function getDaysLeft(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / MS_PER_DAY);
}

/**
 * Returns the appropriate CSS class for expiry status coloring.
 * Designed to be used with the result of getDaysLeft().
 */
export function getExpiryClass(daysLeft: number): string {
  if (daysLeft < 0) return "text-red-600 font-medium";
  if (daysLeft <= 30) return "text-amber-600 font-medium";
  return "text-slate-600";
}