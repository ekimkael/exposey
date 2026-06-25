/**
 * @file GlobeView — Globe animé orthographique en rotation pour le slide "Everywhere You Go".
 *
 * ## Technique
 * - Projection orthographique : chaque point (lat, lng) + rotation → (x, y) sur le SVG.
 * - `useSharedValue` + `withRepeat(withTiming(..., linear))` pour la rotation continue.
 * - Chaque élément animé (ligne de longitude, point de ville, arc de connexion) est un
 *   composant React distinct avec son propre `useAnimatedProps` — les calculs de projection
 *   s'exécutent en worklet sur le thread UI, sans passer par le thread JS.
 * - Les lignes de latitude sont statiques (une rotation autour de l'axe Y ne les déplace pas).
 *
 * ## Ajouter une ville
 * Ajoute une entrée dans `CITIES`. Si tu veux la relier à une autre ville, ajoute la paire
 * d'indices dans `LINKS`.
 *
 * ## Performances
 * ~32 `useAnimatedProps` (12 longitudes + 10 villes + 10 arcs) tournent en permanence sur
 * le thread UI. Sur les appareils modernes, l'impact est négligeable. Si nécessaire,
 * remplacer par un `useFrameCallback` unique qui met à jour un seul `SharedValue<string>`.
 *
 * @module components/onboarding/GlobeView
 */

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, Path, ClipPath } from 'react-native-svg';

// ─── Animated SVG primitives ──────────────────────────────────────────────────

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedCircle  = Animated.createAnimatedComponent(Circle);
const AnimatedPath    = Animated.createAnimatedComponent(Path);

// ─── Globe constants ──────────────────────────────────────────────────────────

/** Internal viewBox dimensions — the SVG scales to fit `size` via `viewBox`. */
const VB = 280;
/** Center of the viewBox. */
const CX = VB / 2;
const CY = VB / 2;
/** Globe radius in viewBox units. */
const R = 115;
/** Duration (ms) for one full revolution. */
const REVOLUTION_MS = 22_000;

// ─── Data ─────────────────────────────────────────────────────────────────────

interface City {
  lat: number;
  lng: number;
}

/** Cities displayed as glowing dots on the globe. */
const CITIES: City[] = [
  { lat: 51.5,  lng: -0.1  }, // 0 — London
  { lat: 40.7,  lng: -74.0 }, // 1 — New York
  { lat: 35.7,  lng: 139.7 }, // 2 — Tokyo
  { lat: 6.5,   lng: 3.4   }, // 3 — Lagos
  { lat: -23.5, lng: -46.6 }, // 4 — São Paulo
  { lat: 1.3,   lng: 103.8 }, // 5 — Singapore
  { lat: 48.9,  lng: 2.3   }, // 6 — Paris
  { lat: 55.8,  lng: 37.6  }, // 7 — Moscow
  { lat: -33.9, lng: 18.4  }, // 8 — Cape Town
  { lat: 19.4,  lng: -99.1 }, // 9 — Mexico City
];

/** Pairs of city indices to draw connection arcs between. */
const LINKS: [number, number][] = [
  [0, 1], [0, 2], [0, 3],
  [1, 4], [1, 9],
  [2, 5], [3, 8],
  [5, 7], [6, 0],
  [7, 0],
];

/** Latitude values at which to draw static grid rings. */
const LATITUDES = [-75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75];

// ─── Projection helper (worklet-safe) ─────────────────────────────────────────

/**
 * Projects a geographic point onto the 2D viewBox given the current rotation.
 *
 * @worklet — called inside `useAnimatedProps` on the UI thread.
 * @returns x, y (pixel coords) and z (depth: −1 = behind globe, 1 = front)
 */
function project(
  φ: number,   // latitude in radians (pre-computed, stable between renders)
  lngRad: number,  // longitude in radians (pre-computed)
  rotation: number,
): { x: number; y: number; z: number } {
  'worklet';
  const λ = lngRad + rotation;
  return {
    x: CX + R * Math.cos(φ) * Math.sin(λ),
    y: CY - R * Math.sin(φ),
    z: Math.cos(φ) * Math.cos(λ),
  };
}

// ─── LongitudeLine ────────────────────────────────────────────────────────────

interface LongitudeLineProps {
  /** Starting angle offset for this longitude line (in radians). */
  baseAngle: number;
  rotation: SharedValue<number>;
}

/**
 * One animated longitude line (a vertical ellipse).
 *
 * As the globe rotates, the ellipse `rx` sweeps between 0 (edge-on) and R (face-on).
 * Back-facing lines render at ~20% opacity to give depth; front-facing at 90%.
 */
function LongitudeLine({ baseAngle, rotation }: LongitudeLineProps) {
  const animatedProps = useAnimatedProps(() => {
    'worklet';
    const a = baseAngle + rotation.value;
    const na = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const sinA = Math.sin(na);
    const isFront = na < Math.PI;
    const opacity = isFront
      ? Math.max(0, sinA) * 0.09
      : Math.max(0, -sinA) * 0.02;
    return {
      rx: Math.max(Math.abs(sinA) * R, 0.5),
      opacity,
    };
  });

  return (
    <AnimatedEllipse
      cx={CX}
      cy={CY}
      ry={R}
      stroke="white"
      strokeWidth={0.6}
      fill="none"
      animatedProps={animatedProps}
    />
  );
}

// ─── CityDot ──────────────────────────────────────────────────────────────────

