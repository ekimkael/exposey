/**
 * @file Remindo onboarding screen — fullscreen 4-slide carousel.
 *
 * ## Architecture
 *
 * ```
 * OnboardingScreen              ← this file, composition only
 *   ├── Animated.ScrollView     ← horizontal pager (one SlideImage per slide)
 *   │     └── SlideImage ×N    ← full-width SVG phone mockup
 *   ├── ProgressDots            ← row of animated fill-bar dots
 *   ├── SlideHeading            ← title + subtitle (SlideInUp on page change)
 *   └── OnboardingActions       ← "Continue with Apple" + "Sign up"
 * ```
 *
 * ## State & animation
 * All carousel state (page, progress, auto-advance) lives in {@link useCarousel}.
 * Animated dot widths and fills are driven by Reanimated shared values — no JS re-renders.
 * The slide text re-renders on `page` changes (JS state) and uses `SlideInUp` for entrance.
 *
 * ## How to modify
 * - **Add/remove/reorder slides** → edit `SLIDES` in `src/features/onboarding/data.ts`.
 * - **Change auto-advance speed** → edit `SLIDE_DURATION` in the same file.
 * - **Wire auth** → replace `router.replace('/')` calls in {@link OnboardingActions}.
 * - **Swap images** → drop a new SVG in `assets/images/` and update the `image` field in `SLIDES`.
 *
 * @module app/index
 */

import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  SlideInUp,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { SLIDES, SLIDE_DURATION, DOT_ACTIVE_WIDTH, OnboardingSlide } from '@/features/onboarding/data';
import { useCarousel } from '@/hooks/use-carousel';
import { GlobeView } from '@/components/onboarding/GlobeView';

// ─── Design tokens ────────────────────────────────────────────────────────────
// Centralised here so a designer can adjust the entire screen from one block.

const COLORS = {
  background: '#000',
  text: '#fff',
  /** Used for subtitle and secondary actions. */
  textMuted: 'rgba(255,255,255,0.72)',
  /** Empty state of a progress dot track. */
  dotTrack: 'rgba(255,255,255,0.28)',
  dotFill: '#fff',
  buttonBackground: '#fff',
  buttonText: '#000',
} as const;

const FONT_SIZE = {
  heading: 28,
  subtitle: 18,
  button: 20,
  link: 18,
} as const;

/**
 * The SVG mockup is intentionally wider than the viewport to create a subtle
 * bleed effect — it bleeds past the phone frame on both sides.
 */
const IMAGE_WIDTH_FACTOR = 1.08;

// ─── ProgressDot ──────────────────────────────────────────────────────────────

interface ProgressDotProps {
  /** Zero-based position of this dot in the row. */
  index: number;
  /**
   * Current page as a shared value.
   * Drives track width without triggering JS re-renders.
   */
  page: SharedValue<number>;
  /**
   * Fill progress of the active dot (0 → 1).
   * Drives fill width for the active dot without triggering JS re-renders.
   */
  progress: SharedValue<number>;
}

/**
 * A single progress-bar style carousel indicator.
 *
 * Visual states:
 * - **Past** (`page > index`): track collapses to 8px, fill covers it entirely.
 * - **Active** (`page === index`): track expands to {@link DOT_ACTIVE_WIDTH}; fill tracks `progress`.
 * - **Future** (`page < index`): track collapses to 8px, fill is empty.
 */
function ProgressDot({ index, page, progress }: ProgressDotProps) {
  const trackStyle = useAnimatedStyle(() => ({
    width: page.value === index ? DOT_ACTIVE_WIDTH : 8,
  }));

  const fillStyle = useAnimatedStyle(() => {
    if (page.value > index) {
      // Past slide: fill the collapsed 8px track completely.
      return { width: 8 };
    }
    if (page.value === index) {
      // Active slide: fill grows as time elapses.
      return { width: progress.value * DOT_ACTIVE_WIDTH };
    }
    // Future slide: no fill.
    return { width: 0 };
  });

  return (
    <Animated.View style={[styles.dotTrack, trackStyle]}>
      <Animated.View style={[styles.dotFill, fillStyle]} />
    </Animated.View>
  );
}

// ─── SlideImage ───────────────────────────────────────────────────────────────

interface SlideImageProps {
  slide: OnboardingSlide;
  /** Full viewport width — used to size the slide container. */
  viewportWidth: number;
  /** Safe area top inset — used as top padding so content clears the notch. */
  topInset: number;
}

/**
 * One page of the carousel.
 *
 * - Default: renders the ghost-phone SVG with a subtle bleed ({@link IMAGE_WIDTH_FACTOR}).
 * - `everywhere` slide: renders {@link GlobeView} — a live animated rotating globe.
 */
function SlideImage({ slide, viewportWidth, topInset }: SlideImageProps) {
  return (
    <View style={[styles.slideContainer, { width: viewportWidth, paddingTop: topInset }]}>
      {slide.id === 'everywhere' ? (
        <GlobeView size={viewportWidth * 0.82} />
      ) : (
        <Image
          source={slide.image}
          style={[styles.slideImage, { width: viewportWidth * IMAGE_WIDTH_FACTOR }]}
          contentFit="contain"
        />
      )}
    </View>
  );
}

