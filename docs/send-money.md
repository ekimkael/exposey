# Send Money — rn.ui

Reproduction fidèle d'un écran "Send Money" de wallet mobile (transfert d'argent entre comptes).

## À propos du projet

**rn.ui** est un dépôt de reproductions d'interfaces mobiles construit avec Expo SDK 56.

| Branche | Contenu |
|---------|---------|
| `main` | Template Expo 56 vierge — la base |
| `feat/<nom>` | Une reproduction d'écran par branche |

Cette branche (`feat/send-money-screen`) contient la reproduction de l'écran Send Money.

## Ce qui a été reproduit

Un écran de transfert d'argent avec :

- **Carte destinataire** — nom, banque, numéro de compte
- **Saisie du montant** — clavier numérique custom, affichage deux tons (dollars / centimes)
- **3 animations de saisie** interchangeables via le menu : Scale Pulse, Flip (slot machine), Fondu
- **Feedback d'erreur** — rouge + shake + haptic quand le montant dépasse le solde disponible, clavier bloqué
- **Solde disponible** — affiché avec icône carte de crédit
- **Bouton Continue natif** — SwiftUI `borderedProminent` sur iOS, Jetpack Compose `Button` sur Android
- **Menu toolbar iOS** — animation picker + theme picker dans la barre de navigation
- **Thème light / dark / system** — suit l'OS ou se force depuis le menu

## Stack technique

| | |
|--|--|
| Runtime | Expo SDK 56, React Native 0.85.3 |
| Navigation | expo-router 56.2.11 |
| Animations | React Native Reanimated v4 |
| UI natif | `@expo/ui` — SwiftUI (iOS), Jetpack Compose (Android) |
| Typographie | Open Runde (SF Pro Rounded open-source) |
| Haptics | expo-haptics |
| Theming | React context — light / dark / system |

## Prérequis

