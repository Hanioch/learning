# learning

Un site pour apprendre une chose à la fois. On choisit un **domaine** et un **format**,
le texte est écrit à la demande par Claude avec recherche web, puis rangé dans un
historique consultable.

![Next.js](https://img.shields.io/badge/Next.js-16-000) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6) ![Aucune dépendance native](https://img.shields.io/badge/d%C3%A9pendances%20natives-aucune-2ea44f)

## Ce que ça fait

- Deux listes déroulantes : la catégorie (Tech, Mathématiques, Littérature, …) et le
  type de contenu (une nouveauté, un cours, une idée, un commerce, …).
- Un champ libre optionnel pour imposer un sujet précis.
- Pendant la génération : phases d'avancement, requêtes de recherche affichées en
  direct, bribes de réflexion du modèle, puis le texte qui arrive au fil de l'eau.
- Chaque texte est sourcé : les liens consultés sont cités dans le corps et listés
  en fin d'article.
- Tout est archivé dans un fichier JSON local, filtrable par catégorie et par type,
  avec une page dédiée par texte (`/g/<id>`).

## Démarrer

```bash
npm install
cp .env.example .env     # puis renseigner ANTHROPIC_API_KEY
npm run dev
```

`pnpm install` fonctionne aussi. Il n'y a pas d'étape de base de données : le
fichier d'historique se crée tout seul.

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
    generations.ts               persistance de l'historique (fichier JSON)
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

## Stockage

L'historique vit dans `data/generations.json` (non versionné), un simple tableau
JSON lisible à la main. Les écritures sont sérialisées et atomiques — écriture
dans un fichier temporaire puis renommage — pour qu'une coupure ne laisse jamais
un fichier à moitié écrit.

Ce choix est délibéré : le projet stocke une seule liste, consultée par une seule
personne. Un fichier suffit, et surtout **le projet n'embarque aucune dépendance
native** — rien à compiler à l'installation, quel que soit le gestionnaire de
paquets, le système ou la version de Node. Une première version utilisait SQLite
via Prisma ; le module natif `better-sqlite3` s'est révélé être une source
d'échecs d'installation sans rapport avec le projet.

Pour passer à une vraie base plus tard, `src/lib/generations.ts` est le seul
fichier à réécrire : tout le reste de l'application passe par les cinq fonctions
qu'il exporte (`listGenerations`, `getGeneration`, `saveGeneration`,
`deleteGeneration`).

Le chemin du fichier est configurable avec la variable d'environnement
`DATA_FILE` (relative à la racine du projet).

## Scripts

| Commande | Effet |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` | construit le site |
| `npm start` | lance la version construite |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
