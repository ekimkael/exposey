import { Image } from 'expo-image';
import { Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

/** One onboarding page. */
export interface Slide {
  /** Headline. */
  title: string;
  /** Supporting copy. */
  subtitle: string;
}

export interface OnboardingCarouselProps {
  /** Pages to show, in order. */
  slides: Slide[];
}

/**
 * Swipeable onboarding carousel with morphing page dots.
 *
 * A paged horizontal scroll view drives a shared `scrollX` value; each dot
 * interpolates its width and colour from that value, so the active dot smoothly
 * stretches into a pill and fades back as you swipe between pages.
 */
export function OnboardingCarousel({ slides }: OnboardingCarouselProps) {
  const { width } = useWindowDimensions();
  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  return (
    <View>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}>
        {slides.map((slide, i) => (
          <Page key={i} slide={slide} width={width} />
        ))}
      </Animated.ScrollView>

      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', paddingTop: 32 }}>
        {slides.map((_, i) => (
          <Dot key={i} index={i} scrollX={scrollX} pageWidth={width} />
        ))}
      </View>
    </View>
  );
}

/** A single full-width page: hero illustration, title, subtitle. */
function Page({ slide, width }: { slide: Slide; width: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ width, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, gap: 28 }}>
      <Image
        source={require('@/assets/images/hero-shape.svg')}
        style={{ width: 260, height: 260 }}
        contentFit="contain"
      />
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Text style={{ fontFamily: font.bold, fontSize: 32, lineHeight: 38, textAlign: 'center', color: colors.text }}>
          {slide.title}
        </Text>
        <Text
          style={{ fontFamily: font.regular, fontSize: 15, lineHeight: 22, textAlign: 'center', color: colors.textMuted }}>
          {slide.subtitle}
        </Text>
      </View>
    </View>
  );
}

/** One page indicator that morphs width + colour from the scroll position. */
function Dot({ index, scrollX, pageWidth }: { index: number; scrollX: { value: number }; pageWidth: number }) {
  const { colors } = useTheme();

  const style = useAnimatedStyle(() => {
    const range = [(index - 1) * pageWidth, index * pageWidth, (index + 1) * pageWidth];
    return {
      width: interpolate(scrollX.value, range, [9, 30, 9], Extrapolation.CLAMP),
      backgroundColor: interpolateColor(scrollX.value, range, [colors.divider, colors.accent, colors.divider]),
    };
  });

  return <Animated.View style={[{ height: 9, borderRadius: 5 }, style]} />;
}
