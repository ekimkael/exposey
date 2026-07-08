## Contexte
Je te fournis en pièce jointe une **vidéo ou une image** de référence.
Ta mission : reproduire fidèlement ce qu'elle montre — ça peut être une
interface statique, une animation (ex. morphing / shared element
transition), ou un flow complet entre plusieurs écrans.

<!-- [Optionnel : décris ici en 1-2 phrases ce que montre la référence,
ex. "un bouton qui s'ouvre en page via un container transform"] -->

$ARGUMENTS

## Prérequis outillage
- Vérifie que `ffmpeg` et `imagemagick` sont disponibles ; sinon,
  installe-les via Homebrew avant de continuer.
- Si le plugin Expo est installé (expo@claude-plugins-official),
  privilégie l'**Expo MCP** quand il est disponible : docs Expo à jour
  à la demande, `npx expo install`, screenshots du simulateur.
- Une fois dans le projet, lance `npx expo doctor` pour vérifier
  l'environnement et la compatibilité SDK ; corrige les problèmes
  signalés avant d'avancer.

## Setup Git
1. **Vérifie l'état du repo** (`git status`) : s'il y a des changements
   non commités sur la branche courante, commit-les avec un message
   clair et **push** la branche avant toute chose. Ne perds jamais de
   travail en cours.
2. Reviens sur `main` et pars de là (assure-toi qu'elle est à jour :
   `git pull`).
3. Crée une branche nommée d'après la tâche (ex. `feat/morph-button-transition`).

## Nom de l'application
- Donne un **nom unique** à l'app : choisis un nom d'animal, de plante,
  de fruit ou de minéral (ex. `Fennec`, `Baobab`, `Litchi`, `Onyx`) —
  jamais de nom générique type `rn.ui`, `demo-app` ou `my-app`.
- Applique-le partout où c'est pertinent : `name` et `slug` dans
  `app.json`, `displayName`, bundle identifier au format
  `net.digitalekim.<nomapp>` (ex. `net.digitalekim.fennec`) — le même
  pour `ios.bundleIdentifier` et `android.package` — et le titre
  affiché sur l'écran d'accueil du simulateur.
- Si possible, choisis un nom qui a un lien (même lointain ou
  humoristique) avec l'animation/l'UI à reproduire.

## Analyse de la référence

### Si c'est une vidéo
1. **Inspecte d'abord les métadonnées** : `ffprobe` pour obtenir durée,
   FPS et résolution. Adapte ta stratégie d'extraction en conséquence.
2. **Extraction en deux passes** — redimensionne systématiquement les
   frames (`-vf scale=480:-1`) pour économiser le contexte, la pleine
   résolution n'est utile que ponctuellement (couleurs exactes, détail
   d'un asset) :
   - *Passe 1 — vue d'ensemble* : extrais ~1 frame toutes les 200-300ms
     sur toute la durée, puis assemble-les en **planches contact**
     (grilles de 4×4 via `ffmpeg` tile ou ImageMagick `montage`) pour
     visualiser le déroulé global en peu d'images.
   - *Passe 2 — zoom sur l'animation* : identifie le(s) segment(s) où ça
     bouge, puis ré-extrais ce segment à **haute densité** (toutes les
     frames, ou 1 sur 2 si le FPS est élevé) :
     `ffmpeg -ss <début> -to <fin> -i video.mp4 -vf scale=480:-1 /tmp/frames/anim_%03d.png`
3. **Détection automatique des changements de scène** en complément :
   `ffmpeg -i video.mp4 -vf "select='gt(scene,0.1)',showinfo" ...`
   pour repérer les transitions d'écran et les moments clés sans les
   chercher à la main.
4. **Analyse du mouvement** : compare les frames consécutives du segment
   d'animation pour déterminer :
   - quels éléments persistent (candidats au shared element),
   - quels éléments apparaissent/disparaissent (fade, slide),
   - la trajectoire et la vitesse (position d'un même élément frame
     par frame → en déduire la courbe d'easing : ease-out ? spring
     avec rebond ? linéaire ?),
   - la **durée exacte** de chaque phase (nb de frames ÷ FPS).
5. Stocke tout dans `/tmp/frames/` (exclu du repo).

### Si c'est une image
- Analyse la composition, les couleurs exactes, la typo, les espacements.

### Livrable de l'analyse (AVANT de coder)
Produis un court **storyboard écrit** :
- liste des écrans/états,
- chronologie de l'animation (état A → transition de X ms avec easing Y
  → état B),
- inventaire des éléments UI et des assets à générer,
- ta compréhension du mécanisme (ex. "container transform du bouton
  vers la page, l'icône persiste en shared element").
Attends ma validation de ce storyboard si un point te semble ambigu ;
sinon documente tes hypothèses et continue.

## Stack et contraintes techniques
- Cible prioritaire : **iOS (Simulateur iPhone)**. Si l'équivalent
  Android est faisable sans dégrader iOS, fais-le aussi — sinon iOS
  d'abord, et note ce qui manque côté Android.
- Reste sur des **composants natifs** avec `@expo/ui`, en suivant
  cette échelle de décision :
  1. **Couche universelle** d'abord (`@expo/ui` universel : un seul
     arbre pour iOS + Android) — c'est elle qui maximise le "Android
     gratuit" ;
  2. Descends au **spécifique plateforme** (/Expo UI SwiftUI,
     /Expo UI Jetpack Compose) uniquement si la couche universelle
     ne couvre pas le besoin (animation/transition trop native).
  Appuie-toi sur /building-native-ui pour les patterns généraux.
- **Vérifie le SDK Expo du projet** et adapte le runtime :
  - SDK 56+ → la couche universelle `@expo/ui` fonctionne dans
    **Expo Go** (itération plus rapide) ;
  - SDK < 56 ou couches SwiftUI/Compose spécifiques → **development
    build** requis (`npx expo run:ios`), pas Expo Go.
