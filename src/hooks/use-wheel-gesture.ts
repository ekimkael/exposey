import { Gesture } from 'react-native-gesture-handler';
import {
  cancelAnimation,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { FLING_PROJECTION, PITCH, SNAP_SPRING } from '@/constants/wheel';

export interface WheelGesture {
  /** Arc distance travelled by the wheel (pt); slot i is centered when progress = i × PITCH */
  progress: SharedValue<number>;
  /** Pan gesture to attach to the wheel viewport */
  panGesture: ReturnType<typeof Gesture.Pan>;
}

/**
 * Drives the rotary wheel from the user's vertical pan.
 *
 * While dragging, the wheel follows the finger 1:1 (drag up = spin
 * forward). On release the momentum is projected
 * (`velocity × FLING_PROJECTION`) and the wheel settles on the nearest
 * PITCH multiple with a spring seeded with the release velocity — the
 * detent snap of a revolver cylinder / rotary phone dial.
 *
 * Everything runs as worklets on the UI thread.
 *
 * @returns The shared `progress` value and the `panGesture` to attach.
 */
export function useWheelGesture(): WheelGesture {
  const progress = useSharedValue(0);
  const dragStart = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      cancelAnimation(progress);
      dragStart.value = progress.value;
    })
    .onUpdate((event) => {
      progress.value = dragStart.value - event.translationY;
    })
    .onEnd((event) => {
      const projected = progress.value - event.velocityY * FLING_PROJECTION;
      const target = Math.round(projected / PITCH) * PITCH;
      progress.value = withSpring(target, { ...SNAP_SPRING, velocity: -event.velocityY });
    });

  return { progress, panGesture };
}
