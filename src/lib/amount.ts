/**
 * Pure helpers for keypad-driven money entry.
 *
 * The amount is held as a raw string (e.g. `"100.25"`, `"0."`, `""`) so the UI
 * can render exactly what the user typed without float rounding artifacts.
 * Kept free of React/UI imports so it stays unit-testable — see `amount.test.ts`.
 */

/** Sentinel key returned by the backspace button. */
export const DELETE_KEY = 'del';

/** Maximum number of digits allowed after the decimal point. */
const MAX_CENTS_DIGITS = 2;

/**
 * Apply a single keypad press to the current amount string.
 *
 * Rules:
 * - `DELETE_KEY` removes the last character.
 * - `"."` is inserted at most once; on an empty value it yields `"0."`.
 * - Digits are capped at {@link MAX_CENTS_DIGITS} after the decimal point.
 * - A leading `"0"` is replaced by the typed digit (no `"05"`).
 *
 * @param value - Current raw amount string.
 * @param key - A digit (`"0"`–`"9"`), `"."`, or {@link DELETE_KEY}.
 * @returns The next raw amount string.
 */
export function applyKey(value: string, key: string): string {
  if (key === DELETE_KEY) return value.slice(0, -1);

  if (key === '.') {
    return value.includes('.') ? value : (value || '0') + '.';
  }

  // key is a digit from here on
  const [, centsDigits] = value.split('.');
  if (centsDigits !== undefined && centsDigits.length >= MAX_CENTS_DIGITS) {
    return value;
  }
  if (value === '0') return key; // avoid a leading zero like "05"
  return value + key;
}

/**
 * Split a raw amount string into its display parts.
 *
 * The dollars part is rendered in the foreground colour and the cents part
 * (including the dot) in a muted colour. An empty value renders as `"0"`.
 *
 * @param value - Raw amount string.
 * @returns `{ dollars, cents }` — e.g. `"100.25"` → `{ dollars: "100", cents: ".25" }`.
 */
export function splitAmount(value: string): { dollars: string; cents: string } {
  const safeValue = value || '0';
  const [integerPart, fractionPart] = safeValue.split('.');
  const hasDecimalPoint = safeValue.includes('.');
  return {
    dollars: integerPart || '0',
    cents: hasDecimalPoint ? '.' + (fractionPart ?? '') : '',
  };
}
