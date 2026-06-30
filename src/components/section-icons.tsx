/**
 * Section header badge icons — Tabler filled icon set, scaled to 13×13 for
 * use inside the 24×24 colored badge circle in SectionHeader.
 *
 * Each export is a zero-argument function component so it can be called
 * lazily and re-rendered without creating JSX element values at module level.
 */
import Svg, { Path } from 'react-native-svg';

const SIZE = 13;

/** Tabler filled: tools-kitchen-2 — used for Restaurants section. */
export function KitchenIcon() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="#fff">
      <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <Path d="M18.94 2.002l.1-.001l.096.008l.095.018l.094.027l.092.037l.086.045l.08.052l.076.06l.076.074l.06.072l.03.04l.051.084l.043.088l.034.091l.025.094l.02.15l.002 18.059a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1v-1h-4a1 1 0 0 1-1-.994c-.033-5.323.97-8.482 5.005-12.434l.317-.307l.072-.06l.04-.03l.084-.051l.088-.043l.091-.034l.094-.025zm-7.94.998a1 1 0 0 1 1 1v3a4 4 0 0 1-3 3.874v10.126a1 1 0 0 1-2 0v-10.126a4 4 0 0 1-3-3.874v-3a1 1 0 1 1 2 0v3a2 2 0 0 0 1 1.732v-4.732a1 1 0 1 1 2 0l.001 4.732a2 2 0 0 0 .999-1.732v-3a1 1 0 0 1 1-1" />
    </Svg>
  );
}

/** Tabler filled: car — used for Places to Visit section. */
export function CarIcon() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="#fff">
      <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <Path d="M14 5a1 1 0 0 1 .694.28l.087.095l3.699 4.625h.52a3 3 0 0 1 2.995 2.824l.005.176v4a1 1 0 0 1-1 1h-1.171a3.001 3.001 0 0 1-5.658 0h-4.342a3.001 3.001 0 0 1-5.658 0h-1.171a1 1 0 0 1-1-1v-6l.007-.117l.008-.056l.017-.078l.012-.036l.014-.05l2.014-5.034a1 1 0 0 1 .928-.629zm-7 11a1 1 0 1 0 0 2a1 1 0 0 0 0-2m10 0a1 1 0 1 0 0 2a1 1 0 0 0 0-2m-6-9h-5.324l-1.2 3h6.524zm2.52 0h-.52v3h2.92z" />
    </Svg>
  );
}

/** Tabler filled: home-2 — used for Hotels section. */
export function HomeIcon() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="#fff">
      <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <Path d="M12.707 2.293l9 9c.63.63.184 1.707-.707 1.707h-1v6a3 3 0 0 1-3 3h-10a3 3 0 0 1-3-3v-6h-1c-.89 0-1.337-1.077-.707-1.707l9-9a1 1 0 0 1 1.414 0m.793 8.707h-3a1.5 1.5 0 0 0-1.5 1.5v3a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5v-3a1.5 1.5 0 0 0-1.5-1.5" />
    </Svg>
  );
}
