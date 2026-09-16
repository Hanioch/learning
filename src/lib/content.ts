import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Article, Source } from "./types";

/**
 * Lecture des textes du site.
 *
 * Les contenus ne sont plus générés à la demande : ils sont écrits à l'avance
 * dans `content/`, un fichier markdown par texte, et versionnés avec le code.
 * Le site n'appelle donc aucune API et ne coûte rien à faire tourner.
 *
 * Format d'un fichier — en-tête JSON entre deux lignes `---`, puis le corps
 * en markdown. L'en-tête est du JSON et non du YAML pour être analysé par
 * `JSON.parse` : pas de dépendance à installer, et aucune ambiguïté sur les
 * accents, les deux-points ou les apostrophes d'un titre.
 *
 *     ---
 *     {
 *       "title": "…",
 *       "category": "tech",
 *       "type": "cours",
 *       "summary": "…",
 *       "date": "2026-09-17",
 *       "sources": [{ "title": "…", "url": "https://…" }]
 *     }
 *     ---
 *
 *     ## Première section
 *     …
 */

export const CONTENT_DIR = join(process.cwd(), "content");

const DELIMITER = "---";

/**
 * Les fichiers de documentation du dossier (README) et les brouillons préfixés
 * d'un `_` ne sont pas des textes publiés.
 */
export function isArticleFile(name: string): boolean {
  return name.endsWith(".md") && !name.startsWith("_") && name !== "README.md";
}

function parseSources(value: unknown): Source[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (s): s is Source =>
      typeof s === "object" &&
      s !== null &&
      typeof (s as Source).url === "string" &&
      typeof (s as Source).title === "string",
  );
}

/**
 * Découpe un fichier en en-tête et corps. Renvoie `null` plutôt que de lever :
 * un fichier mal formé ne doit pas faire tomber tout le site, il est ignoré et
 * signalé dans le terminal.
 */
export function parseArticleFile(slug: string, raw: string): Article | null {
  const text = raw.replace(/^﻿/, "").trimStart();

  if (!text.startsWith(`${DELIMITER}\n`)) {
    console.error(`[content] ${slug}: en-tête manquant (doit commencer par ---).`);
    return null;
  }

  const end = text.indexOf(`\n${DELIMITER}`, DELIMITER.length);
  if (end === -1) {
    console.error(`[content] ${slug}: en-tête non refermé.`);
    return null;
  }

  const header = text.slice(DELIMITER.length + 1, end);
  const body = text.slice(text.indexOf("\n", end + 1) + 1).trim();

  let meta: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(header);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("l'en-tête doit être un objet JSON");
    }
    meta = parsed as Record<string, unknown>;
  } catch (error) {
    console.error(
      `[content] ${slug}: en-tête JSON invalide — ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return null;
  }

  const required = ["title", "category", "type", "summary", "date"] as const;
  for (const key of required) {
    if (typeof meta[key] !== "string" || !(meta[key] as string).trim()) {
      console.error(`[content] ${slug}: champ « ${key} » manquant ou vide.`);
      return null;
    }
  }
  if (!body) {
    console.error(`[content] ${slug}: corps vide.`);
    return null;
  }

  return {
    slug,
    title: meta.title as string,
    category: meta.category as string,
    type: meta.type as string,
    summary: meta.summary as string,
    date: meta.date as string,
    sources: parseSources(meta.sources),
    content: body,
  };
}

async function readAll(): Promise<Article[]> {
  let files: string[];
  try {
    files = await readdir(CONTENT_DIR);
  } catch (error) {
    // Pas encore de dossier content/ : le site s'affiche vide plutôt que de casser.
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const articles = await Promise.all(
    files
      .filter(isArticleFile)
      .map(async (name) => {
        const raw = await readFile(join(CONTENT_DIR, name), "utf8");
        return parseArticleFile(name.replace(/\.md$/, ""), raw);
      }),
  );

  return articles
    .filter((a): a is Article => a !== null)
    .sort((a, b) => (a.date === b.date ? a.slug.localeCompare(b.slug) : b.date.localeCompare(a.date)));
}

export async function listArticles(filters?: {
  category?: string;
  type?: string;
}): Promise<Article[]> {
  const all = await readAll();
  return all.filter(
    (a) =>
      (!filters?.category || a.category === filters.category) &&
      (!filters?.type || a.type === filters.type),
  );
}

export async function getArticle(slug: string): Promise<Article | null> {
  const all = await readAll();
  return all.find((a) => a.slug === slug) ?? null;
}
