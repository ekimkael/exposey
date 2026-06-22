/**
 * Fixed palette + mock data for the Featured music screen.
 *
 * The colours are taken straight from the reference design (white page, one
 * dark card, one amber card) rather than the system light/dark theme — this
 * screen is a faithful visual reproduction, not a themed surface.
 */
export const palette = {
  /** Page background behind the cards. */
  background: '#FFFFFF',
  /** Primary heading / icon colour on the page chrome. */
  ink: '#15110D',
  /** Muted label colour (dates, stats, inactive chrome). */
  muted: '#9A968F',
  /** Hairline used under the header. */
  hairline: '#EFEDE9',
  /** The white control button at the centre of each card. */
  controlBg: '#FFFFFF',
} as const;

/** A card's own colour scheme — cards alternate dark/amber like the reference. */
export interface CardTheme {
  /** Card surface colour. */
  surface: string;
  /** Title + author text colour on the surface. */
  text: string;
  /** Secondary text (date, stats) on the surface. */
  textMuted: string;
  /** Tint for the play-glyph inside the white control button. */
  controlGlyph: string;
}

const darkCard: CardTheme = {
  surface: '#161513',
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.55)',
  controlGlyph: '#161513',
};

const amberCard: CardTheme = {
  surface: '#F4B73F',
  text: '#211A07',
  textMuted: 'rgba(33,26,7,0.6)',
  controlGlyph: '#211A07',
};

/** One featured playlist card. */
export interface Playlist {
  id: string;
  /** Channel/author shown above the title (rendered upper-case). */
  author: string;
  /** Date label under the author. */
  date: string;
  /** Big card title. */
  title: string;
  /** Play count, pre-formatted. */
  plays: string;
  /** Total duration, pre-formatted. */
  duration: string;
  /** Author avatar (remote — pravatar). */
  avatar: string;
  /** Looping muted preview clip (remote — Mixkit, free license). */
  video: string;
  /** Still frame shown over the video while it buffers (matches the clip). */
  poster: string;
  /** Blurb shown on the detail screen. */
  description: string;
  theme: CardTheme;
}

/** A track row on the detail screen. */
export interface Track {
  title: string;
  artist: string;
  duration: string;
}

/** Mock tracklist reused across playlists (UI demo only). */
export const SAMPLE_TRACKS: Track[] = [
  { title: 'Take On Me', artist: 'a-ha', duration: '3:48' },
  { title: 'Sweet Dreams', artist: 'Eurythmics', duration: '4:52' },
  { title: 'Billie Jean', artist: 'Michael Jackson', duration: '4:54' },
  { title: 'Every Breath You Take', artist: 'The Police', duration: '4:13' },
  { title: 'Tainted Love', artist: 'Soft Cell', duration: '2:41' },
  { title: 'Blue Monday', artist: 'New Order', duration: '7:29' },
  { title: 'Where Is My Mind', artist: 'Pixies', duration: '3:53' },
  { title: 'Just Like Heaven', artist: 'The Cure', duration: '3:32' },
  { title: 'Africa', artist: 'Toto', duration: '4:55' },
  { title: "Don't You (Forget About Me)", artist: 'Simple Minds', duration: '4:20' },
  { title: 'Enjoy the Silence', artist: 'Depeche Mode', duration: '6:12' },
  { title: 'Под небом', artist: 'Kino', duration: '4:34' },
  { title: 'Bizarre Love Triangle', artist: 'New Order', duration: '4:21' },
  { title: 'Once in a Lifetime', artist: 'Talking Heads', duration: '4:19' },
  { title: 'Personal Jesus', artist: 'Depeche Mode', duration: '4:56' },
  { title: 'Running Up That Hill', artist: 'Kate Bush', duration: '5:03' },
];

/** Find a playlist by its route id. */
export const findPlaylist = (id?: string) => PLAYLISTS.find((p) => p.id === id);

/**
 * Mock featured playlists. Preview clips are streamed from Mixkit (free
 * license, no attribution required) and avatars from pravatar, so the screen
 * works without bundling large binaries; swap for local assets when shipping
 * offline.
 */
export const PLAYLISTS: Playlist[] = [
  {
    id: '80s-smash-hits',
    author: 'Perfect Oldies',
    date: 'July 2019',
    title: '80s Smash Hits',
    plays: '9,543',
    duration: '8h 35m',
    avatar: 'https://i.pravatar.cc/120?img=15',
    // Mixkit (free license): nostalgic girl at a bus window — retro vintage feel.
    video: 'https://assets.mixkit.co/videos/47442/47442-360.mp4',
    poster: 'https://assets.mixkit.co/videos/47442/47442-thumb-720-0.jpg',
    description:
      'The biggest anthems of the decade, remastered. Neon synths, shoulder pads, and choruses built for stadiums.',
    theme: darkCard,
  },
  {
    id: 'cinematic-ambient',
    author: 'Ambient Universe',
    date: 'July 2018',
    title: 'Cinematic Ambient',
    plays: '6,632',
    duration: '5h 35m',
    avatar: 'https://i.pravatar.cc/120?img=32',
    // Mixkit (free license): woman dancing in a cloud of smoke — cinematic, moody.
    video: 'https://assets.mixkit.co/videos/33899/33899-360.mp4',
    poster: 'https://assets.mixkit.co/videos/33899/33899-thumb-720-0.jpg',
    description:
      'Slow-building scores and widescreen textures for deep focus, late drives, and staring out of windows.',
    theme: amberCard,
  },
  {
    id: 'late-night-jazz',
    author: 'Blue Note Radio',
    date: 'March 2020',
    title: 'Late Night Jazz',
    plays: '4,201',
    duration: '6h 12m',
    avatar: 'https://i.pravatar.cc/120?img=8',
    // Mixkit (free license): cigarette smoke on black — late-night jazz mood.
    video: 'https://assets.mixkit.co/videos/8537/8537-360.mp4',
    poster: 'https://assets.mixkit.co/videos/8537/8537-thumb-720-0.jpg',
    description:
      'Smoky standards and after-hours improvisation. Pour something dark and let the brass do the talking.',
    theme: darkCard,
  },
];

/** Categories for the native dropdown in the header. */
export const CATEGORIES = ['Featured', 'New', 'Popular', 'Charts'] as const;
export type Category = (typeof CATEGORIES)[number];
