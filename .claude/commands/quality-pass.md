# Mission : Passe qualité, nettoyage, refactoring et documentation

> Suite directe de la mission de reproduction UI. Travail sur la branche
> courante (`feat/...`), pas de nouvelle branche.

$ARGUMENTS

## 1. Revue de code
- Parcours tout le code produit et identifie : code mort, duplications,
  composants surchargés, valeurs magiques, logique d'animation mélangée
  au rendu, fichiers et dépendances inutiles.
- Produis un court rapport AVANT toute modification, avec ta stratégie
  de correction et la liste des fichiers à supprimer (avec la raison
  pour chacun).

## 2. Refactoring — Clean Code adapté au projet
- **TypeScript strict** : `"strict": true` dans le tsconfig, zéro `any`,
  props et retours typés partout.
- **Nommage** : noms explicites et cohérents. Hooks en `use*`,
  composants en PascalCase, handlers en `handle*`. Les valeurs
  d'animation portent des noms parlants (`cardScale`, `morphProgress`),
  pas `sv1`, `anim2`.
- **Code d'animation** :
  - Extrais la logique d'animation dans des hooks dédiés
    (ex. `useMorphTransition`) — les composants ne font que du rendu.
  - Centralise timings, easings, dimensions et couleurs dans un fichier
    de constantes (ex. `constants/animation.ts`, `constants/theme.ts`).
    Aucune valeur magique inline.
  - Vérifie que les animations tournent sur le UI thread quand c'est
    possible (worklets Reanimated, pas de `setState` par frame).
- **Découpage** : composants à responsabilité unique, ~200 lignes max
  par fichier sans justification.
- **Contrainte absolue** : aucun changement visuel ni fonctionnel.
  L'animation doit rester identique frame par frame. Re-vérifie sur
  le Simulateur après chaque étape majeure.

## 3. Nettoyage des fichiers inutiles
- Identifie et supprime :
  - Les restes du template Expo non utilisés (composants d'exemple,
    écrans de démo, assets par défaut non référencés).
  - Les assets orphelins dans `assets/` (images, SVG, fonts que rien
    n'importe) — vérifie par recherche de références avant suppression.
  - Le code mort : composants, hooks, utils exportés mais jamais
    importés.
  - Les fichiers temporaires ou générés qui n'ont rien à faire dans le
    repo (frames extraites, captures intermédiaires, `.DS_Store`, logs).
  - Les dépendances de `package.json` non utilisées (vérifie avec
    `npx depcheck` ou par recherche d'imports, puis réinstalle
    proprement).
- **Ne touche PAS** : les fichiers de config (`app.json`, `tsconfig`,
  `babel.config.js`, `metro.config.js`), les lockfiles, `.gitignore`,
  ni les assets référencés dans `app.json` (icône, splash).
- Complète le `.gitignore` si des fichiers générés y manquent.
- Après nettoyage : l'app doit toujours compiler et se lancer
  identiquement sur le Simulateur.

## 4. JSDoc
- Blocs JSDoc sur les hooks, composants et fonctions exportés :
  description, `@param`, `@returns`.
- Documente en priorité : la mécanique de l'animation (qui anime quoi,
  dans quel ordre), les timings/easings choisis et pourquoi, les
  workarounds et leurs raisons.
- Pas de commentaires sur l'évident.

## 5. Documentation (README.md)
- **Pour un humain** : ce que l'app démontre (avec le média de référence
  si présent dans le repo), prérequis, installation, lancement,
  plateformes supportées, limitations connues.
- **Pour un agent IA** : structure du projet, où vit la logique
  d'animation, conventions utilisées, comment extraire/réutiliser
  l'animation dans un autre projet, pièges rencontrés. Place cette
  partie dans `AGENTS.md` référencé depuis le README si elle est longue.

## 6. Validation en deux temps (obligatoire)

### 6a. Auto-validation par l'IA
1. Type-check (`npx tsc --noEmit`) et lint sans erreur.
2. Lance l'app sur le Simulateur iOS.
3. Capture le résultat (screenshot ou enregistrement vidéo) et compare
   avec la capture de validation de la mission précédente : le rendu
   doit être identique.
4. Produis un rapport final : ce qui a été refactoré, les fichiers et
   dépendances supprimés, ce qui a été documenté, confirmation que le
   comportement est inchangé.

### 6b. Validation humaine — STOP obligatoire
- **Ne commite et ne push RIEN avant mon accord.**
- Présente-moi : le rapport final, la capture avant/après, la liste des
  suppressions et la liste des commits prévus.
- Attends ma validation explicite.

## 7. Git (après ma validation uniquement)
- Commits atomiques en Conventional Commits :
  - `refactor(scope): ...` pour le Clean Code
  - `chore: suppression des fichiers et dépendances inutilisés`
  - `docs(scope): ...` pour JSDoc, README et AGENTS.md
- Push sur la branche courante.

## Ordre d'exécution
1. Rapport de revue → 2. Refactoring → 3. Nettoyage → 4. JSDoc
→ 5. README/AGENTS.md → 6a. Auto-validation
→ 6b. **STOP, attendre validation humaine** → 7. Commits + push.
