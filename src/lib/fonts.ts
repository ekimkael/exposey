/**
 * Open Runde font family names.
 *
 * Open Runde is an open-source rounded typeface (an alternative to Apple's
 * SF Pro Rounded, which cannot be redistributed). The `.otf` files live in
 * `assets/fonts/` and are registered in {@link file://./../app/_layout.tsx}
 * via `useFonts`.
 *
 * Each weight is registered as its own family, so style with `fontFamily`
 * (NOT `fontWeight`) — `fontWeight` has no effect on these faces.
 *
 * @example
 * <Text style={{ fontFamily: font.semibold }}>Send Money</Text>
 */
export const font = {
  /** Weight 400. */
  regular: 'OpenRunde-Regular',
  /** Weight 500. */
  medium: 'OpenRunde-Medium',
  /** Weight 600. */
  semibold: 'OpenRunde-Semibold',
  /** Weight 700. */
  bold: 'OpenRunde-Bold',
} as const;
