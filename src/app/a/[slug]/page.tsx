import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article, BackLink } from "@/components/Article";
import { getArticle } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/a/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Introuvable — learning" };
  return { title: `${article.title} — learning`, description: article.summary };
}

export default async function ArticlePage({ params }: PageProps<"/a/[slug]">) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">
      <div className="mb-8">
        <BackLink />
      </div>
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-10">
        <Article article={article} />
      </div>
    </main>
  );
}
