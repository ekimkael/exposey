const picsum = (seed: string, w = 80, h = 80) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const stories = (base: string, count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${base}-s${i}`,
    imageUrl: picsum(`${base}-story${i}`, 400, 700),
  }));

export const TRIP = {
  brand: 'GATESWARE',
  title: 'One Week Retreat',
  subtitle: 'At Supra Falls',
  flag: '🇦🇷',
  flagCode: 'ARG',
  description:
    'Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry. Lorem Ipsum Has Been The Industry\'s Standard Dummy.',
  stats: [
    { label: 'Hotels',      count: 5,  iconKey: 'hotel' },
    { label: 'Cars',        count: 4,  iconKey: 'car' },
    { label: 'Restaurants', count: 3,  iconKey: 'restaurant' },
    { label: 'Attractions', count: 15, iconKey: 'attraction' },
  ],
  featuredRestaurant: {
    name: 'St. Iniesta Drawn ↗',
    address: 'New venue, US/9210',
    imageUrl: picsum('nature', 400, 400),
  },
  restaurants: [
    { id: 'r1', name: 'Kareems',   imageUrl: picsum('kareems',   80, 80) },
    { id: 'r2', name: 'Maverciks', imageUrl: picsum('maverciks', 80, 80) },
    { id: 'r3', name: 'Longbros',  imageUrl: picsum('longbros',  80, 80) },
    { id: 'r4', name: 'Supabowl',  imageUrl: picsum('supabowl',  80, 80) },
  ],
  places: [
    { id: 'p1', name: 'Old saman Towers', imageUrl: picsum('oldtowers',   80, 80), stories: stories('p1', 4) },
    { id: 'p2', name: 'tenets sea',        imageUrl: picsum('tenetssea',   80, 80), stories: stories('p2', 2) },
    { id: 'p3', name: 'Newgate beach',     imageUrl: picsum('newgate',     80, 80), stories: stories('p3', 5) },
    { id: 'p4', name: 'Bus underway',      imageUrl: picsum('busunderway', 80, 80), stories: stories('p4', 3) },
  ],
  hotels: [
    { id: 'h1', name: 'Hyatt',    imageUrl: picsum('hyatt',    80, 80), stories: stories('h1', 3) },
    { id: 'h2', name: 'Novotel',  imageUrl: picsum('novotel',  80, 80), stories: stories('h2', 5) },
    { id: 'h3', name: 'Corona',   imageUrl: picsum('corona',   80, 80), stories: stories('h3', 2) },
    { id: 'h4', name: 'Mapleway', imageUrl: picsum('mapleway', 80, 80), stories: stories('h4', 4) },
  ],
} as const;
