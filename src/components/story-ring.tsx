import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { RING } from '@/utils/trip-tokens';

/**
 * Props for StoryRing.
 */
type Props = {
  /** Outer diameter of the ring in dp (avatar size + padding). */
  size: number;
  /** When true the ring is rendered in muted grey (all stories seen). */
  viewed?: boolean;
  /**
   * Number of arc segments to draw — one per story slide.
   * 1 (default) draws a single continuous ring.
   */
  segments?: number;
};

/**
 * Circular story-ring indicator rendered as an SVG absolute overlay.
 * - Unviewed: orange → red gradient split into `segments` arcs.
 * - Viewed: solid grey ring.
 * Segments start at 12 o'clock (top) via a -90° rotation.
 */
export default function StoryRing({ size, viewed = false, segments = 1 }: Props) {
  const r = (size - RING.stroke * 2) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;

  const segmentLength = segments > 1
    ? (circumference - segments * RING.segmentGap) / segments
    : circumference;

  const strokeDasharray = segments > 1
    ? `${segmentLength} ${RING.segmentGap}`
    : undefined;

  const strokeColor = viewed ? '#C7C7CC' : 'url(#story-grad)';
  // Rotate so the first segment starts at the top of the circle.
  const transform = `rotate(-90 ${cx} ${cx})`;

  return (
    <Svg width={size} height={size} style={{ position: 'absolute' }} viewBox={`0 0 ${size} ${size}`}>
      {!viewed && (
        <Defs>
          <LinearGradient id="story-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%"   stopColor="#F5A623" />
            <Stop offset="50%"  stopColor="#E8472A" />
            <Stop offset="100%" stopColor="#C0392B" />
          </LinearGradient>
        </Defs>
      )}
      <Circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke={strokeColor}
        strokeWidth={RING.stroke}
        strokeDasharray={strokeDasharray}
        transform={transform}
      />
    </Svg>
  );
}
