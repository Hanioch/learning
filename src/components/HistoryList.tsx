"use client";

import Link from "next/link";
import { categoryLabel, typeLabel } from "@/lib/taxonomy";
import type { Generation } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function HistoryList({
  generations,
  onDelete,
}: {
  generations: Generation[];
  onDelete: (id: string) => void;
}) {
  if (generations.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted">
        Rien ici pour l&apos;instant. Génère un premier texte, il s&apos;archivera
        automatiquement.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {generations.map((generation) => (
        <li
          key={generation.id}
          className="group relative rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
        >
          <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <span className="text-accent">{categoryLabel(generation.category)}</span>
            <span aria-hidden>·</span>
            <span>{typeLabel(generation.type)}</span>
            <span aria-hidden>·</span>
            <span>{formatDate(generation.createdAt)}</span>
          </div>

          <h3 className="font-display text-lg font-semibold leading-snug">
            <Link href={`/g/${generation.id}`} className="before:absolute before:inset-0">
              {generation.title}
            </Link>
          </h3>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {generation.summary}
          </p>

          {generation.sources.length > 0 && (
            <p className="mt-3 text-xs text-muted">
              {generation.sources.length} source
              {generation.sources.length > 1 ? "s" : ""}
            </p>
          )}

          <button
            type="button"
            aria-label={`Supprimer « ${generation.title} »`}
            onClick={() => onDelete(generation.id)}
            className="absolute right-3 top-3 z-10 rounded-lg px-2 py-1 text-muted opacity-0 transition-opacity hover:bg-surface-sunken hover:text-foreground focus:opacity-100 group-hover:opacity-100"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
