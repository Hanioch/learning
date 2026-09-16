import { listGenerations } from "@/lib/generations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const limit = Number(params.get("limit") ?? "50");

  const generations = await listGenerations({
    category: params.get("category") ?? undefined,
    type: params.get("type") ?? undefined,
    limit: Number.isFinite(limit) ? limit : 50,
  });

  return Response.json({ generations });
}
