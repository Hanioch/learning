import { deleteGeneration, getGeneration } from "@/lib/generations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  const generation = await getGeneration(id);
  if (!generation) {
    return Response.json({ error: "Introuvable." }, { status: 404 });
  }
  return Response.json({ generation });
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  const deleted = await deleteGeneration(id);
  if (!deleted) {
    return Response.json({ error: "Introuvable." }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}
