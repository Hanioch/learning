export type Source = {
  title: string;
  url: string;
};

/** Ce que le client manipule : une génération, sources déjà désérialisées. */
export type Generation = {
  id: string;
  category: string;
  type: string;
  topic: string | null;
  title: string;
  summary: string;
  content: string;
  sources: Source[];
  model: string;
  createdAt: string;
};

/** Les phases affichées pendant la génération, dans l'ordre. */
export type Phase = "connecting" | "thinking" | "searching" | "writing" | "saving";

/** Messages poussés par /api/generate sur le flux SSE. */
export type StreamEvent =
  | { type: "phase"; phase: Phase }
  | { type: "thinking"; text: string }
  | { type: "search"; query: string }
  | { type: "delta"; text: string }
  | { type: "sources"; sources: Source[] }
  | { type: "done"; generation: Generation }
  | { type: "error"; message: string };
