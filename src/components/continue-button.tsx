import { ActionSwapRoll } from '@/components/action-swap-roll';

export interface ContinueButtonProps {
  /** Called immediately on tap (before the roll animation completes). */
  onPress?: () => void;
  /**
   * Greys out the button and blocks interaction.
   * Set to `true` when the amount is 0 or exceeds the available balance.
   */
  disabled?: boolean;
}

/**
 * Primary "Send" CTA.
 *
 * Delegates entirely to {@link ActionSwapRoll}:
 * - Idle: shows "Send" label.
 * - After tap: label rolls out, spinner + "Processing…" rolls in.
 * - Reset: parent bumps the `key` prop (`buttonKey` in `SendMoneyScreen`) when
 *   the confirm sheet is dismissed, which remounts this component back to idle.
 */
export function ContinueButton({ onPress, disabled }: ContinueButtonProps) {
  return <ActionSwapRoll onPress={onPress} disabled={disabled} />;
}
