import { ActionSwapCascade } from '@/components/action-swap-cascade';

export interface ContinueButtonProps {
  /** Tap handler. No-op by default (there is no next screen yet). */
  onPress?: () => void;
}

/**
 * Primary "Continue" CTA.
 *
 * Delegates to {@link ActionSwapCascade} which animates the label out
 * letter-by-letter on press and replaces it with a spinner.
 */
export function ContinueButton({ onPress }: ContinueButtonProps) {
  return <ActionSwapCascade onPress={onPress} />;
}
