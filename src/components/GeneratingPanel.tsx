"use client";

import { useEffect, useState } from "react";
import type { Phase } from "@/lib/types";

const STEPS: Array<{ key: string; label: string; phases: Phase[] }> = [
  { key: "prep", label: "Préparation", phases: ["connecting", "thinking"] },
  { key: "search", label: "Recherche", phases: ["searching"] },
  { key: "write", label: "Rédaction", phases: ["writing"] },
  { key: "save", label: "Archivage", phases: ["saving"] },
];

const CAPTIONS: Record<Phase, string> = {
  connecting: "Connexion au modèle…",
  thinking: "Choix d'un angle…",
  searching: "Lecture de sources en ligne…",
  writing: "Rédaction en cours…",
  saving: "Enregistrement dans l'historique…",
};

function Elapsed() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="tabular-nums text-xs text-muted">
      {String(Math.floor(seconds / 60)).padStart(2, "0")}:
      {String(seconds % 60).padStart(2, "0")}
    </span>
  );
}

export function GeneratingPanel({
  phase,
  searches,
  thinking,
  onCancel,
}: {
  phase: Phase;
  searches: string[];
  thinking: string;
  onCancel: () => void;
}) {
  const currentStep = STEPS.findIndex((s) => s.phases.includes(phase));
  // Dernière bribe de réflexion du modèle, pour que l'attente ne soit pas muette.
  // On repart du mot suivant pour ne pas couper au milieu d'un mot.
  const flat = thinking.replace(/\s+/g, " ").trim();
  const tail = flat.slice(-160);
  const whisper =
    tail.length < flat.length ? `…${tail.slice(tail.indexOf(" ") + 1)}` : tail;

  return (
    <section
      aria-live="polite"
      className="animate-fade-up rounded-2xl border border-border bg-surface p-6 sm:p-8"
    >
      <div className="flex items-center gap-4">
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="animate-halo absolute inset-0 rounded-full bg-accent" />
          <span className="animate-breathe relative h-3 w-3 rounded-full bg-accent" />
        </span>
        <p className="flex-1 text-[0.95rem]">{CAPTIONS[phase]}</p>
        <Elapsed />
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-muted underline underline-offset-4 transition-colors hover:text-accent"
        >
          Annuler
        </button>
      </div>

      <ol className="mt-6 grid grid-cols-4 gap-2">
        {STEPS.map((step, index) => {
          const done = currentStep > index;
          const active = currentStep === index;
          return (
            <li key={step.key} className="min-w-0">
              <span
                className={`block h-[3px] rounded-full transition-colors duration-500 ${
                  done ? "bg-accent" : active ? "bg-accent/40" : "bg-border"
                }`}
              >
                {active && (
                  <span className="skeleton-line block h-[3px] w-full opacity-70" />
                )}
              </span>
              <span
                className={`mt-2 block truncate text-[0.7rem] uppercase tracking-[0.1em] ${
                  done || active ? "text-foreground" : "text-muted"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      {whisper && (
        <p className="mt-6 line-clamp-2 text-sm italic leading-relaxed text-muted">
          {whisper}
        </p>
      )}

      {searches.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {searches.map((query, index) => (
            <li
              key={`${query}-${index}`}
              className="animate-fade-up rounded-full bg-surface-sunken px-3 py-1.5 text-xs text-muted"
            >
              <span aria-hidden className="mr-1.5 text-accent">
                ⌕
              </span>
              {query}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 space-y-3" aria-hidden>
        {[92, 100, 78, 96, 64].map((width, index) => (
          <span
            key={index}
            className="skeleton-line block h-3"
            style={{ width: `${width}%`, animationDelay: `${index * 0.12}s` }}
          />
        ))}
      </div>
    </section>
  );
}
