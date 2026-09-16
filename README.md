# learning

Un site pour apprendre une chose à la fois. On choisit un **domaine** et un **format**,
le texte est écrit à la demande par Claude avec recherche web, puis rangé dans un
historique consultable.

![Aperçu](https://img.shields.io/badge/Next.js-16-000) ![Prisma](https://img.shields.io/badge/Prisma-7-2D3748) ![SQLite](https://img.shields.io/badge/SQLite-local-003B57)

## Ce que ça fait

- Deux listes déroulantes : la catégorie (Tech, Mathématiques, Littérature, …) et le
  type de contenu (une nouveauté, un cours, une idée, un commerce, …).
- Un champ libre optionnel pour imposer un sujet précis.
- Pendant la génération : phases d'avancement, requêtes de recherche affichées en
  direct, bribes de réflexion du modèle, puis le texte qui arrive au fil de l'eau.
- Chaque texte est sourcé : les liens consultés sont cités dans le corps et listés
  en fin d'article.
- Tout est archivé dans une base SQLite locale, filtrable par catégorie et par type,
  avec une page dédiée par texte (`/g/<id>`).

## Démarrer

```bash
npm install
cp .env.example .env     # puis renseigner ANTHROPIC_API_KEY
npm run db:migrate       # crée prisma/dev.db
npm run dev
```

Le site tourne sur http://localhost:3000.

Sans `ANTHROPIC_API_KEY`, le site démarre et l'historique reste consultable ; seule
la génération renvoie une erreur explicite.

## Architecture

```
src/
  app/
    page.tsx                     page principale (historique chargé côté serveur)
    g/[id]/page.tsx              un texte archivé, en permalien
    api/generate/route.ts        génération en flux SSE (Claude + recherche web)
    api/generations/…            lecture et suppression de l'historique
  components/
    Studio.tsx                   orchestration côté client (formulaire, flux, état)
    Select.tsx                   liste déroulante maison
    GeneratingPanel.tsx          l'animation d'attente
    Article.tsx / Markdown.tsx   rendu d'un texte
  lib/
    taxonomy.ts                  les deux listes — la seule chose à éditer pour
                                 ajouter une catégorie ou un format
    claude.ts                    prompt système et construction de la requête
    article.ts                   découpage titre / résumé / corps
    generations.ts               accès base
    prisma.ts                    client Prisma (adaptateur SQLite)
```

Le flux de génération passe par du **SSE** (`text/event-stream`) : la route renvoie
des événements typés (`phase`, `search`, `thinking`, `delta`, `sources`, `done`,
`error`) définis dans `src/lib/types.ts`, que `Studio.tsx` consomme.

### Ajouter une catégorie ou un format

Une entrée dans `CATEGORIES` ou `TYPES` (`src/lib/taxonomy.ts`) suffit : les listes
déroulantes, les filtres de l'historique et le prompt suivent automatiquement. Le
champ `brief` est ce qui est injecté dans le prompt — c'est lui qui donne son
caractère au contenu généré.

### Réglages du modèle

Dans `src/app/api/generate/route.ts` :

- `output_config.effort` est à `"medium"` ; passer à `"high"` pour des sujets plus
  exigeants (plus lent, plus cher).
- `max_uses` de l'outil `web_search` limite le nombre de recherches par génération.
- Le modèle est défini par `MODEL` dans `src/lib/claude.ts`.

## Base de données

SQLite via Prisma, fichier `prisma/dev.db` (non versionné). Une seule table,
`Generation`. Pour passer en Postgres plus tard : changer le `provider` dans
`prisma/schema.prisma`, l'adaptateur dans `src/lib/prisma.ts`, et rejouer les
migrations — le reste du code ne bouge pas.

## Scripts

| Commande | Effet |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` | génère le client Prisma puis construit le site |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run db:migrate` | applique le schéma à la base |
| `npm run db:studio` | explorateur de base Prisma |