interface CityDotProps {
  city: City;
  rotation: SharedValue<number>;
}

/**
 * Glowing dot representing a city on the globe surface.
 *
 * Fades out and shrinks as the city rotates to the back hemisphere.
 */
function CityDot({ city, rotation }: CityDotProps) {
  const φ      = city.lat * (Math.PI / 180);
  const lngRad = city.lng * (Math.PI / 180);

  const animatedProps = useAnimatedProps(() => {
    'worklet';
    const { x, y, z } = project(φ, lngRad, rotation.value);
    const alpha = z < -0.15 ? 0 : Math.max(0, (z + 0.15) / 1.15);
    return {
      cx: x,
      cy: y,
      r: Math.max(1.5 + alpha * 2, 0),
      opacity: alpha * 0.92,
    };
  });

  return <AnimatedCircle fill="#c8b8ff" animatedProps={animatedProps} />;
}

// ─── ConnectionArc ────────────────────────────────────────────────────────────

interface ConnectionArcProps {
  cityA: City;
  cityB: City;
  rotation: SharedValue<number>;
}

/**
 * Quadratic Bézier arc between two cities on the globe.
 *
 * The control point is pushed slightly towards the sphere center, giving the arc
 * a subtle "great circle" curvature. The arc is invisible when either endpoint
 * is on the back hemisphere.
 */
function ConnectionArc({ cityA, cityB, rotation }: ConnectionArcProps) {
  const φA      = cityA.lat * (Math.PI / 180);
  const lngRadA = cityA.lng * (Math.PI / 180);
  const φB      = cityB.lat * (Math.PI / 180);
  const lngRadB = cityB.lng * (Math.PI / 180);

  const animatedProps = useAnimatedProps(() => {
    'worklet';
    const pa = project(φA, lngRadA, rotation.value);
    const pb = project(φB, lngRadB, rotation.value);

    if (pa.z < 0.05 || pb.z < 0.05) {
      return { d: 'M 0 0', opacity: 0 };
    }

    const alpha = Math.min(pa.z, pb.z) * 0.55;
    const mx = (pa.x + pb.x) / 2;
    const my = (pa.y + pb.y) / 2;
    const dx = CX - mx;
    const dy = CY - my;
    const norm = Math.sqrt(dx * dx + dy * dy) || 1;
    const dist = Math.sqrt((pb.x - pa.x) ** 2 + (pb.y - pa.y) ** 2);
    const qx = mx + (dx / norm) * dist * 0.22;
    const qy = my + (dy / norm) * dist * 0.22;

    return {
      d: `M ${pa.x} ${pa.y} Q ${qx} ${qy} ${pb.x} ${pb.y}`,
      opacity: alpha * 0.65,
    };
  });

  return (
    <AnimatedPath
      stroke="rgba(120,100,230,1)"
      strokeWidth={0.9}
      fill="none"
      animatedProps={animatedProps}
    />
  );
}

// ─── GlobeView ────────────────────────────────────────────────────────────────

interface GlobeViewProps {
  /** Diameter of the globe in logical pixels. Defaults to 280. */
  size?: number;
}

/**
 * Animated rotating globe — "Everywhere You Go" slide visual.
 *
 * Pass `size` to scale the globe to the available width.
 *
 * @example
 * ```tsx
 * <GlobeView size={viewportWidth * 0.85} />
 * ```
 */
export function GlobeView({ size = 280 }: GlobeViewProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(Math.PI * 2, { duration: REVOLUTION_MS, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
        <Defs>
          {/* Clip mask — constrains all globe content to the sphere boundary */}
          <ClipPath id="globeClip">
            <Circle cx={CX} cy={CY} r={R} />
          </ClipPath>
        </Defs>

        {/* ── Dark sphere background ── */}
        <Circle cx={CX} cy={CY} r={R} fill="#07070e" />

        {/* ── Latitude grid (static — y-axis rotation doesn't affect them) ── */}
        <G clipPath="url(#globeClip)">
          {LATITUDES.map((lat) => {
            const φ = lat * (Math.PI / 180);
            const ly  = CY - R * Math.sin(φ);
            const lrx = R * Math.cos(φ);
            return (
              <Ellipse
                key={lat}
                cx={CX}
                cy={ly}
                rx={lrx}
                ry={lrx * 0.26}
                stroke="white"
                strokeWidth={0.6}
                strokeOpacity={0.07}
                fill="none"
              />
            );
          })}
        </G>

        {/* ── Animated longitude grid ── */}
        <G clipPath="url(#globeClip)">
          {Array.from({ length: 12 }, (_, i) => (
            <LongitudeLine
              key={i}
              baseAngle={(i * Math.PI) / 6}
              rotation={rotation}
            />
          ))}
        </G>

        {/* ── Connection arcs between cities ── */}
        <G clipPath="url(#globeClip)">
          {LINKS.map(([a, b], i) => (
            <ConnectionArc
              key={i}
              cityA={CITIES[a]}
              cityB={CITIES[b]}
              rotation={rotation}
            />
          ))}
        </G>

        {/* ── City dots ── */}
        <G clipPath="url(#globeClip)">
          {CITIES.map((city, i) => (
            <CityDot key={i} city={city} rotation={rotation} />
          ))}
        </G>

        {/* ── Subtle outer ring ── */}
        <Circle
          cx={CX}
          cy={CY}
          r={R}
          stroke="white"
          strokeOpacity={0.13}
          strokeWidth={1}
          fill="none"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
