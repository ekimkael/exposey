# /social-post — Post d'annonce pour une case study

## Contexte
Génère un post court annonçant l'app de la branche courante (ex. Pumice,
Fennec…), prêt à coller sur X / LinkedIn, à partir du README et de la
capture de validation existante.

$ARGUMENTS

## Source
- Lis le `README.md` de la branche courante : nom de l'app, ce qu'elle
  démontre, ce qui la rend intéressante techniquement (le détail qui
  donne envie de zoomer).
- Réutilise la capture de validation existante (`/tmp/capture.mp4` ou son
  découpage en frames) si elle est encore disponible dans la session ;
  sinon enregistre-en une nouvelle, courte (~6s), via
  `xcrun simctl io booted recordVideo`, puis convertis-la en GIF léger
  (`ffmpeg`) pour l'aperçu.

## Génère
- **Post X** (≤280 caractères) : accroche → ce que ça montre → 1 détail
  technique précis (pas de superlatifs creux) → 2-3 hashtags pertinents
  (`#ReactNative`, `#buildinpublic`, `#iOS`…).
- **Post LinkedIn** (plus long, plus contextualisé) uniquement si
  `$ARGUMENTS` le demande explicitement.
- Le média prêt à joindre (chemin du GIF/vidéo).
- Utilise le skill `/social` pour le ton et les bonnes pratiques de
  la plateforme visée.

## Validation obligatoire — STOP avant publication
- Ne publie **jamais** automatiquement. Présente le texte et le média,
  et attends ma validation explicite avant toute publication réelle —
  je la ferai moi-même de toute façon, tu n'as pas d'accès direct aux
  plateformes sociales.
