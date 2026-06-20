import { Pressable, Text, useWindowDimensions } from 'react-native';

import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

/** Native button height — matches `controlSize('large')` and the design. */
const BUTTON_HEIGHT = 52;
/** Corner radius — rounded rectangle, not a full capsule/pill. */
const BUTTON_RADIUS = 16;

export interface PrimaryButtonProps {
  /** Button label, e.g. "Log in" or "Next". */
  label: string;
  /** Tap handler. Ignored while {@link disabled}. */
  onPress?: () => void;
  /** Greys out the button and blocks presses (used until a form is valid). */
  disabled?: boolean;
}

/**
 * Full-width primary call-to-action, rendered with each platform's native
 * button so it matches OS conventions:
 *
 * - **iOS** → SwiftUI `Button` (`@expo/ui/swift-ui`)
 * - **Android** → Jetpack Compose `Button` (`@expo/ui/jetpack-compose`)
 * - **web** → plain React Native `Pressable` fallback
 *
 * Enabled it fills with the lime `accent`; disabled it falls back to the muted
 * `disabledBg`. The native variants require a custom dev build
 * (`npx expo run:ios|android`) — they do NOT render in Expo Go, and their
 * labels use the system font (the JS `font` family only applies on web).
 *
 * Disabled state is expressed by swapping the fill/label colours and dropping
 * the press handler, which both looks right and prevents activation.
 */
export function PrimaryButton({ label, onPress, disabled = false }: PrimaryButtonProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const fill = disabled ? colors.disabledBg : colors.accent;
  const labelColor = disabled ? colors.disabledText : colors.accentText;
  const handlePress = disabled ? undefined : onPress;

  if (process.env.EXPO_OS === 'ios') {
    const { Host, Button, Text: SwiftText } = require('@expo/ui/swift-ui');
    const { buttonStyle, buttonBorderShape, controlSize, tint, foregroundColor, frame } = require('@expo/ui/swift-ui/modifiers');
    // Two gotchas, both fixed here:
    //  1. A height-less `Host` has a zero-height touch area (the SwiftUI content
    //     draws past it but taps miss) — so give the Host an explicit size.
    //  2. `.frame` on the *button* only centres it; to stretch a borderedProminent
    //     button full width the frame must sit on its *label*. `Infinity` can't
    //     cross the bridge (serialises to null), so use a large finite maxWidth
    //     that the 100%-wide Host clamps back to the row width.
    return (
      <Host style={{ width: '100%', height: BUTTON_HEIGHT }}>
        <Button
          onPress={handlePress}
          modifiers={[
            buttonStyle('borderedProminent'),
            buttonBorderShape('roundedRectangle', BUTTON_RADIUS),
            controlSize('large'),
            tint(fill),
            foregroundColor(labelColor),
          ]}>
          <SwiftText modifiers={[frame({ maxWidth: width })]}>{label}</SwiftText>
        </Button>
      </Host>
    );
  }

  if (process.env.EXPO_OS === 'android') {
    const { Host, Button, Text: ComposeText } = require('@expo/ui/jetpack-compose');
    const { fillMaxWidth, height } = require('@expo/ui/jetpack-compose/modifiers');
    return (
      <Host style={{ width: '100%', height: BUTTON_HEIGHT }}>
        <Button
          onClick={handlePress}
          colors={{ containerColor: fill, contentColor: labelColor }}
          modifiers={[fillMaxWidth(), height(BUTTON_HEIGHT)]}>
          <ComposeText>{label}</ComposeText>
        </Button>
      </Host>
    );
  }

  // Web fallback.
  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        width: '100%',
        paddingVertical: 16,
        backgroundColor: fill,
        borderRadius: BUTTON_RADIUS,
        borderCurve: 'continuous',
        alignItems: 'center',
        opacity: pressed ? 0.85 : 1,
      })}>
      <Text style={{ color: labelColor, fontSize: 16, fontFamily: font.semibold }}>{label}</Text>
    </Pressable>
  );
}
