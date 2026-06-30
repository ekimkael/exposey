/**
 * @file beach.tsx
 * @description Beach destination screen.
 *
 * Receives the zoom/morph transition from the home screen's "Be here now" button.
 * - iOS 18+: `Link.AppleZoomTarget` anchors the native zoom transition.
 * - All OS: `sharedTransitionTag="beach-morph"` (react-native-reanimated fallback).
 *
 * The Stack header is shown as transparent so the native back chevron floats
 * over the photo without any background bar. `headerBackButtonDisplayMode="minimal"`
 * hides the previous screen's title next to the chevron.
 */
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Link, Stack } from 'expo-router';

export default function BeachScreen() {
  return (
    <Animated.View sharedTransitionTag="beach-morph" style={s.root}>
      <Stack.Screen
        options={{
          headerShown:               true,
          headerTransparent:         true,
          title:                     '',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />

      <Link.AppleZoomTarget>
        <Image
          source={require('@/assets/images/beach.png')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      </Link.AppleZoomTarget>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D3326' },
});
