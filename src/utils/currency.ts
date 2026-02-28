// Currency formatting utilities for Indonesian Rupiah (IDR)

/**
 * Format number to Indonesian Rupiah currency
 * @param amount - The amount to format
 * @param withSymbol - Whether to include "Rp" symbol
 * @returns Formatted currency string
 */
export function formatRupiah(amount: number, withSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return withSymbol ? `Rp ${formatted}` : formatted;
}

/**
 * Parse Indonesian Rupiah string to number
 * @param value - The string to parse
 * @returns The parsed number
 */
export function parseRupiah(value: string): number {
  // Remove "Rp", spaces, and dots (thousand separator)
  const cleaned = value.replace(/Rp\s?/g, '').replace(/\./g, '').replace(/,/g, '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format number with thousand separators (without currency symbol)
 * @param value - The number to format
 * @returns Formatted string with thousand separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

/**
 * Parse formatted number string to number
 * @param value - The string to parse
 * @returns The parsed number
 */
export function parseFormattedNumber(value: string): number {
  const cleaned = value.replace(/\./g, '').replace(/,/g, '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
