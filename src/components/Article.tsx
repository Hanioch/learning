import Link from "next/link";
import { categoryLabel, typeLabel } from "@/lib/taxonomy";
import type { Article as ArticleType } from "@/lib/types";
import { Markdown } from "./Markdown";

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
      {children}
    </span>
  );
}

export function Article({ article }: { article: ArticleType }) {
  return (
    <article className="animate-fade-up">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Tag>{categoryLabel(article.category)}</Tag>
        <Tag>{typeLabel(article.type)}</Tag>
        <span className="text-xs text-muted">{formatDate(article.date)}</span>
      </div>

      <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        {article.title}
      </h1>

      <p className="mt-3 border-l-2 border-accent pl-4 text-lg leading-relaxed text-muted">
        {article.summary}
      </p>

      <div className="prose mt-8">
        <Markdown>{article.content}</Markdown>
      </div>

      {article.sources.length > 0 && (
        <section className="mt-12 border-t border-border pt-6">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-muted">
            Sources consultées
          </h2>
          <ol className="space-y-2">
            {article.sources.map((source, index) => (
              <li key={source.url} className="flex gap-3 text-sm">
                <span className="w-5 shrink-0 tabular-nums text-muted">{index + 1}.</span>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group min-w-0"
                >
                  <span className="underline decoration-border underline-offset-4 group-hover:decoration-accent">
                    {source.title}
                  </span>
                  <span className="ml-2 text-muted">{hostOf(source.url)}</span>
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}

export function BackLink() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
    >
      <span aria-hidden>←</span> Retour
    </Link>
  );
}
