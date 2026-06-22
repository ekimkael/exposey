import { View } from 'react-native';

import { PlayButton } from '@/components/play-button';
import { RoundIconButton } from '@/components/round-icon-button';

interface TransportControlsProps {
  /** SF Symbols rendered to the left of the play button. */
  leftIcons: string[];
  /** SF Symbols rendered to the right of the play button. */
  rightIcons: string[];
  /** Whether the media is playing (drives the central glyph). */
  playing: boolean;
  /** Tint of the play/pause glyph. */
  glyph: string;
  onTogglePlay: () => void;
}

/**
 * The media transport row shared by the card and the detail hero: a set of
 * round side buttons flanking the central {@link PlayButton}. The side icons
 * are decorative in this UI demo (no handlers) — only play/pause is wired.
 */
export function TransportControls({ leftIcons, rightIcons, playing, glyph, onTogglePlay }: TransportControlsProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      {leftIcons.map((icon) => (
        <RoundIconButton key={icon} icon={icon} />
      ))}
      <PlayButton playing={playing} glyph={glyph} onPress={onTogglePlay} />
      {rightIcons.map((icon) => (
        <RoundIconButton key={icon} icon={icon} />
      ))}
    </View>
  );
}
