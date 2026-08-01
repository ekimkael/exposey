export interface ReadingEntry {
  readonly date: string;
  /** Metro asset id from `require` — what `expo-image` expects for a bundled source. */
  readonly scene: number;
}

export const READING_LOG: readonly ReadingEntry[] = [
  { date: '16 May, 2025', scene: require('@/assets/scenes/01-beach.svg') },
  { date: '18 May, 2025', scene: require('@/assets/scenes/02-cafe.svg') },
  { date: '25 May, 2025', scene: require('@/assets/scenes/03-plane.svg') },
  { date: '26 May, 2025', scene: require('@/assets/scenes/04-bedside.svg') },
  { date: '1 Jun, 2025', scene: require('@/assets/scenes/05-park.svg') },
  { date: '5 Jun, 2025', scene: require('@/assets/scenes/06-train.svg') },
  { date: '7 Jun, 2025', scene: require('@/assets/scenes/07-kitchen.svg') },
  { date: '8 Jun, 2025', scene: require('@/assets/scenes/08-balcony.svg') },
  { date: '12 Jun, 2025', scene: require('@/assets/scenes/09-library.svg') },
  { date: '18 Jun, 2025', scene: require('@/assets/scenes/10-bath.svg') },
  { date: '20 Jun, 2025', scene: require('@/assets/scenes/11-forest.svg') },
  { date: '21 Jun, 2025', scene: require('@/assets/scenes/12-desk.svg') },
  { date: '23 Jun, 2025', scene: require('@/assets/scenes/13-snow.svg') },
  { date: '28 Jun, 2025', scene: require('@/assets/scenes/14-hammock.svg') },
];
