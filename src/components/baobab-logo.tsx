import Svg, { Path } from 'react-native-svg';

interface BaobabLogoProps {
  /** Width and height in px (square). Defaults to 96. */
  size?: number;
  /** Fill colour. Defaults to white. */
  color?: string;
}

/**
 * The Baobab brand mark geometry (0..100 viewBox): a fat trunk under a broad
 * three-lobe canopy, as one filled path.
 *
 * It is a single `<Path>` on purpose — react-native-svg's `<Circle>`
 * double-registers under the New Architecture ("two views with the same name
 * RNSVGCircle"), so the canopy lobes are drawn as circular arc sub-paths. The
 * app icon (assets/images/baobab-icon.png) is a raster of this same shape.
 */
const BAOBAB_PATH =
  // trunk
  'M43 44 C41 60 41 76 40 90 C40 93 60 93 60 90 C59 76 59 60 57 44 Z ' +
  // canopy: center lobe, then left, then right (circles as arc sub-paths)
  'M50 9 a21 21 0 1 0 0 42 a21 21 0 1 0 0 -42 Z ' +
  'M31 24 a14 14 0 1 0 0 28 a14 14 0 1 0 0 -28 Z ' +
  'M69 24 a14 14 0 1 0 0 28 a14 14 0 1 0 0 -28 Z';

/**
 * The Baobab brand logo.
 *
 * @param size - Square dimension in px (default 96).
 * @param color - Fill colour (default white).
 */
export function BaobabLogo({ size = 96, color = '#FFFFFF' }: BaobabLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Path d={BAOBAB_PATH} fill={color} />
    </Svg>
  );
}
