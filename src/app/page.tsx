import { Library } from "@/components/Library";
import { listArticles } from "@/lib/content";

// Les textes sont des fichiers sur disque : on relit à chaque requête pour que
// les nouveautés apparaissent sans avoir à reconstruire le site.
export const dynamic = "force-dynamic";

export default async function Home() {
  const articles = await listArticles();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-14 sm:py-20">
      <header className="mb-10">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          learning
        </h1>
        <p className="mt-3 max-w-xl leading-relaxed text-muted">
          Une petite bibliothèque de textes courts et sourcés, pour apprendre une
          chose à la fois. Choisis un domaine ou un format, et lis.
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm leading-relaxed text-muted">
          La bibliothèque est vide. Les textes se rangent dans le dossier
          <code className="mx-1 rounded bg-surface-sunken px-1.5 py-0.5">content/</code>
          — lance la commande de génération pour la remplir.
        </p>
      ) : (
        <Library articles={articles} />
      )}
    </main>
  );
}