// ─── SlideHeading ─────────────────────────────────────────────────────────────

interface SlideHeadingProps {
  /**
   * Current page index used as the React `key`.
   * Changing it destroys and re-mounts the view, which re-triggers `entering`.
   */
  pageKey: number;
  slide: OnboardingSlide;
}

/**
 * Animated title + subtitle block.
 *
 * Wrapped in an `overflow: 'hidden'` parent so the `SlideInUp` entrance animation
 * is clipped to the text area and doesn't slide in from the bottom of the screen.
 */
function SlideHeading({ pageKey, slide }: SlideHeadingProps) {
  return (
    <View style={styles.headingClip}>
      <Animated.View
        key={pageKey}
        entering={SlideInUp.duration(600).easing(Easing.out(Easing.ease))}
        style={styles.headingContent}
      >
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </Animated.View>
    </View>
  );
}

// ─── OnboardingActions ────────────────────────────────────────────────────────

interface OnboardingActionsProps {
  /** Safe area bottom inset — ensures buttons stay above the home indicator. */
  bottomInset: number;
}

/**
 * Bottom CTA section with two actions:
 *
 * 1. **Continue with Apple** — primary auth, triggers medium haptic.
 * 2. **Sign up** — secondary path, triggers selection haptic.
 *
 * ⚠️ Both currently call `router.replace('/')` as a placeholder.
 * Replace with your actual auth flow (Sign in with Apple, email, etc.)
 * when integrating backend auth.
 */
function OnboardingActions({ bottomInset }: OnboardingActionsProps) {
  function handleAppleSignIn() {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: trigger Sign in with Apple, then navigate to the main app
    router.replace('/');
  }

  function handleEmailSignUp() {
    if (Platform.OS === 'ios') Haptics.selectionAsync();
    // TODO: navigate to the email/password sign-up screen
    router.replace('/');
  }

  return (
    <View style={[styles.actions, { paddingBottom: bottomInset + 20 }]}>
      <Pressable
        onPress={handleAppleSignIn}
        style={({ pressed }) => [styles.appleButton, pressed && styles.appleButtonPressed]}
        accessibilityRole="button"
        accessibilityLabel="Continue with Apple"
      >
        <SymbolView name={'apple.logo' as any} size={24} tintColor={COLORS.buttonText} />
        <Text style={styles.appleButtonText}>Continue with Apple</Text>
      </Pressable>

      <Pressable
        onPress={handleEmailSignUp}
        style={styles.signUpButton}
        accessibilityRole="button"
        accessibilityLabel="Sign up with email"
      >
        <Text style={styles.signUpText}>Sign up</Text>
        <SymbolView
          name={'chevron.right' as any}
          size={14}
          tintColor={COLORS.textMuted}
          weight="semibold"
        />
      </Pressable>
    </View>
  );
}

// ─── OnboardingScreen ─────────────────────────────────────────────────────────

/**
 * Root onboarding screen — the first screen users see when they open Remindo.
 *
 * Renders a fullscreen horizontal carousel of {@link SLIDES}.
 * Auto-advances every {@link SLIDE_DURATION} ms; a manual swipe cancels the timer
 * and immediately jumps to the swiped page.
 */
export default function OnboardingScreen() {
  const { width: viewportWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const { page, pageShared, progress, scrollRef, scrollHandler, handleMomentumEnd } =
    useCarousel({ count: SLIDES.length, slideDuration: SLIDE_DURATION });

  const currentSlide = SLIDES[page];

  return (
    <View style={styles.container}>

      {/* ── Image carousel ── */}
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
          <SlideImage
            key={slide.id}
            slide={slide}
            viewportWidth={viewportWidth}
            topInset={insets.top}
          />
        ))}
      </Animated.ScrollView>

      {/* ── Progress dots ── */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <ProgressDot key={i} index={i} page={pageShared} progress={progress} />
        ))}
      </View>

      {/* ── Slide text (re-mounts on page change → triggers SlideInUp) ── */}
      <SlideHeading pageKey={page} slide={currentSlide} />

      {/* ── CTA buttons ── */}
      <OnboardingActions bottomInset={insets.bottom} />

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },

  // Slide
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideImage: {
    flex: 1,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  dotTrack: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.dotTrack,
    overflow: 'hidden',
  },
  dotFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.dotFill,
    borderRadius: 2.5,
  },

  // Heading
  headingClip: {
    overflow: 'hidden',
  },
  headingContent: {
    paddingHorizontal: 28,
    gap: 10,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.heading,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.subtitle,
    lineHeight: 26,
  },

  // Actions
  actions: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 18,
  },
  appleButton: {
    backgroundColor: COLORS.buttonBackground,
    borderRadius: 100,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  appleButtonPressed: {
    opacity: 0.85,
  },
  appleButtonText: {
    color: COLORS.buttonText,
    fontSize: FONT_SIZE.button,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  signUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  signUpText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.link,
  },
});
