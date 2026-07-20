import { ARTISTS } from '@/constants/artists';

/** Sticker card dimensions (pt) */
export const CARD_WIDTH = 296;
export const CARD_HEIGHT = 104;

/** Vertical gap between adjacent cards on the arc (pt) */
export const GAP = 46;
/** Distance between two card centers along the arc (pt) */
export const PITCH = CARD_HEIGHT + GAP;

/**
 * The wheel holds every artist twice so a half-turn lands on the same
 * lineup — the ring can spin forever in either direction without a seam.
 */
export const SLOT_COUNT = ARTISTS.length * 2;
/** Full arc length of the ring (pt) */
export const TRACK = SLOT_COUNT * PITCH;
/** Ring radius so adjacent slots sit exactly one PITCH apart on the arc */
export const WHEEL_RADIUS = TRACK / (2 * Math.PI);

/**
 * Momentum projection on release: target += velocity(pt/s) × this factor.
 * 0.15 lets a firm fling skip several detents before locking.
 */
export const FLING_PROJECTION = 0.15;

/** Detent spring — snappy lock with a hint of overshoot, revolver-style. */
export const SNAP_SPRING = { damping: 20, stiffness: 160 } as const;

export const RAD_TO_DEG = 180 / Math.PI;
