import { createContext, use, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_COUNTRY, type Country } from '@/lib/countries';

/** Gender options. */
export type Gender = 'female' | 'male' | 'other';
/** Self-reported investing experience. */
export type Experience = 'beginner' | 'intermediate' | 'advanced';
/** Primary investing goal. */
export type Goal = 'growth' | 'income' | 'retirement';
/** Risk appetite. */
export type Risk = 'low' | 'medium' | 'high';

/** Profile details collected across the multi-step sign-up wizard. */
export interface Profile {
  // Step 1 — identity
  firstName: string;
  lastName: string;
  /** Date of birth, or `null` until picked. */
  birthDate: Date | null;
  gender: Gender | null;
  // Step 2 — contact & residence
  email: string;
  /** Country of residence (distinct from the phone country). */
  residenceCountry: Country | null;
  city: string;
  // Step 3 — investor profile
  experience: Experience | null;
  goal: Goal | null;
  risk: Risk | null;
}

const EMPTY_PROFILE: Profile = {
  firstName: '',
  lastName: '',
  birthDate: null,
  gender: null,
  email: '',
  residenceCountry: null,
  city: '',
  experience: null,
  goal: null,
  risk: null,
};

interface FlowContextValue {
  /** Currently selected phone country (drives the phone prefix). */
  country: Country;
  setCountry: (country: Country) => void;
  /** National phone number (digits the user typed, no prefix). */
  phone: string;
  setPhone: (phone: string) => void;
  /** Profile details collected across the wizard. */
  profile: Profile;
  setProfile: (update: Partial<Profile>) => void;
}

const FlowContext = createContext<FlowContextValue | null>(null);

/**
 * Holds the onboarding form state (country, phone, profile) so screens can share
 * it without threading router params through every push.
 *
 * ponytail: in-memory only — fine for a UI reproduction with no backend.
 */
export function FlowProvider({ children }: { children: ReactNode }) {
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState('');
  const [profile, setProfileState] = useState<Profile>(EMPTY_PROFILE);

  const setProfile = (update: Partial<Profile>) => setProfileState((prev) => ({ ...prev, ...update }));

  const value = useMemo<FlowContextValue>(
    () => ({ country, setCountry, phone, setPhone, profile, setProfile }),
    [country, phone, profile],
  );

  return <FlowContext value={value}>{children}</FlowContext>;
}

/** Access the onboarding flow state. Throws if used outside {@link FlowProvider}. */
export function useFlow(): FlowContextValue {
  const context = use(FlowContext);
  if (!context) throw new Error('useFlow must be used within a FlowProvider');
  return context;
}
