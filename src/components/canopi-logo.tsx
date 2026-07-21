import Svg, { Path } from 'react-native-svg';

interface CanopiLogoProps {
  size?: number;
  color?: string;
}

/**
 * The Canopi brand mark: a bold "cp" ligature that also reads as a tree
 * canopy over a stem. Stroke-based so it stays crisp at any size.
 * Geometry is hand-tuned against the reference screenshot.
 */
export function CanopiLogo({ size = 96, color = '#FFFFFF' }: CanopiLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* c — canopy crescent on the left, opening toward the p */}
      <Path
        d="M58 33 A20 20 0 1 0 58 67"
        stroke={color}
        strokeWidth={13}
        strokeLinecap="round"
      />
      {/* p — stem / descender on the right */}
      <Path d="M62 30 L62 85" stroke={color} strokeWidth={13} strokeLinecap="round" />
      {/* p — bowl at the top of the stem */}
      <Path
        d="M62 30 a15 15 0 1 1 0 30"
        stroke={color}
        strokeWidth={13}
        strokeLinecap="round"
      />
    </Svg>
  );
}
