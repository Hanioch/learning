---
description: Écrit de nouveaux textes sourcés dans content/, puis les vérifie et les commite.
argument-hint: "[nombre de textes, 3 par défaut]"
---

Tu alimentes la bibliothèque de ce site. Écris **$ARGUMENTS textes** (si aucun
nombre n'est donné, écris-en 3), puis vérifie-les et commite-les.

## 1. Situer le stock existant

- Lis `src/lib/taxonomy.ts` : `CATEGORIES` et `TYPES` sont la liste fermée des
  valeurs autorisées. N'invente jamais un `id` qui n'y figure pas.
- Liste `content/` et lis les en-têtes des fichiers existants (leur `title`,
  `category` et `type` suffisent — n'ouvre pas les corps). `README.md` et les
  fichiers préfixés d'un `_` ne sont pas des textes : ignore-les.

## 2. Choisir les sujets — rotation automatique

Pour chaque texte à écrire :

1. Prends la **catégorie la moins représentée** dans `content/`. À égalité,
   prends celle qui n'a pas été servie depuis le plus longtemps.
2. Dans cette catégorie, prends le **type le moins représenté**.
3. Choisis un sujet précis et non évident, qui ne recoupe aucun titre existant.
   Pas de « introduction à X » : vise ce qu'un curieux ne trouverait pas seul.

Les textes d'un même passage doivent tomber dans des catégories différentes.

## 3. Écrire

Applique les consignes de fond suivantes, sans exception :

- En français, clair et direct. Pas de jargon non expliqué, pas de formule
  creuse, pas de flatterie, pas de conclusion qui répète l'introduction.
- **Cherche sur le web** (`WebSearch`, puis `WebFetch` sur les pages qui
  comptent) pour toute date, tout chiffre, tout nom propre et tout ce qui a pu
  changer récemment. Ne te fie jamais à ta mémoire pour ça.
- Cite tes sources en lien markdown inline, à l'endroit exact où l'information
  apparaît : `[nom de la source](url)`. Une affirmation chiffrée sans lien est
  une affirmation à retirer.
- Dis ce qui est incertain ou débattu au lieu de trancher.
- Un exemple concret vaut mieux qu'une généralité, un ordre de grandeur vaut
  mieux qu'un adjectif.
- Le champ `brief` du type choisi, dans `taxonomy.ts`, dit ce qu'on attend de
  ce format précis. Suis-le.
- Corps entre 600 et 1100 mots, en sections `##` courtes, paragraphes de 2 à 4
  phrases. Termine par une section `## Pour aller plus loin` avec 2 ou 3 pistes
  concrètes.

## 4. Enregistrer

Un fichier par texte : `content/AAAA-MM-JJ-titre-en-minuscules.md`, la date
étant celle du jour, le slug sans accents ni ponctuation.

    ---
    {
      "title": "Titre précis et concret, 70 caractères maximum",
      "category": "<id pris dans CATEGORIES>",
      "type": "<id pris dans TYPES>",
      "summary": "Une phrase de 30 mots maximum qui donne déjà l'information principale.",
      "date": "AAAA-MM-JJ",
      "sources": [{ "title": "Nom de la source", "url": "https://…" }]
    }
    ---

    ## Première section

    …

L'en-tête est du **JSON strict** : guillemets droits, pas de virgule finale.
Le corps ne reprend ni le titre ni le résumé — ils sont affichés à part. Mets
dans `sources` les pages que tu as réellement consultées, pas plus de 12.

## 5. Vérifier puis committer

```bash
npm run check:content
```

Corrige tout ce qu'il signale et relance-le jusqu'à ce qu'il passe. Ensuite
seulement, commite les nouveaux fichiers avec un message qui liste les titres
ajoutés, et pousse sur la branche courante.

Si une recherche web échoue ou qu'un sujet se révèle trop mince pour être
sourcé sérieusement, abandonne ce sujet et prends-en un autre plutôt que
d'écrire un texte invérifiable. Termine en disant ce que tu as écrit, et ce
que tu as éventuellement abandonné.
