// Keypad amount entry: append digits, single decimal point, max 2 cents digits.
export function applyKey(value: string, key: string): string {
  if (key === 'del') return value.slice(0, -1);
  if (key === '.') return value.includes('.') ? value : (value || '0') + '.';
  // digit
  const [, cents] = value.split('.');
  if (cents !== undefined && cents.length >= 2) return value; // ponytail: cap at 2 decimals
  if (value === '0') return key; // no leading zero
  return value + key;
}

// Split into dollars (black) and cents (grey) parts for display.
export function splitAmount(value: string): { dollars: string; cents: string } {
  const v = value || '0';
  const [int, frac] = v.split('.');
  const hasDot = v.includes('.');
  return { dollars: int || '0', cents: hasDot ? '.' + (frac ?? '') : '' };
}
