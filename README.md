# Exposey

Bac à sable pour reproduire fidèlement des interfaces et animations mobiles
(vidéos ou screenshots de référence) avec **Expo Router** et des composants
natifs (`@expo/ui` SwiftUI / Jetpack Compose, Reanimated).

Chaque écran/animation reproduit vit sur **sa propre branche**, indépendante
de `main` — `main` ne contient que le template Expo de base. Aucune branche
n'est fusionnée dans une autre : elles sont chacune un exercice de
reproduction autonome.

## Stack

- [Expo SDK 56](https://docs.expo.dev/) + Expo Router (file-based routing)
- React Native 0.85, React 19
- `@expo/ui` (SwiftUI / Jetpack Compose) pour les composants natifs
- React Native Reanimated + Gesture Handler pour les animations/gestes

## Démarrer

```bash
npm install
npx expo start
```

Ouvre ensuite dans un [development build](https://docs.expo.dev/develop/development-builds/introduction/),
un simulateur iOS, un émulateur Android, ou [Expo Go](https://expo.dev/go).

## Branches

| Branche | Description |
|---|---|
| [`feat/family-morphing-sheet`](https://github.com/ekimkael/exposey/tree/feat/family-morphing-sheet) | Bottom sheet "wallet familial" avec transition morphing, header natif toolbar et boutons Liquid Glass (iOS 26), via `@expo/ui` SwiftUI. |
| [`feat/featured-music-ui`](https://github.com/ekimkael/exposey/tree/feat/featured-music-ui) | UI de mise en avant musicale avec aperçus vidéo et vue détail en zoom. |
| [`feat/gatesware-trip-detail`](https://github.com/ekimkael/exposey/tree/feat/gatesware-trip-detail) | Écran détail voyage (type Airbnb/Gatesware) : stats de trip, cartes restaurants, stories façon Instagram/Snap, grilles lieux/hôtels. |
| [`feat/invest-onboarding`](https://github.com/ekimkael/exposey/tree/feat/invest-onboarding) | Flow d'onboarding et d'authentification pour une app d'investissement. |
| [`feat/mindfulness-morph`](https://github.com/ekimkael/exposey/tree/feat/mindfulness-morph) | Écran de méditation avec transition morphing pilule → photo de plage, bouton "Apple Intelligence" à halo animé (SVG gradient). |
| [`feat/onboarding-carousel`](https://github.com/ekimkael/exposey/tree/feat/onboarding-carousel) | Carrousel d'onboarding avec globe animé (app "Remindo"). |
| [`feat/send-money-screen`](https://github.com/ekimkael/exposey/tree/feat/send-money-screen) | Écran d'envoi d'argent : form sheet natif, clavier numérique, animations de montant, confirmation biométrique qui morph en écran de succès. |
| [`feat/slash-login-hero-card`](https://github.com/ekimkael/exposey/tree/feat/slash-login-hero-card) | Écran de login ("Onyx") avec éventail de cartes qui se replie en pile au focus clavier. |
| [`feat/value-prop-onboarding`](https://github.com/ekimkael/exposey/tree/feat/value-prop-onboarding) | Écran d'onboarding à messages défilants (app "Remindo") avec dégradé radial et bouton CTA à particules. |

Chaque branche contient généralement son propre `README.md`/`AGENTS.md`
détaillant l'écran reproduit, les choix techniques et les pièges rencontrés.

## Commandes disponibles

- `/reproduce-ui` — reproduire une référence (vidéo ou image) fournie en pièce jointe.
- `/animation-brief` — spécifier une animation par questions à choix avant implémentation.
- `/quality-pass` — passe de nettoyage/refactoring/documentation sur une branche déjà implémentée.
