# /animation-brief — Spécifier une animation par questions sélectionnables

## Contexte
Je veux ajouter ou modifier une animation dans le projet en cours, mais
je ne sais pas forcément la décrire précisément. Ta mission : me faire
formuler un **brief d'animation complet** via des questions à choix,
puis produire une spécification que tu implémenteras (ou que
/reproduce-ui consommera).

$ARGUMENTS

## Règle d'or : questions sélectionnables UNIQUEMENT
- Utilise **exclusivement l'outil `AskUserQuestion`** pour chaque
  question — jamais de questions en texte libre dans ta réponse.
- 2 à 4 options par question, courtes et mutuellement exclusives.
  Ajoute une option « Autre / je te montre » quand c'est pertinent
  (je peux toujours taper une réponse libre).
- Maximum 4 questions par appel. Regroupe-les par thème et procède
  en **2 à 3 vagues** : ne pose la vague suivante qu'après avoir lu
  mes réponses (certaines questions deviennent inutiles selon le type
  d'animation choisi — saute-les).
- Si j'ai déjà donné une info dans la conversation ou dans
  `$ARGUMENTS`, **ne la redemande pas** : déduis-la et mentionne
  l'hypothèse dans le brief final.

## Vague 1 — Nature de l'animation
1. **Déclencheur** : Tap sur un élément / Geste (swipe, drag, pull) /
   Apparition de l'écran (mount, navigation) / Scroll
2. **Type principal** :
   - Transition entre écrans (container transform, shared element, slide, crossfade)
   - Micro-interaction sur un élément (scale au press, shake, toggle animé)
   - Entrée/sortie d'éléments (fade, slide-in, stagger de liste)
   - Animation liée au geste (parallax, rubber band, swipe-to-dismiss)
3. **Sujet** : Quel élément est concerné ? (options déduites du code
   du projet en cours : liste les 3-4 composants/écrans les plus
   plausibles, + « Autre »)

## Vague 2 — Chorégraphie (adapter selon la vague 1)
Ne pose que les questions pertinentes pour le type choisi :
- **Si transition écran → écran** : Y a-t-il un élément qui persiste
  entre les deux écrans (shared element) ? Oui, une image / Oui, une
  icône ou un texte / Non, tout est remplacé / Le conteneur lui-même
  se transforme (morph)
- **Si plusieurs éléments** : Tout en même temps / Séquencé (l'un
  après l'autre) / Stagger en cascade (~50ms d'écart) / Stagger
  lent (~100ms+)
- **Si geste** : L'animation suit le doigt en continu (interactive) /
  Se déclenche après un seuil / Les deux (suit puis snap)
- **Origine du mouvement** (pour scale/reveal) : Depuis le centre /
  Depuis l'élément tappé / Depuis un bord

## Vague 3 — Feel
1. **Durée** : Rapide (~200ms) / Moyenne (~350ms) / Lente (~500ms+) /
   Pilotée par le geste
2. **Caractère** : Sec et net (ease-out) / Moelleux (spring doux,
   sans rebond) / Rebondi (spring avec overshoot) / Linéaire (rare,
   ex. progression)
3. **Réversibilité** : Le retour/dismiss rejoue l'animation à
   l'envers / Le retour est différent (préciser) / Pas de retour

## Raccourci analogie
À chaque vague, si je réponds par une analogie (« comme le bouton GET
de l'App Store », « comme les stories Instagram ») ou que je fournis
une vidéo/un screen recording :
- **Vidéo fournie** → bascule sur le protocole d'analyse de
  /reproduce-ui (ffprobe, extraction de frames, planches contact)
  et saute les questions auxquelles la vidéo répond.
- **Analogie** → décris ta compréhension du pattern en 2-3 phrases
  et fais-la valider par une question AskUserQuestion
  (« C'est bien ça ? Oui / Presque, mais… / Non »).

## Livrable : le brief
Une fois les réponses collectées, produis un **brief structuré** :

```
### Brief animation — <nom court>
- Déclencheur : …
- Sujet(s) : … (ce qui bouge / ce qui reste fixe)
- Type : … (vocabulaire : fade, slide, scale, morph, shared element,
  stagger, parallax, reveal, rubber band…)
- Chorégraphie : … (ordre, décalages, origine)
- Timing : phase A → X ms, easing Y → phase B (durées par phase)
- Réversibilité : …
- Hypothèses non confirmées : …
- Approche technique proposée : … (Reanimated / expo-router
  transitions / SwiftUI via @expo/ui — avec statut stable/expérimental
  vérifié dans les docs, cf. règles anti-hallucination de /reproduce-ui)
```

**Attends ma validation du brief avant d'écrire la moindre ligne de
code** (workflow preview-then-confirm habituel). Après validation,
implémente en respectant les conventions de /reproduce-ui (stack,
pièges @expo/ui, validation frame par frame sur simulateur).
