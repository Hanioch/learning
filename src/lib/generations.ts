import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { Generation, Source } from "./types";

/**
 * Persistance de l'historique dans un simple fichier JSON.
 *
 * Pourquoi pas une vraie base : ce projet stocke une seule liste, consultée par
 * une seule personne. Un fichier suffit, et surtout il n'embarque aucun module
 * natif — donc rien à compiler à l'installation, quel que soit le gestionnaire
 * de paquets ou la machine. Si un jour le volume ou les besoins de requêtage
 * le justifient, `src/lib/generations.ts` est le seul fichier à réécrire :
 * tout le reste de l'application passe par les fonctions exportées ici.
 */

const DATA_FILE = process.env.DATA_FILE
  ? join(process.cwd(), process.env.DATA_FILE)
  : join(process.cwd(), "data", "generations.json");

/** Garde-fou : une génération mal formée ne doit pas casser tout l'historique. */
function isGeneration(value: unknown): value is Generation {
  if (typeof value !== "object" || value === null) return false;
  const g = value as Partial<Generation>;
  return (
    typeof g.id === "string" &&
    typeof g.category === "string" &&
    typeof g.type === "string" &&
    typeof g.title === "string" &&
    typeof g.content === "string" &&
    typeof g.createdAt === "string"
  );
}

function normalizeSources(value: unknown): Source[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (s): s is Source =>
      typeof s === "object" &&
      s !== null &&
      typeof (s as Source).url === "string" &&
      typeof (s as Source).title === "string",
  );
}

async function readAll(): Promise<Generation[]> {
  let raw: string;
  try {
    raw = await readFile(DATA_FILE, "utf8");
  } catch (error) {
    // Premier lancement : le fichier n'existe pas encore, l'historique est vide.
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error(`[generations] ${DATA_FILE} est illisible, historique ignoré.`);
    return [];
  }

  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isGeneration).map((g) => ({
    ...g,
    topic: typeof g.topic === "string" ? g.topic : null,
    summary: typeof g.summary === "string" ? g.summary : "",
    model: typeof g.model === "string" ? g.model : "",
    sources: normalizeSources(g.sources),
  }));
}

/**
 * Écriture atomique : on écrit à côté puis on renomme, pour qu'une coupure au
 * mauvais moment ne laisse jamais un fichier à moitié écrit.
 */
async function writeAll(generations: Generation[]): Promise<void> {
  await mkdir(dirname(DATA_FILE), { recursive: true });
  const temp = `${DATA_FILE}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(generations, null, 2)}\n`, "utf8");
  await rename(temp, DATA_FILE);
}

/**
 * Les écritures sont mises à la queue leu leu : deux sauvegardes simultanées
 * liraient sinon le même état de départ, et la seconde écraserait la première.
 */
let queue: Promise<unknown> = Promise.resolve();

function serialize<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task, task);
  queue = result.catch(() => {});
  return result;
}

export async function listGenerations(filters?: {
  category?: string;
  type?: string;
  limit?: number;
}): Promise<Generation[]> {
  const all = await readAll();
  return all
    .filter(
      (g) =>
        (!filters?.category || g.category === filters.category) &&
        (!filters?.type || g.type === filters.type),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, Math.min(filters?.limit ?? 50, 200));
}

export async function getGeneration(id: string): Promise<Generation | null> {
  const all = await readAll();
  return all.find((g) => g.id === id) ?? null;
}

export async function deleteGeneration(id: string): Promise<boolean> {
  return serialize(async () => {
    const all = await readAll();
    const remaining = all.filter((g) => g.id !== id);
    if (remaining.length === all.length) return false;
    await writeAll(remaining);
    return true;
  });
}

export async function saveGeneration(input: {
  category: string;
  type: string;
  topic: string | null;
  title: string;
  summary: string;
  content: string;
  sources: Source[];
  model: string;
}): Promise<Generation> {
  return serialize(async () => {
    const generation: Generation = {
      ...input,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const all = await readAll();
    await writeAll([generation, ...all]);
    return generation;
  });
}
