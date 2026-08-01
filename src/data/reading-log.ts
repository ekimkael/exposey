export interface ReadingEntry {
  readonly date: string;
  /** Metro asset id from `require` — what `expo-image` expects for a bundled source. */
  readonly scene: number;
}

export const READING_LOG: readonly ReadingEntry[] = [
  { date: '16 May, 2025', scene: require('@/assets/scenes/01-beach.jpg') },
  { date: '18 May, 2025', scene: require('@/assets/scenes/02-cafe.jpg') },
  { date: '25 May, 2025', scene: require('@/assets/scenes/03-plane.jpg') },
  { date: '26 May, 2025', scene: require('@/assets/scenes/04-bedside.jpg') },
  { date: '1 Jun, 2025', scene: require('@/assets/scenes/05-park.jpg') },
  { date: '5 Jun, 2025', scene: require('@/assets/scenes/06-train.jpg') },
  { date: '7 Jun, 2025', scene: require('@/assets/scenes/07-kitchen.jpg') },
  { date: '8 Jun, 2025', scene: require('@/assets/scenes/08-balcony.jpg') },
  { date: '12 Jun, 2025', scene: require('@/assets/scenes/09-library.jpg') },
  { date: '18 Jun, 2025', scene: require('@/assets/scenes/10-bath.jpg') },
  { date: '20 Jun, 2025', scene: require('@/assets/scenes/11-forest.jpg') },
  { date: '21 Jun, 2025', scene: require('@/assets/scenes/12-desk.jpg') },
  { date: '23 Jun, 2025', scene: require('@/assets/scenes/13-snow.jpg') },
  { date: '28 Jun, 2025', scene: require('@/assets/scenes/14-hammock.jpg') },
];
