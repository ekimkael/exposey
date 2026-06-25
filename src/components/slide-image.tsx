import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

import { OnboardingSlide } from '@/utils/data';
import { IMAGE_WIDTH_FACTOR } from '@/utils/tokens';
import { GlobeView } from './globe-view';

export interface SlideImageProps {
  slide: OnboardingSlide;
  /** Full viewport width — sizes the slide container. */
  viewportWidth: number;
  /** Safe area top inset — clears the notch/Dynamic Island. */
  topInset: number;
}

/**
 * One page of the image carousel.
 *
 * - Default: renders the ghost-phone SVG with a subtle bleed effect.
 * - `everywhere` slide: renders {@link GlobeView} — live animated rotating globe.
 */
export function SlideImage({ slide, viewportWidth, topInset }: SlideImageProps) {
  return (
    <View style={[styles.container, { width: viewportWidth, paddingTop: topInset }]}>
      {slide.id === 'everywhere' ? (
        <GlobeView size={viewportWidth * 0.82} />
      ) : (
        <Image
          source={slide.image}
          style={[styles.image, { width: viewportWidth * IMAGE_WIDTH_FACTOR }]}
          contentFit="contain"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { flex: 1 },
});
