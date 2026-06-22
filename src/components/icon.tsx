import { Image } from 'expo-image';

interface Props {
  /** SF Symbol name, e.g. `play.fill`, `magnifyingglass`. */
  name: string;
  size?: number;
  color: string;
}

/**
 * SF Symbol rendered through `expo-image` (`sf:` source). Native and crisp on
 * iOS; falls back to nothing on platforms without SF Symbols.
 *
 * ponytail: iOS-first icons — the reference design is an iPhone. Add Material
 * vector drawables here if Android parity becomes a requirement.
 */
export function Icon({ name, size = 20, color }: Props) {
  return (
    <Image
      source={`sf:${name}`}
      tintColor={color}
      contentFit="contain"
      style={{ width: size, height: size }}
    />
  );
}
