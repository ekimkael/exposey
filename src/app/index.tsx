/**
 * @file Remindo onboarding screen — fullscreen 4-slide carousel.
 *
 * ## Architecture
 *
 * ```
 * OnboardingScreen
 *   ├── Animated.ScrollView     ← horizontal pager (one SlideImage per slide)
 *   │     └── SlideImage ×N    ← SVG phone mockup or animated GlobeView
 *   ├── ProgressDot ×N         ← fill-bar indicators
 *   ├── SlideHeading           ← title + subtitle (FadeIn/FadeOut on page change)
 *   └── OnboardingActions      ← "Continue with Apple" + "Sign up"
 * ```
 *
 * ## How to modify
 * - **Add/remove/reorder slides** → edit `SLIDES` in `src/utils/data.ts`.
 * - **Change auto-advance speed** → edit `SLIDE_DURATION` in the same file.
 * - **Wire auth** → replace `router.replace('/')` calls in `OnboardingActions.tsx`.
 * - **Swap images** → drop a new SVG in `assets/images/` and update `SLIDES`.
 *
 * @module app/index
 */

import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';

import { SLIDES, SLIDE_DURATION } from '@/utils/data';
import { COLORS } from '@/utils/tokens';
import { useCarousel } from '@/hooks/use-carousel';
import { ProgressDot } from '@/components/progress-dot';
import { SlideImage } from '@/components/slide-image';
import { SlideHeading } from '@/components/slide-heading';
import { OnboardingActions } from '@/components/onboarding-actions';

/**
 * Root onboarding screen — the first screen users see when they open Remindo.
 *
 * All carousel state lives in {@link useCarousel}.
 * Each sub-component is responsible for its own styles and animation.
 */
export default function OnboardingScreen() {
  const { width: viewportWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const { page, pageShared, progress, scrollRef, scrollHandler, handleMomentumEnd } =
    useCarousel({ count: SLIDES.length, slideDuration: SLIDE_DURATION });

  const currentSlide = SLIDES[page];

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef as never}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        onMomentumScrollEnd={handleMomentumEnd}
        style={styles.scrollView}
      >
        {SLIDES.map((slide) => (
          <SlideImage key={slide.id} slide={slide} viewportWidth={viewportWidth} topInset={insets.top} />
        ))}
      </Animated.ScrollView>

      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <ProgressDot key={i} index={i} page={pageShared} progress={progress} />
        ))}
      </View>

      <SlideHeading page={page} slide={currentSlide} />

      <OnboardingActions bottomInset={insets.bottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  dotsRow: { flexDirection: 'row', gap: 6, justifyContent: 'center', paddingVertical: 16 },
});