- Node.js ≥ 18
- npm ou yarn
- [Expo Go](https://expo.dev/go) (iOS / Android) pour le mode JS-only
- Xcode (iOS simulator) ou Android Studio pour le dev build natif

## Lancer le projet en local

### 1. Cloner et installer

```bash
git clone https://github.com/ekimkael/rn.ui.git
cd rn.ui
git checkout feat/send-money-screen
npm install
```

### 2. Démarrer (Expo Go — recommandé pour commencer)

```bash
npx expo start
```

Scanner le QR code avec l'app Expo Go. Toutes les fonctionnalités JS sont disponibles : layout, polices, clavier, animations, feedback d'erreur, thèmes.

### 3. Dev build — pour les fonctionnalités natives

Le bouton Continue natif et le menu toolbar iOS nécessitent un **custom dev build** (pas disponible dans Expo Go) :

```bash
npx expo run:ios        # iOS simulator
npx expo run:android    # Android emulator
```

> Xcode doit être installé pour `run:ios`, Android Studio pour `run:android`.

### 4. Web

```bash
npx expo start --web
```

Le bouton Continue tombe sur le fallback `Pressable` RN. Le toolbar menu iOS n'apparaît pas.

## Lancer les tests

`lib/amount.test.ts` est un self-check sans dépendances. Requiert Node 24+ (strip types natif) :

```bash
cd src/lib
sed 's#\./amount#./amount.ts#' amount.test.ts > _amt.test.mts \
  && node --experimental-strip-types _amt.test.mts; rm -f _amt.test.mts
```

Affiche `ok` en cas de succès.

## Lint

```bash
npm run lint
```

---

## Architecture

La route est composition-only ; chaque section est un composant isolé et présentationnel. L'état vit dans l'écran et descend via props.

```
src/
  app/
    _layout.tsx              Charge Open Runde, définit le Stack + ThemeProvider
    index.tsx                SendMoneyScreen — composition + état
  components/
    send-money-header.tsx    HeaderPill (titre nav) + HeaderMenu (menus animation + thème, iOS)
    recipient-card.tsx       Bloc destinataire
    amount-display.tsx       Montant animé + feedback erreur + ANIMATION_OPTIONS
    available-balance.tsx    Ligne "Available: $…"
    error-banner.tsx         Bannière "solde dépassé"
    amount-keypad.tsx        Clavier numérique (présentationnel)
    continue-button.tsx      CTA natif par plateforme (SwiftUI / Compose / web)
  lib/
    amount.ts                applyKey / splitAmount — logique de saisie monétaire pure
    amount.test.ts           Self-check assert (voir "Tests")
    fonts.ts                 Constantes famille Open Runde
  theme/
    tokens.ts                Palettes light + dark (ThemeColors)
    theme-context.tsx        ThemeProvider + useTheme()
  assets/fonts/              OpenRunde-{Regular,Medium,Semibold,Bold}.otf
```

## État

`SendMoneyScreen` contient exactement deux états :

| État | Type | Signification |
|------|------|---------------|
| `amount` | `string` | Montant brut tapé, commence à `"0"` |
| `animationStyle` | `AnimationStyle` | Animation choisie dans le menu |

La préférence de thème (`system`/`light`/`dark`) vit dans `ThemeProvider`, pas dans l'écran.

Dérivé : `isBalanceExceeded = parseFloat(amount) > AVAILABLE_BALANCE`. Quand vrai, le clavier se bloque (sauf backspace) et `AmountDisplay` déclenche le feedback d'erreur.

## Saisie du montant (`lib/amount.ts`)

Le montant est une **chaîne brute**, pas un nombre — l'affichage correspond exactement aux touches (`"0."`, point final, etc.) sans arrondi flottant.

- `applyKey(value, key)` — applique une pression (`0`–`9`, `.`, ou `DELETE_KEY`). Règles : un seul point décimal, max 2 chiffres après la virgule, pas de zéro initial.
- `splitAmount(value)` — découpe en `{ dollars, cents }` pour l'affichage deux tons.

## Animations (`amount-display.tsx`)

Construit avec **Reanimated v4**. Deux préoccupations indépendantes :

1. **Animation de saisie** — choisie par l'utilisateur (`pulse` | `flip` | `fade`) :
   - `pulse` : le montant entier scale `1 → 1.08 → 1` à chaque touche.
   - `flip` : slide slot-machine, clippé dans un viewport hauteur fixe (remount sur `amount`).
   - `fade` : chaque chiffre fade in/out indépendamment (remount par caractère via `key`).
2. **Feedback d'erreur** — toujours actif, indépendant de l'animation : quand `exceeded` passe à vrai, les dollars cross-fadent noir↔rouge, le montant shake, et un buzz haptic se déclenche (natif uniquement).

Tous les hooks Reanimated sont déclarés inconditionnellement avant les branches de style, respectant les règles des hooks.

Pour ajouter une animation : étendre `AnimationStyle`, ajouter une entrée dans `ANIMATION_OPTIONS` (label + SF Symbol), et ajouter une branche dans `AmountDisplay`. Le menu se construit lui-même depuis `ANIMATION_OPTIONS`.

## Thème (`theme/`)

Light, dark et system sont supportés.

- `tokens.ts` exporte deux palettes (`lightColors`, `darkColors`) partageant les clés `ThemeColors`. Ne jamais importer une palette directement.
- `theme-context.tsx` fournit `ThemeProvider` et le hook `useTheme()`, retournant `{ colors, mode, setMode, scheme }`. `mode` est la préférence (`system | light | dark`) ; `scheme` est la valeur résolue `light | dark`.
- La barre de navigation et la status bar suivent `scheme` (voir `ThemedStack` dans `_layout.tsx`).
- La préférence est **en mémoire uniquement** — non persistée entre les lancements. Pour persister, ajouter du storage dans `ThemeProvider`.

Pour ajouter une couleur : ajouter la clé dans `ThemeColors` et dans LES DEUX palettes.

## Conventions de style

- Les couleurs viennent de `useTheme().colors` — jamais de valeur hex inline.
- Polices : styler avec `fontFamily: font.*` (PAS `fontWeight`) ; chaque graisse Open Runde est une famille enregistrée séparément.
- Les styles Reanimated doivent utiliser des chaînes hex statiques (pas `PlatformColor`) ; les valeurs de palette sont des chaînes simples, elles fonctionnent dans les worklets.
- Coins arrondis : `borderCurve: 'continuous'`, sauf capsules (`borderRadius: 999`).

## Notes plateforme

- `HeaderMenu` (`Stack.Toolbar`) est **iOS uniquement** ; ne rend rien sur Android/web. La pill de titre apparaît partout.
- `ContinueButton` switche d'implémentation via `process.env.EXPO_OS` (constante Metro). Les variantes natives utilisent la police système ; seul le fallback web utilise Open Runde.
- Le bouton retour est intentionnellement retiré (`headerBackVisible: false`).
- Les `require()` de `@expo/ui` sont lazies (à l'intérieur des blocs `if`) : `@expo/ui/swift-ui` est un module natif iOS qui planterait au chargement sur Android si importé au top-level.
