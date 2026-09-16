"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseArticle } from "@/lib/article";
import { CATEGORIES, TYPES } from "@/lib/taxonomy";
import type { Generation, Phase, Source, StreamEvent } from "@/lib/types";
import { Article } from "./Article";
import { GeneratingPanel } from "./GeneratingPanel";
import { HistoryList } from "./HistoryList";
import { Select } from "./Select";

type Status = "idle" | "running" | "error";

export function Studio({ initialHistory }: { initialHistory: Generation[] }) {
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [type, setType] = useState(TYPES[0].id);
  const [topic, setTopic] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [phase, setPhase] = useState<Phase>("connecting");
  const [searches, setSearches] = useState<string[]>([]);
  const [thinking, setThinking] = useState("");
  const [draft, setDraft] = useState("");
  const [draftSources, setDraftSources] = useState<Source[]>([]);
  const [result, setResult] = useState<Generation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<Generation[]>(initialHistory);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const filteredHistory = useMemo(
    () =>
      history.filter(
        (g) =>
          (!filterCategory || g.category === filterCategory) &&
          (!filterType || g.type === filterType),
      ),
    [history, filterCategory, filterType],
  );

  const handleEvent = useCallback((event: StreamEvent) => {
    switch (event.type) {
      case "phase":
        setPhase(event.phase);
        break;
      case "thinking":
        setThinking((t) => t + event.text);
        break;
      case "search":
        setSearches((s) => (s.includes(event.query) ? s : [...s, event.query]));
        break;
      case "delta":
        setDraft((d) => d + event.text);
        break;
      case "sources":
        setDraftSources(event.sources);
        break;
      case "done":
        setResult(event.generation);
        setHistory((h) => [event.generation, ...h]);
        setStatus("idle");
        break;
      case "error":
        setError(event.message);
        setStatus("error");
        break;
    }
  }, []);

  const generate = async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("running");
    setPhase("connecting");
    setSearches([]);
    setThinking("");
    setDraft("");
    setDraftSources([]);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, type, topic }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? `Le serveur a répondu ${response.status}.`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Le flux SSE sépare les messages par une ligne vide.
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";
        for (const chunk of chunks) {
          const line = chunk.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;
          handleEvent(JSON.parse(line.slice(6)) as StreamEvent);
        }
      }

      // Le flux s'est terminé sans « done » ni « error » : coupure réseau.
      setStatus((current) => {
        if (current === "running") {
          setError("La connexion s'est interrompue avant la fin de la génération.");
          return "error";
        }
        return current;
      });
    } catch (caught) {
      if (controller.signal.aborted) {
        setStatus("idle");
        return;
      }
      setError(caught instanceof Error ? caught.message : "Erreur inattendue.");
      setStatus("error");
    }
  };

  const cancel = () => {
    abortRef.current?.abort();
    setStatus("idle");
    setDraft("");
  };

  const remove = async (id: string) => {
    setHistory((h) => h.filter((g) => g.id !== id));
    if (result?.id === id) setResult(null);
    await fetch(`/api/generations/${id}`, { method: "DELETE" }).catch(() => {});
  };

  // Tant que le texte n'a pas commencé à arriver, on montre l'animation.
  const showPanel = status === "running" && !draft.trim();
  const live = draft.trim() ? parseArticle(draft) : null;

  useEffect(() => {
    if (status === "running" && draft) {
      outputRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [status, draft]);

  return (
    <>
      <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Catégorie"
            options={CATEGORIES}
            value={category}
            onChange={setCategory}
            disabled={status === "running"}
          />
          <Select
            label="Type de contenu"
            options={TYPES}
            value={type}
            onChange={setType}
            disabled={status === "running"}
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="topic"
            className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted"
          >
            Sujet précis <span className="normal-case tracking-normal">(optionnel)</span>
          </label>
          <input
            id="topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && status !== "running") generate();
            }}
            disabled={status === "running"}
            placeholder="Laisse vide pour être surpris"
            maxLength={300}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-[0.95rem] placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
          />
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={status === "running"}
          className="mt-6 w-full rounded-xl bg-accent px-6 py-3.5 font-medium text-accent-contrast transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {status === "running" ? "Génération en cours…" : "Apprendre quelque chose"}
        </button>
      </section>

      {error && (
        <p
          role="alert"
          className="animate-fade-up mt-6 rounded-xl border border-accent/40 bg-accent-soft px-5 py-4 text-sm"
        >
          {error}
        </p>
      )}

      <div ref={outputRef} className="mt-10">
        {showPanel && (
          <GeneratingPanel
            phase={phase}
            searches={searches}
            thinking={thinking}
            onCancel={cancel}
          />
        )}

        {status === "running" && live && (
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-10">
            <Article
              title={live.title}
              summary={live.summary}
              content={live.content}
              sources={draftSources}
              category={category}
              type={type}
              streaming
            />
          </div>
        )}

        {status !== "running" && result && (
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-10">
            <Article
              title={result.title}
              summary={result.summary}
              content={result.content}
              sources={result.sources}
              category={result.category}
              type={result.type}
              createdAt={result.createdAt}
            />
          </div>
        )}
      </div>

      <section className="mt-16">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold">Historique</h2>
          <div className="flex w-full gap-3 sm:w-auto">
            <div className="min-w-0 flex-1 sm:w-44 sm:flex-none">
              <Select
                label="Catégorie"
                options={CATEGORIES}
                value={filterCategory}
                onChange={setFilterCategory}
                emptyLabel="Toutes"
              />
            </div>
            <div className="min-w-0 flex-1 sm:w-44 sm:flex-none">
              <Select
                label="Type"
                options={TYPES}
                value={filterType}
                onChange={setFilterType}
                emptyLabel="Tous"
              />
            </div>
          </div>
        </div>

        <HistoryList generations={filteredHistory} onDelete={remove} />
      </section>
    </>
  );
}
