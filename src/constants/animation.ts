import type { SymbolViewProps } from 'expo-symbols';

/** Headline shown while cards fall behind the bookmark icon. */
export const HEADLINE = 'A nest for your shiny finds';
/** Headline shown once the icon has rotated into its "explore" pose. */
export const SUBLINE = 'Go explore a new city';

/** Fill colors for the five cards that fall behind the bookmark icon. */
export const CARD_COLORS = ['#E7C79A', '#D98E73', '#8FA9C0', '#C24B4B', '#232323'];

/** Radius (px) of the outer and inner orbit rings, centered on the icon. */
export const OUTER_RADIUS = 160;
export const INNER_RADIUS = 105;

/** Peak horizontal scale of the icon's "gulp" bulge (1 = no bulge). */
export const BULGE_PEAK = 1.4;

interface OrbitIconSpec {
  symbol: SymbolViewProps['name'];
  bg: string;
  x: number;
  y: number;
}

function orbitIcon(symbol: SymbolViewProps['name'], bg: string, angleDeg: number, ring: 'outer' | 'inner'): OrbitIconSpec {
  const rad = (angleDeg * Math.PI) / 180;
  const radius = ring === 'outer' ? OUTER_RADIUS : INNER_RADIUS;
  return { symbol, bg, x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

/**
 * 3 icons on the outer ring (evenly spaced triangle) and 2 on the inner ring
 * (face to face), for 5 total — less cluttered than one icon per 45°.
 */
export const ORBIT_ICONS: OrbitIconSpec[] = [
  orbitIcon('paperplane.fill', '#3E8BF0', -90, 'outer'),
  orbitIcon('safari.fill', '#3E8BF0', 30, 'outer'),
  orbitIcon('fork.knife', '#E4483B', 150, 'outer'),
  orbitIcon('music.note', '#111111', 180, 'inner'),
  orbitIcon('camera.fill', '#C13584', 0, 'inner'),
];

/**
 * Every duration/delay (ms) that drives the hero's playback timeline, in
 * `src/hooks/use-hoarder-cycle.ts`. Grouped here so the pacing of the whole
 * loop can be tuned from one place.
 */
export const HERO_TIMING = {
  /** How long a single card takes to travel from off-screen to behind the icon. */
  cardDuration: 340,
  /** Gap between each card's start time, so they overlap in flight. */
  cardStagger: 220,
  /** translateY range (px) a card travels through, start to end. */
  cardTravel: [-140, 90] as const,
  /** ms per character while typing a headline. */
  typeSpeed: 26,
  /** ms per character while erasing a headline. */
  eraseSpeed: 16,
  /** Pause after the headline finishes typing, before the icon rotates. */
  postTypePause: 400,
  /** How long the icon takes to rotate into its "explore" pose. */
  rotateDuration: 600,
  /** Pause after rotation, before the orbit rings/icons fade in. */
  postRotatePause: 700,
  /** How long the orbit rings/icons take to fade in. */
  orbitFadeInDuration: 350,
  /** Pause after the orbit fades in, before it starts spinning. */
  postOrbitFadeInPause: 350,
  /** Duration of the orbit's one full 360° spin. */
  spinDuration: 1000,
  /** Hold time once the subline is fully typed, before the loop restarts. */
  postSublinePause: 1200,
  /** Duration of the icon/orbit reset tween at the end of a cycle. */
  resetDuration: 250,
  /** Extra pause after the reset tween, before the next cycle begins. */
  loopGap: 300,
  /** Duration of the "gulp" bulge's widen phase. */
  bulgeUpDuration: 70,
  /** Duration of the "gulp" bulge's springy settle phase. */
  bulgeDownDuration: 130,
  /** Delay before the first card's bulge, timed to land ~70% into its travel. */
  bulgeFirstDelay: 250,
  /** Gap between each subsequent bulge, matching `cardStagger` minus one bulge's own duration. */
  bulgeGap: 20,
} as const;
