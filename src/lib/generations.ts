import type { Generation as GenerationRow } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import type { Generation, Source } from "./types";

/** Les sources sont stockées en JSON dans une colonne texte (SQLite n'a pas de type tableau). */
function parseSources(raw: string): Source[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s): s is Source =>
        typeof s === "object" &&
        s !== null &&
        typeof (s as Source).url === "string" &&
        typeof (s as Source).title === "string",
    );
  } catch {
    return [];
  }
}

export function toGeneration(row: GenerationRow): Generation {
  return {
    id: row.id,
    category: row.category,
    type: row.type,
    topic: row.topic,
    title: row.title,
    summary: row.summary,
    content: row.content,
    sources: parseSources(row.sources),
    model: row.model,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listGenerations(filters?: {
  category?: string;
  type?: string;
  limit?: number;
}): Promise<Generation[]> {
  const rows = await prisma.generation.findMany({
    where: {
      ...(filters?.category ? { category: filters.category } : {}),
      ...(filters?.type ? { type: filters.type } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(filters?.limit ?? 50, 200),
  });
  return rows.map(toGeneration);
}

export async function getGeneration(id: string): Promise<Generation | null> {
  const row = await prisma.generation.findUnique({ where: { id } });
  return row ? toGeneration(row) : null;
}

export async function deleteGeneration(id: string): Promise<boolean> {
  const { count } = await prisma.generation.deleteMany({ where: { id } });
  return count > 0;
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
  const row = await prisma.generation.create({
    data: { ...input, sources: JSON.stringify(input.sources) },
  });
  return toGeneration(row);
}
