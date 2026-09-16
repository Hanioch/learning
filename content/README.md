# content/

Un fichier markdown par texte, versionné avec le code. Le site lit ce dossier
au moment de la requête : ajouter un fichier suffit à publier un texte.

## Nom du fichier

`AAAA-MM-JJ-titre-en-minuscules.md` — le nom sans `.md` devient l'URL (`/a/<slug>`).

## Format

En-tête **JSON strict** entre deux lignes `---`, puis le corps en markdown.
C'est du JSON et non du YAML pour être analysé sans dépendance et sans
ambiguïté sur les accents, les deux-points ou les apostrophes d'un titre.

```
---
{
  "title": "Titre précis et concret, 70 caractères maximum",
  "category": "tech",
  "type": "cours",
  "summary": "Une phrase de 30 mots maximum qui donne déjà l'information principale.",
  "date": "2026-09-17",
  "sources": [{ "title": "Nom de la source", "url": "https://…" }]
}
---

## Première section

Le corps, en sections `##` courtes. Il ne reprend ni le titre ni le résumé :
ils sont affichés à part.
```

`category` et `type` doivent être des `id` déclarés dans `src/lib/taxonomy.ts`.

## Vérifier

```bash
npm run check:content
```

Contrôle le format, les identifiants, les dates, les doublons de titre et les
URLs des sources. Un fichier invalide est ignoré par le site plutôt que de le
faire tomber, donc cette commande est le seul moyen de s'en apercevoir.

## Écrire un texte

La commande `/generer` (voir `.claude/commands/generer.md`) écrit, vérifie et
commite de nouveaux textes.
