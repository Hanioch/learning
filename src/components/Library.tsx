"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, TYPES } from "@/lib/taxonomy";
import type { Article } from "@/lib/types";
import { ArticleList } from "./ArticleList";
import { Select } from "./Select";

export function Library({ articles }: { articles: Article[] }) {
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  const filtered = useMemo(
    () =>
      articles.filter(
        (a) =>
          (!category || a.category === category) && (!type || a.type === type),
      ),
    [articles, category, type],
  );

  // On ne propose que les filtres qui donneraient au moins un résultat.
  const availableCategories = useMemo(() => {
    const present = new Set(articles.map((a) => a.category));
    return CATEGORIES.filter((c) => present.has(c.id));
  }, [articles]);

  const availableTypes = useMemo(() => {
    const present = new Set(articles.map((a) => a.type));
    return TYPES.filter((t) => present.has(t.id));
  }, [articles]);

  return (
    <>
      <section className="mb-8 flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 sm:w-48 sm:flex-none">
          <Select
            label="Catégorie"
            options={availableCategories}
            value={category}
            onChange={setCategory}
            emptyLabel="Toutes"
          />
        </div>
        <div className="min-w-0 flex-1 sm:w-48 sm:flex-none">
          <Select
            label="Type"
            options={availableTypes}
            value={type}
            onChange={setType}
            emptyLabel="Tous"
          />
        </div>
        <p className="ml-auto pb-3 text-sm text-muted">
          {filtered.length} texte{filtered.length > 1 ? "s" : ""}
          {(category || type) && ` sur ${articles.length}`}
        </p>
      </section>

      <ArticleList articles={filtered} />
    </>
  );
}
