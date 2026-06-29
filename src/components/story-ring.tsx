import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

type Props = { size: number; viewed?: boolean; segments?: number };

const STROKE = 2.5;
const GAP = 3; // px gap between segments

/** Gradient ring indicator — colored when unviewed, grey when seen. Segmented when segments > 1. */
export default function StoryRing({ size, viewed = false, segments = 1 }: Props) {
  const r = (size - STROKE * 2) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;

  const segLen = segments > 1
    ? (circumference - segments * GAP) / segments
    : circumference;
  const dash = segments > 1 ? `${segLen} ${GAP}` : undefined;
  // rotate so first segment starts at top (12 o'clock)
  const rotate = `rotate(-90 ${cx} ${cx})`;

  const color = viewed ? '#C7C7CC' : 'url(#story-grad)';

  return (
    <Svg width={size} height={size} style={{ position: 'absolute' }} viewBox={`0 0 ${size} ${size}`}>
      {!viewed && (
        <Defs>
          <LinearGradient id="story-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#F5A623" />
            <Stop offset="50%" stopColor="#E8472A" />
            <Stop offset="100%" stopColor="#C0392B" />
          </LinearGradient>
        </Defs>
      )}
      <Circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={STROKE}
        strokeDasharray={dash}
        transform={rotate}
      />
    </Svg>
  );
}
