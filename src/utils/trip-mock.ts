const picsum = (seed: string, w = 80, h = 80) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const makeStories = (base: string, count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${base}-s${i}`,
    imageUrl: picsum(`${base}-story${i}`, 400, 700),
  }));

/**
 * Static trip data for the "One Week Retreat" Gatesware screen.
 * Replace this with an API response shape — keep the same field names
 * so components need no changes.
 *
 * `placesTotalCount` / `restaurantsTotalCount` / `hotelsTotalCount`:
 * server-side totals shown in section headers. The local arrays are a
 * representative subset (4 items each).
 */
export const TRIP = {
  brand: 'GATESWARE',
  title: 'One Week Retreat',
  subtitle: 'At Supra Falls',
  flag: '🇦🇷',
  flagCode: 'ARG',
  description:
    "Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry. Lorem Ipsum Has Been The Industry's Standard Dummy.",

  stats: [
    { label: 'Hotels',      count: 5,  iconKey: 'hotel'      },
    { label: 'Cars',        count: 4,  iconKey: 'car'        },
    { label: 'Restaurants', count: 3,  iconKey: 'restaurant' },
    { label: 'Attractions', count: 15, iconKey: 'attraction' },
  ],

  restaurants: [
    { id: 'r1', name: 'Kareems',   address: 'New venue, US/9210', imageUrl: picsum('kareems',   80, 80) },
    { id: 'r2', name: 'Maverciks', address: 'Midtown, US/1030',   imageUrl: picsum('maverciks', 80, 80) },
    { id: 'r3', name: 'Longbros',  address: 'Harbor, US/4401',    imageUrl: picsum('longbros',  80, 80) },
    { id: 'r4', name: 'Supabowl',  address: 'Eastside, US/7712',  imageUrl: picsum('supabowl',  80, 80) },
  ],
  restaurantsTotalCount: 14,

  places: [
    { id: 'p1', name: 'Old Saman Towers', imageUrl: picsum('oldtowers',   80, 80), stories: makeStories('p1', 4) },
    { id: 'p2', name: 'Tenets Sea',        imageUrl: picsum('tenetssea',   80, 80), stories: makeStories('p2', 2) },
    { id: 'p3', name: 'Newgate Beach',     imageUrl: picsum('newgate',     80, 80), stories: makeStories('p3', 5) },
    { id: 'p4', name: 'Bus Underway',      imageUrl: picsum('busunderway', 80, 80), stories: makeStories('p4', 3) },
  ],
  placesTotalCount: 14,

  hotels: [
    { id: 'h1', name: 'Hyatt',    imageUrl: picsum('hyatt',    80, 80), stories: makeStories('h1', 3) },
    { id: 'h2', name: 'Novotel',  imageUrl: picsum('novotel',  80, 80), stories: makeStories('h2', 5) },
    { id: 'h3', name: 'Corona',   imageUrl: picsum('corona',   80, 80), stories: makeStories('h3', 2) },
    { id: 'h4', name: 'Mapleway', imageUrl: picsum('mapleway', 80, 80), stories: makeStories('h4', 4) },
  ],
  hotelsTotalCount: 7,
} as const;

/** Union of valid stat icon keys — keeps the ICONS map fully typed. */
export type StatIconKey = 'hotel' | 'car' | 'restaurant' | 'attraction';
