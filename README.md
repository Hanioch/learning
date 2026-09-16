# learning

Une petite bibliothèque personnelle de textes courts et sourcés, pour apprendre
une chose à la fois. On filtre par domaine et par format, et on lit.

![Next.js](https://img.shields.io/badge/Next.js-16-000) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6) ![Sans clé API](https://img.shields.io/badge/cl%C3%A9%20API-aucune-2ea44f)

## Le principe

Les textes ne sont **pas** générés quand un visiteur clique : ils sont écrits à
l'avance par Claude Code, dans une session, et versionnés avec le code sous
forme de fichiers markdown dans `content/`.

Le site, lui, ne fait que lire ce dossier. Conséquences directes :

- **aucune clé API**, aucun appel réseau, aucun coût à l'usage ;
- les textes sont relus, corrigibles à la main et suivis dans l'historique Git ;
- le site démarre en une commande et fonctionne hors ligne.

Remplir la bibliothèque et l'afficher sont donc deux gestes séparés.

## Démarrer

```bash
npm install
npm run dev
```

Le site tourne sur http://localhost:3000. Aucune configuration, aucune base de
données. `pnpm install` fonctionne aussi bien.

## Ajouter des textes

Dans une session Claude Code ouverte sur ce dépôt :

```
/generer        # 3 textes
/generer 5      # 5 textes
```

La commande choisit les sujets par rotation — elle prend la catégorie et le
format les moins représentés dans `content/`, évite les titres déjà traités,
cherche ses faits sur le web, écrit les fichiers, les vérifie puis les commite.
Son texte complet est dans `.claude/commands/generer.md` : c'est là qu'on règle
le ton, la longueur ou les exigences de sourçage.

Pour en ajouter automatiquement chaque jour, la boucle appelle cette commande :

```
/loop 24h /generer 3
```

## Architecture

```
content/                         un fichier markdown par texte (voir son README)
.claude/commands/generer.md      la commande qui écrit les textes
scripts/check-content.mts        validation des fichiers de content/
src/
  app/
    page.tsx                     la bibliothèque : filtres + liste
    a/[slug]/page.tsx            un texte
  components/
    Library.tsx                  filtres côté client
    ArticleList.tsx              les cartes
    Article.tsx / Markdown.tsx   rendu d'un texte
    Select.tsx                   liste déroulante maison
  lib/
    taxonomy.ts                  les catégories et les formats
    content.ts                   lecture et analyse de content/
    types.ts
```

### Ajouter une catégorie ou un format

Une entrée dans `CATEGORIES` ou `TYPES` (`src/lib/taxonomy.ts`) suffit : les
filtres et la commande de génération suivent. Le champ `brief` est ce qui est
injecté dans le prompt — c'est lui qui donne son caractère au format.

### Format d'un texte

En-tête JSON entre deux lignes `---`, puis le corps en markdown. Le détail et
un exemple complet sont dans [`content/README.md`](content/README.md).

Un fichier invalide est **ignoré** par le site plutôt que de le faire tomber, et
l'erreur est écrite dans le terminal. `npm run check:content` est le moyen sûr
de s'en apercevoir.

## Scripts

| Commande | Effet |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` | construit le site |
| `npm start` | lance la version construite |
| `npm run check:content` | vérifie les fichiers de `content/` |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
