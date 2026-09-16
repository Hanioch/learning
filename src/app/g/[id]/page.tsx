import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article, BackLink } from "@/components/Article";
import { getGeneration } from "@/lib/generations";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/g/[id]">): Promise<Metadata> {
  const { id } = await params;
  const generation = await getGeneration(id);
  if (!generation) return { title: "Introuvable — learning" };
  return {
    title: `${generation.title} — learning`,
    description: generation.summary,
  };
}

export default async function GenerationPage({ params }: PageProps<"/g/[id]">) {
  const { id } = await params;
  const generation = await getGeneration(id);
  if (!generation) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">
      <div className="mb-8">
        <BackLink />
      </div>
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-10">
        <Article
          title={generation.title}
          summary={generation.summary}
          content={generation.content}
          sources={generation.sources}
          category={generation.category}
          type={generation.type}
          createdAt={generation.createdAt}
        />
      </div>
    </main>
  );
}
