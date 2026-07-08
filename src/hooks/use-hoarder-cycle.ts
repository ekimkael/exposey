import { useEffect, useRef, useState } from 'react';
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { BULGE_PEAK, HEADLINE, HERO_TIMING, SUBLINE } from '@/constants/animation';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Reveals `full` one character at a time via `setText`. */
async function typeInto(setText: (value: string) => void, full: string, alive: { current: boolean }) {
  for (let i = 1; i <= full.length; i++) {
    if (!alive.current) return;
    setText(full.slice(0, i));
    await sleep(HERO_TIMING.typeSpeed);
  }
}

/** Removes `full` one character at a time via `setText`. */
async function eraseAll(setText: (value: string) => void, full: string, alive: { current: boolean }) {
  for (let i = full.length; i >= 0; i--) {
    if (!alive.current) return;
    setText(full.slice(0, i));
    await sleep(HERO_TIMING.eraseSpeed);
  }
}

/**
 * One "gulp" pulse for the icon's bulge value: a springy widen-then-settle.
 * `delay` is the gap since the previous pulse ended, not an absolute time —
 * these are chained back to back inside a single `withSequence`.
 */
function bulgeStep(delay: number) {
  return [
    withDelay(delay, withTiming(BULGE_PEAK, { duration: HERO_TIMING.bulgeUpDuration, easing: Easing.out(Easing.cubic) })),
    withTiming(1, { duration: HERO_TIMING.bulgeDownDuration, easing: Easing.elastic(1.2) }),
  ] as const;
}

/**
 * Drives the whole HoarderHero animation loop: cards falling behind the
 * icon, the icon rotating into its "explore" pose with a gulp per card, the
 * orbit fading in and spinning, and the headline/subline typewriter.
 *
 * Returns ready-to-use Reanimated styles plus the handful of values the
 * per-item sub-components (`CardStack`, `OrbitIcon`) need to animate
 * themselves — `HoarderHero` itself only composes JSX from these.
 */
export function useHoarderCycle() {
  const rotate = useSharedValue(0);
  const orbit = useSharedValue(0);
  const spin = useSharedValue(0);
  const bulge = useSharedValue(1);
  // One shared value per falling card — kept as an explicit literal (not a
  // loop) so the Rules-of-Hooks linter can verify a fixed hook count.
  const cardProgress = [useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0)];
  const [text, setText] = useState('');
  const [caret, setCaret] = useState(false);
  const alive = useRef(true);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(rotate.value, [0, 1], [0, 45])}deg` },
      { scaleX: bulge.value },
      // Squash vertically as it widens (classic squash-and-stretch) so the
      // silhouette rounds outward instead of just stretching flat.
      { scaleY: interpolate(bulge.value, [1, BULGE_PEAK], [1, 0.82]) },
    ],
  }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: orbit.value }));
  // Rings + icons revolve together as one group; each icon still fades/scales
  // in on its own via `orbit` (read directly by OrbitIcon).
  const orbitGroupStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  useEffect(() => {
    alive.current = true;

    async function playCycle(isFirst: boolean) {
      // Every cycle after the first starts by erasing the previous subline —
      // without this the loop would jump-cut straight into the headline.
      if (!isFirst) {
        setCaret(true);
        await eraseAll(setText, SUBLINE, alive);
        if (!alive.current) return;
      }

      cardProgress.forEach((value) => {
        value.value = 0;
      });
      rotate.value = 0;
      orbit.value = 0;
      spin.value = 0;
      bulge.value = 1;
      setCaret(true);

      cardProgress.forEach((value, index) => {
        value.value = withDelay(
          index * HERO_TIMING.cardStagger,
          withTiming(1, { duration: HERO_TIMING.cardDuration, easing: Easing.out(Easing.cubic) }),
        );
      });
      // One gulp per card, timed to land when each card is ~70% behind the
      // icon (cardDuration × ~0.73 ≈ bulgeFirstDelay in, then cardStagger).
      bulge.value = withSequence(
        ...bulgeStep(HERO_TIMING.bulgeFirstDelay),
        ...bulgeStep(HERO_TIMING.bulgeGap),
        ...bulgeStep(HERO_TIMING.bulgeGap),
        ...bulgeStep(HERO_TIMING.bulgeGap),
        ...bulgeStep(HERO_TIMING.bulgeGap),
      );
      await typeInto(setText, HEADLINE, alive);
      setCaret(false);
      await sleep(HERO_TIMING.postTypePause);
      if (!alive.current) return;

      rotate.value = withTiming(1, { duration: HERO_TIMING.rotateDuration, easing: Easing.out(Easing.cubic) });
      await sleep(HERO_TIMING.postRotatePause);
      if (!alive.current) return;

      orbit.value = withTiming(1, { duration: HERO_TIMING.orbitFadeInDuration, easing: Easing.out(Easing.back(1.4)) });
      await sleep(HERO_TIMING.postOrbitFadeInPause);
      if (!alive.current) return;

      // Give the orbit a full spin once it's settled in.
      spin.value = withTiming(360, { duration: HERO_TIMING.spinDuration, easing: Easing.inOut(Easing.cubic) });
      await sleep(HERO_TIMING.spinDuration);
      if (!alive.current) return;

      setCaret(true);
      await eraseAll(setText, HEADLINE, alive);
      await typeInto(setText, SUBLINE, alive);
      setCaret(false);
      await sleep(HERO_TIMING.postSublinePause);
      if (!alive.current) return;

      orbit.value = withTiming(0, { duration: HERO_TIMING.resetDuration });
      rotate.value = withTiming(0, { duration: HERO_TIMING.resetDuration });
      await sleep(HERO_TIMING.loopGap);
    }

    (async () => {
      let isFirst = true;
      while (alive.current) {
        await playCycle(isFirst);
        isFirst = false;
      }
    })();

    return () => {
      alive.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { iconStyle, ringStyle, orbitGroupStyle, orbit, cardProgress, text, caret };
}
