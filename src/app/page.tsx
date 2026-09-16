import { Studio } from "@/components/Studio";
import { listGenerations } from "@/lib/generations";

// L'historique vient de la base : pas de mise en cache statique.
export const dynamic = "force-dynamic";

export default async function Home() {
  const history = await listGenerations({ limit: 60 });

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-14 sm:py-20">
      <header className="mb-10">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          learning
        </h1>
        <p className="mt-3 max-w-xl leading-relaxed text-muted">
          Choisis un domaine et un format. Le texte est écrit à la demande, sourcé
          en ligne, et rangé dans l&apos;historique pour que tu puisses y revenir.
        </p>
      </header>

      <Studio initialHistory={history} />
    </main>
  );
}
