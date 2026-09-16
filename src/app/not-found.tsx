import { BackLink } from "@/components/Article";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center gap-4 px-5 py-24">
      <h1 className="font-display text-3xl font-semibold">Page introuvable</h1>
      <p className="text-muted">
        Ce texte n&apos;existe pas ou plus dans la bibliothèque.
      </p>
      <BackLink />
    </main>
  );
}
