export const BRAND = '#208AEF' as const;

/** Value-prop words shown in the cycling slot-machine animation. */
export const WORDS = [
  { label: 'Plan',   color: '#208AEF' },
  { label: 'Remind', color: '#F5A623' },
  { label: 'Focus',  color: '#8B5CF6' },
  { label: 'Share',  color: '#34C759' },
  { label: 'Sync',   color: '#5AC8FA' },
] as const;

export type Word = (typeof WORDS)[number];

/** Height of each row in the cycling word list. */
export const ITEM_HEIGHT = 72;
