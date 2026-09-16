import Link from "next/link";
import { categoryLabel, typeLabel } from "@/lib/taxonomy";
import type { Article } from "@/lib/types";
import { formatDate } from "./Article";

export function ArticleList({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted">
        Rien ne correspond à ce filtre pour l&apos;instant.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {articles.map((article) => (
        <li
          key={article.slug}
          className="group relative rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
        >
          <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <span className="text-accent">{categoryLabel(article.category)}</span>
            <span aria-hidden>·</span>
            <span>{typeLabel(article.type)}</span>
            <span aria-hidden>·</span>
            <span>{formatDate(article.date)}</span>
          </div>

          <h3 className="font-display text-lg font-semibold leading-snug">
            <Link href={`/a/${article.slug}`} className="before:absolute before:inset-0">
              {article.title}
            </Link>
          </h3>

          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
            {article.summary}
          </p>

          {article.sources.length > 0 && (
            <p className="mt-3 text-xs text-muted">
              {article.sources.length} source{article.sources.length > 1 ? "s" : ""}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
