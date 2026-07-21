import Svg, { Path } from 'react-native-svg';

interface BaobabLogoProps {
  size?: number;
  color?: string;
}

/**
 * The Baobab brand mark: a fat-trunked tree under a broad three-lobe canopy.
 * One filled <Path> only — react-native-svg's <Circle> double-registers under
 * the New Architecture ("two views with the same name RNSVGCircle"), so the
 * lobes are drawn as circular sub-paths. Reused verbatim by scripts/make-icon.
 */
const BAOBAB_PATH =
  // trunk
  'M43 44 C41 60 41 76 40 90 C40 93 60 93 60 90 C59 76 59 60 57 44 Z ' +
  // canopy: center lobe, then left, then right (circles as arc sub-paths)
  'M50 9 a21 21 0 1 0 0 42 a21 21 0 1 0 0 -42 Z ' +
  'M31 24 a14 14 0 1 0 0 28 a14 14 0 1 0 0 -28 Z ' +
  'M69 24 a14 14 0 1 0 0 28 a14 14 0 1 0 0 -28 Z';

export function BaobabLogo({ size = 96, color = '#FFFFFF' }: BaobabLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Path d={BAOBAB_PATH} fill={color} />
    </Svg>
  );
}