- **Avant d'implémenter une transition/animation complexe** : liste les
  approches possibles (ex. expo-router transitions, Reanimated shared
  transitions, API native SwiftUI via Expo UI) avec leur statut
  (stable / expérimental / déprécié) vérifié dans les docs à jour,
  et justifie ton choix en une phrase.
- **Anti-hallucination API** (dans cet ordre de fiabilité) :
  1. Pour tout composant `@expo/ui`, fetch sa doc versionnée AVANT
     usage : `https://docs.expo.dev/versions/v<SDK>/sdk/ui/swift-ui/{component}/index.md`
     (idem `jetpack-compose`) ;
  2. Côté Compose, lis les `.d.ts` du package installé pour confirmer
     la signature exacte ;
  3. use context7 et les docs officielles (Expo, React Native,
     SwiftUI, Compose) pour le reste. Ne devine jamais une API.
- **Dépendances** : toujours `npx expo install` (jamais `npm install`
  directement) pour garantir la compatibilité SDK.

## Pièges connus & performance

### @expo/ui
- Tout arbre SwiftUI/Compose doit être enveloppé dans `<Host>`
  (`matchContents` pour la taille intrinsèque, `flex: 1` pour
  une taille explicite).
- **Cause n°1 de crash iOS** : un composant rendant du SwiftUI placé
  dans un `RNHostView` sans ancêtre `Host`. Vérifie la frontière
  Host/RNHostView à chaque imbrication RN ↔ natif.
- Styles : utilise `boxShadow` CSS, jamais les styles `shadow*` /
  `elevation` legacy de React Native.

### Performance d'animation (fidélité = fluidité)
- Anime **uniquement `transform` et `opacity`** (propriétés GPU) —
  jamais width/height/margin/top-left, qui déclenchent des layouts.
- Reanimated sur le thread UI ; `useDerivedValue` pour les valeurs
  calculées ; `Gesture.Tap` (gesture-handler) pour les animations
  de press.
- Images : `expo-image` (pas le `Image` RN de base).
- Si l'UI reproduite contient une **liste** : FlashList plutôt que
  FlatList, items mémoïsés (props primitives), callbacks hoistés
  hors du renderItem, pas d'objets de style inline.

## Récupération d'erreur (build/runtime)
- Build iOS échoue → lis les logs Xcode, corrige la dépendance
  native, rebuild `npx expo run:ios`.
- Build Android échoue → `adb logcat` / sortie Gradle, corrige le
  mismatch SDK/NDK, rebuild `npx expo run:android`.
- Module natif introuvable → `npx expo install <module>` (version
  compatible SDK), puis rebuild des couches natives.

## Assets
- Génère les éléments nécessaires (icônes, logos, illustrations)
  en restant le plus proche possible de ceux visibles dans la
  référence. Privilégie le SVG ; place-les dans `assets/`.

## Conventions de code
- TypeScript strict ; `interface` plutôt que `type` pour les objets ;
  pas d'`enum` (utilise des maps/objets `as const`).
- Composants fonctionnels uniquement ; fichiers et dossiers en
  **kebab-case** (ex. `morph-button.tsx`).
- Les routes vivent dans `app/` **exclusivement** — jamais de
  composants, types ou utils co-localisés dedans (mets-les dans
  `components/`, `hooks/`, etc.).
- Alias de chemins dans `tsconfig.json`, préférés aux imports relatifs.
- Navigation : `<Link>` d'expo-router entre les routes.
- Toute string rendue doit être enveloppée dans `<Text>` (sinon crash
  "Text strings must be rendered within a <Text> component").
- Rendu conditionnel : jamais `valeur && <Comp/>` avec une valeur
  potentiellement falsy (`0` s'afficherait) — utilise un ternaire ou
  `Boolean(valeur) && ...`.

## Documentation
- Commentaires **JSDoc** uniquement où c'est réellement utile
  (logique d'animation, timings, workarounds).
- README : quoi, comment lancer, plateformes supportées, limitations.

## Validation (obligatoire avant de conclure)
1. Lance l'app sur le Simulateur iOS.
2. Capture le résultat :
   - UI statique → screenshot (`xcrun simctl io booted screenshot`),
   - animation → **enregistrement vidéo**
     (`xcrun simctl io booted recordVideo /tmp/capture.mp4`), puis
     **découpe ta propre capture en frames** (même méthode que pour la
     référence) — tu ne peux pas visionner une vidéo directement.
3. Compare **frame à frame, côte à côte** avec la référence : mêmes
   moments clés, mêmes durées, même easing. Liste les écarts restants.
4. Itère jusqu'à correspondance visuelle satisfaisante ou explique
   ce qui bloque.
5. **Auto-review avant de conclure** : lance /deep-code-review
   (sans URL → il review la branche courante contre `main`) et
   corrige les findings bloquants avant de me présenter le résultat.

## Dernière étape — renommer la session
Une fois la validation (5) terminée, renomme le titre de la session de
l'outil utilisé (Claude Code, Codex CLI, etc.) pour refléter le nom de
l'app produite et l'UI reproduite (ex. `Fennec — morph button transition`),
afin de ne pas la confondre avec d'autres sessions si je reviens dessus
plus tard. Utilise le mécanisme de renommage natif de l'outil s'il en
expose un ; sinon, mets à jour le titre du terminal (ex.
`printf '\033]0;%s\007' "<titre>"`) pour qu'il reste visible dans l'onglet.

## Avant de démarrer
Si des points sont ambigus, /grill-me — mais présente tes questions
avec des réponses sélectionnables comme le fait /brainstorming.

/ponytail
