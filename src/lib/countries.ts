/**
 * Static country list for the "Select your country" screen.
 *
 * Flags are plain Unicode emoji (no image assets). `dialCode` feeds the phone
 * screen's prefix. This is a small curated subset — extend as needed.
 */
export interface Country {
  /** ISO 3166-1 alpha-2 code, used as the stable key. */
  code: string;
  /** Display name. */
  name: string;
  /** Flag emoji. */
  flag: string;
  /** International dialling prefix, e.g. "+65". */
  dialCode: string;
}

export const COUNTRIES: Country[] = [
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', dialCode: '+62' },
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
];

/** Default selection shown when entering the flow (matches the design). */
export const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.code === 'SG')!;
