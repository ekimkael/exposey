import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

type Props = { size: number; viewed?: boolean };

const STROKE = 2.5;

/** Gradient ring indicator — colored when unviewed, grey when seen */
export default function StoryRing({ size, viewed = false }: Props) {
  const r = (size - STROKE * 2) / 2;
  const cx = size / 2;

  if (viewed) {
    return (
      <Svg width={size} height={size} style={{ position: 'absolute' }} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={cx} cy={cx} r={r} fill="none" stroke="#C7C7CC" strokeWidth={STROKE} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} style={{ position: 'absolute' }} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <LinearGradient id="story-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#F5A623" />
          <Stop offset="50%" stopColor="#E8472A" />
          <Stop offset="100%" stopColor="#C0392B" />
        </LinearGradient>
      </Defs>
      <Circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke="url(#story-grad)"
        strokeWidth={STROKE}
      />
    </Svg>
  );
}
