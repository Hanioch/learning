import Anthropic from "@anthropic-ai/sdk";
import { parseArticle } from "@/lib/article";
import { buildPrompt, MODEL } from "@/lib/claude";
import { listGenerations, saveGeneration } from "@/lib/generations";
import { getCategory, getType } from "@/lib/taxonomy";
import type { Source, StreamEvent } from "@/lib/types";

// Prisma et better-sqlite3 ont besoin du runtime Node, pas de l'edge runtime.
export const runtime = "nodejs";
// Une génération avec recherche web prend facilement une à deux minutes.
export const maxDuration = 300;

const MAX_SOURCES = 12;
/** Garde-fou : le modèle peut mettre le tour en pause pendant une recherche longue. */
const MAX_TURNS = 6;

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const { category, type, topic } = (payload ?? {}) as {
    category?: string;
    type?: string;
    topic?: string;
  };

  if (!category || !getCategory(category)) {
    return Response.json({ error: "Catégorie inconnue." }, { status: 400 });
  }
  if (!type || !getType(type)) {
    return Response.json({ error: "Type inconnu." }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        error:
          "ANTHROPIC_API_KEY n'est pas définie. Ajoute-la dans .env puis relance le serveur.",
      },
      { status: 503 },
    );
  }

  const cleanTopic = topic?.trim().slice(0, 300) || null;

  const encoder = new TextEncoder();
  const client = new Anthropic();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;

      const send = (event: StreamEvent) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      const close = () => {
        if (closed) return;
        closed = true;
        controller.close();
      };

      try {
        send({ type: "phase", phase: "connecting" });

        // On évite de reproposer un sujet déjà présent dans l'historique.
        const previous = await listGenerations({ category, type, limit: 25 });
        const { system, user } = buildPrompt({
          category,
          type,
          topic: cleanTopic,
          avoidTitles: previous.map((g) => g.title),
        });

        const messages: Anthropic.MessageParam[] = [{ role: "user", content: user }];
        const sources = new Map<string, Source>();
        let article = "";
        let turns = 0;

        // Boucle de reprise : un tour peut s'arrêter en `pause_turn` au milieu
        // d'une recherche web. On renvoie alors le tour tel quel pour continuer.
        while (turns < MAX_TURNS) {
          turns += 1;

          const turn = client.messages.stream(
            {
              model: MODEL,
              max_tokens: 16000,
              system,
              messages,
              // `summarized` nous donne de quoi animer l'attente ; par défaut le
              // texte de réflexion est vide sur les modèles récents.
              thinking: { type: "adaptive", display: "summarized" },
              // "medium" suffit pour de la rédaction documentée ; passe à "high"
              // pour des sujets techniques plus exigeants.
              output_config: { effort: "medium" },
              tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 8 }],
            },
            { signal: request.signal },
          );

          // Entrées d'outil en cours de construction, indexées par bloc.
          const pendingToolInput = new Map<number, string>();

          for await (const event of turn) {
            switch (event.type) {
              case "content_block_start": {
                const block = event.content_block;
                if (block.type === "thinking") {
                  send({ type: "phase", phase: "thinking" });
                } else if (block.type === "server_tool_use") {
                  send({ type: "phase", phase: "searching" });
                  pendingToolInput.set(event.index, "");
                } else if (block.type === "web_search_tool_result") {
                  // En cas d'erreur serveur, `content` est un objet, pas un tableau.
                  if (Array.isArray(block.content)) {
                    for (const result of block.content) {
                      if (sources.size >= MAX_SOURCES) break;
                      if (!sources.has(result.url)) {
                        sources.set(result.url, {
                          url: result.url,
                          title: result.title || result.url,
                        });
                      }
                    }
                    send({ type: "sources", sources: [...sources.values()] });
                  }
                } else if (block.type === "text") {
                  send({ type: "phase", phase: "writing" });
                }
                break;
              }

              case "content_block_delta": {
                const delta = event.delta;
                if (delta.type === "text_delta") {
                  article += delta.text;
                  send({ type: "delta", text: delta.text });
                } else if (delta.type === "thinking_delta") {
                  send({ type: "thinking", text: delta.thinking });
                } else if (delta.type === "input_json_delta") {
                  const current = pendingToolInput.get(event.index);
                  if (current !== undefined) {
                    pendingToolInput.set(event.index, current + delta.partial_json);
                  }
                }
                break;
              }

              case "content_block_stop": {
                const raw = pendingToolInput.get(event.index);
                pendingToolInput.delete(event.index);
                if (raw) {
                  // L'entrée d'outil peut être tronquée : on ne fait pas confiance au JSON.
                  try {
                    const parsed: unknown = JSON.parse(raw);
                    const query = (parsed as { query?: unknown })?.query;
                    if (typeof query === "string" && query.trim()) {
                      send({ type: "search", query: query.trim() });
                    }
                  } catch {
                    /* entrée incomplète : rien à afficher */
                  }
                }
                break;
              }
            }
          }

          const message = await turn.finalMessage();

          if (message.stop_reason === "refusal") {
            throw new Error(
              "Le modèle a refusé de traiter ce sujet. Reformule-le ou change de sujet.",
            );
          }
          if (message.stop_reason === "pause_turn") {
            messages.push({ role: "assistant", content: message.content });
            continue;
          }
          break;
        }

        if (!article.trim()) {
          throw new Error("Le modèle n'a renvoyé aucun texte.");
        }

        send({ type: "phase", phase: "saving" });

        const { title, summary, content } = parseArticle(article);
        const generation = await saveGeneration({
          category,
          type,
          topic: cleanTopic,
          title,
          summary,
          content,
          sources: [...sources.values()],
          model: MODEL,
        });

        send({ type: "done", generation });
      } catch (error) {
        if (request.signal.aborted) {
          close();
          return;
        }
        const message =
          error instanceof Anthropic.APIError
            ? `Erreur API Claude (${error.status ?? "réseau"}) : ${error.message}`
            : error instanceof Error
              ? error.message
              : "Erreur inconnue pendant la génération.";
        console.error("[generate]", error);
        send({ type: "error", message });
      } finally {
        close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Empêche la mise en tampon du flux par un proxy en amont.
      "X-Accel-Buffering": "no",
    },
  });
}
