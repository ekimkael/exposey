# Magpie — bookmark/explore hero animation

A single looping hero animation reproduced from a reference video of an
onboarding screen (app "Sortd."), renamed **Magpie** — a bird that hoards
shiny objects, matching the "hoarding" theme of the source.

## What it demonstrates

One continuous loop on the home screen:

1. Five colored cards fall from above and slide behind a bookmark icon —
   the opaque icon covers them near the end of their travel (z-order
   occlusion, not a shrink effect). Each card lands with a "gulp": the icon
   briefly widens and squashes, like a bite being swallowed.
2. The icon rotates 45° into an "explore" pose.
3. An orbit of app icons (on two rings) fades in, then does one full spin.
4. The tagline underneath types out, then erases and retypes a second
   phrase, in sync with the icon's state.
5. The loop restarts — the subline erases before the headline retypes, so
   there's no jump-cut.

## Prerequisites

- Xcode + iOS Simulator (primary target platform)
- Node.js + npm
- CocoaPods (`pod`), with `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8` set — see
  [AGENTS.md](./AGENTS.md#pitfalls) for why.

## Install & run

```bash
npm install
npx expo prebuild -p ios   # only needed once, or after native-affecting changes
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios
```

This is a **custom dev client** app (not Expo Go) — the template ships with
`ios/` checked out of git (gitignored) and needs a native build.

## Platforms

- **iOS**: fully verified on Simulator.
- **Android / web**: not verified. The orbit icons use SF Symbol names
  directly; `expo-symbols` needs a `{ios, android, web}` name mapping to
  render on those platforms, which isn't implemented here (see AGENTS.md).

## Known limitations

- The "Get Started" button has no destination screen — out of scope for an
  animation reproduction exercise.
- Android/web icon rendering (see above).

## Project docs

See [AGENTS.md](./AGENTS.md) for where the animation logic lives, how to
reuse it elsewhere, and the pitfalls hit while building it.
