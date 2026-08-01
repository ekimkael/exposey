# Papyrus — cylindrical coverflow filmstrip

Reproduction of a reading-log photo viewer: a hero photo with its date, and a
bottom filmstrip whose thumbnails wrap around a cylinder. Scrolling the strip
swaps the hero.

The reference is a screen recording; every constant below was measured off it
rather than guessed (see [Geometry](#geometry)).

## Run

```bash
npm install && npm run ios
```

A development build is required — `expo-symbols` needs native code, so Expo
Go will not do.

## Platforms

iOS is the target. Android gets the same tree for free: the whole effect is
`transform` on a Reanimated `ScrollView`, with no platform-specific code. The
only iOS-only piece is `SymbolView` (SF Symbols) in the header, which falls
back to nothing on Android — swap in Material symbols there if it matters.

## Geometry

Each thumbnail is transformed as `perspective → translateX → rotateY`, driven
by `distance`, its signed offset from the centre in item units:

| Constant | Value | How it was derived |
|---|---|---|
| `ITEM` | 85pt | centred face measured 86.4 × 84.4pt |
| `STRIDE` | 102pt | equals the fitted `R · Δ`, so the centre tracks the finger 1:1 |
| `STEP_DEG` | 30.5° | width falloff at d=1 and d=2 fits `W·cos(dΔ)` — both give 30.5°/30.4° |
| `RADIUS` | `STRIDE / STEP_rad` | derived, not tuned — 187.9pt against 191/193 fitted |
| `PERSPECTIVE` | 500pt | trapezoid near/far edge ratio; measured 1.159 at d=2 vs 1.161 predicted |

Faces land at `RADIUS · sin(angle)` instead of their flat scroll position.
That is what packs the outer entries together; rotating them in place would
let the gaps grow as the faces foreshorten.

The constants were fitted on the at-rest reference frame, using ratios that
are independent of the video's pixel scale, then checked against a mid-scroll
frame they were not fitted to:

| | at rest (fitted) | mid-scroll (held out) |
|---|---|---|
| d=0.5 | — | 49.4pt vs 49.6pt measured |
| d=1 | 95.7pt vs 96.9pt | — |
| d=1.5 | — | 134.6pt vs 134.9pt measured |
| d=2 | 165.8pt vs 168.9pt | — |

## Deliberate differences from the reference

- **The hero updates immediately.** In the reference it visibly lags the
  centred thumbnail during fast scrolls — several items behind — which reads
  as update throttling in the original app rather than intent.
- **The header buttons are inert.** Nothing in the reference shows what they do.
- **The app icon is still the Expo template's.** The reference never shows one.
- **The snow scene has no book in frame.** The reference uses personal photos;
  every stand-in below shows an actual open book except this one — no
  free-license "book + snow" photo turned up, so it is a cabin-through-a-window
  shot instead.

## Photo credits

`assets/scenes/` are free-license photos from Unsplash (Unsplash License —
free for commercial and personal use), substituting for the personal photos
in the reference:

| File | Photographer |
|---|---|
| 01-beach.jpg | [Jessica Mangano](https://unsplash.com/photos/an-open-book-sitting-on-top-of-a-sandy-beach-t0foNCVk6uo) |
| 02-cafe.jpg | [American Heritage Chocolate](https://unsplash.com/photos/an-open-book-on-a-table-next-to-a-cup-of-coffee-uwXQAoTq2wU) |
| 03-plane.jpg | [Janice Kwong](https://unsplash.com/photos/a-man-reading-a-book-on-an-airplane-kOCGv96q0jc) |
| 04-bedside.jpg | [Aaron Burden](https://unsplash.com/photos/open-white-and-blue-book-beside-table-lamp--n_ZpsjsqHM) |
| 05-park.jpg | [Aaron Burden](https://unsplash.com/photos/open-book-rests-on-a-weathered-park-bench-2TSHyqTRbUg) |
| 06-train.jpg | [Adrien Olichon](https://unsplash.com/photos/a-person-is-reading-a-book-on-a-train-I6rhlEGhe4k) |
| 07-kitchen.jpg | [Aaron Burden](https://unsplash.com/photos/an-open-book-lies-on-a-dark-wooden-table-UZ6hfdbuEqs) |
| 08-balcony.jpg | [Austin Distel](https://unsplash.com/photos/man-reading-book-on-balcony-during-daytim-M20JaYyW1KI) |
| 09-library.jpg | [Nejc Soklič](https://unsplash.com/photos/a-library-with-books-on-shelves-POlLqIPWR3c) |
| 10-bath.jpg | [Thought Catalog](https://unsplash.com/photos/woman-lying-on-bathtub-with-green-book-LBavvsn86DE) |
| 11-forest.jpg | [maria paula contreras](https://unsplash.com/photos/book-open-on-dried-leaves-top-view-photography-uGs6RoFSOi8) |
| 12-desk.jpg | [byVlado](https://unsplash.com/photos/open-book-with-illuminated-pages-in-dim-light-k3tHnRwtTso) |
| 13-snow.jpg | [Lukas Seitz](https://unsplash.com/photos/a-cabin-in-the-snow-seen-through-a-window-ivGTMYRw2pI) |
| 14-hammock.jpg | [Radek Grzybowski](https://unsplash.com/photos/woman-reading-book-on-hammock-dunnqE0fcfY) |
