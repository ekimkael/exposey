export interface Artist {
  name: string;
  /** Card background */
  bg: string;
  /** Artist name color */
  text: string;
  /** Static tilt in degrees, alternating sign like the reference */
  tilt: number;
  /** Horizontal offset from center, pt */
  offsetX: number;
  /** Abstract art variant standing in for the artist photo */
  art: 'portrait' | 'prism' | 'band' | 'landscape' | 'sun' | 'waves';
  /** Two colors used by the art variant */
  artColors: [string, string];
}

export const ARTISTS: Artist[] = [
  { name: 'Tyler the Creator', bg: '#7A8946', text: '#D6E68A', tilt: -5, offsetX: -8, art: 'portrait', artColors: ['#7EB6E8', '#2E5C8A'] },
  { name: 'Jake Isaac', bg: '#E5DDD0', text: '#A39B8B', tilt: 4, offsetX: 10, art: 'sun', artColors: ['#6B5B45', '#2E2A22'] },
  { name: 'ALT-J', bg: '#2C3251', text: '#FFB0E0', tilt: -3, offsetX: -4, art: 'prism', artColors: ['#8FAE9C', '#4A6B8A'] },
  { name: 'Cigarettes After Sex', bg: '#2E3032', text: '#E6E6E2', tilt: 7, offsetX: -14, art: 'band', artColors: ['#9A9A9A', '#3A3A3A'] },
  { name: 'Sigur Rós', bg: '#DFA267', text: '#5C3A1E', tilt: -8, offsetX: 6, art: 'landscape', artColors: ['#EFD9B8', '#8A5A2E'] },
  { name: 'Tame Impala', bg: '#8FB8E8', text: '#F4F1FF', tilt: -4, offsetX: -6, art: 'waves', artColors: ['#C9BFEF', '#7B5EA7'] },
  { name: 'Sampha', bg: '#9F4C4F', text: '#E9C64B', tilt: 6, offsetX: 8, art: 'portrait', artColors: ['#BFE3D9', '#4E8A78'] },
  { name: 'Bon Iver', bg: '#D98A3F', text: '#42301C', tilt: -6, offsetX: -10, art: 'landscape', artColors: ['#F2E2C4', '#6B4A26'] },
];
