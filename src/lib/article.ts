/**
 * Découpe la réponse du modèle selon le contrat de format défini dans `claude.ts` :
 * une ligne `# titre`, une ligne `> résumé`, puis le corps.
 * Tolérant : si le modèle s'écarte du format, on retombe sur des valeurs
 * raisonnables plutôt que d'échouer après avoir déjà payé la génération.
 */
export function parseArticle(raw: string): {
  title: string;
  summary: string;
  content: string;
} {
  const text = raw.trim();
  const lines = text.split("\n");

  let title = "";
  let summary = "";
  const body: string[] = [];

  for (const line of lines) {
    if (!title) {
      const h1 = /^#\s+(.+?)\s*$/.exec(line);
      if (h1) {
        title = h1[1];
        continue;
      }
    }
    if (title && !summary && body.length === 0) {
      const quote = /^>\s*(.+?)\s*$/.exec(line);
      if (quote) {
        summary = quote[1];
        continue;
      }
      if (!line.trim()) continue;
    }
    body.push(line);
  }

  const content = body.join("\n").trim();

  if (!title) {
    title = text.split("\n").find((l) => l.trim())?.replace(/^#+\s*/, "").slice(0, 120) ?? "Sans titre";
  }
  if (!summary) {
    const firstParagraph = content
      .split("\n\n")
      .find((p) => p.trim() && !p.trim().startsWith("#"));
    summary = (firstParagraph ?? "").replace(/\s+/g, " ").slice(0, 200).trim();
  }

  return { title, summary, content: content || text };
}
