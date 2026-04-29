import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BackButton } from "@/components/layout/BackButton";

export const metadata: Metadata = {
  title: "Esplora progetti",
  description: "Scopri startup, ricerche e progetti in corso. Trova il tuo prossimo team.",
};

export default async function ExploreProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stage?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("projects")
    .select(`
      id, name, description, stage, country_code, looking_for, created_at,
      owner:profiles!owner_id(id, username, display_name, avatar_url, is_verified)
    `)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(30);

  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,description.ilike.%${params.q}%`);
  }
  if (params.stage) query = query.eq("stage", params.stage);

  const { data: projects } = await query;

  const stageLabels: Record<string, string> = {
    idea: "Idea", mvp: "MVP", growth: "Crescita", scaling: "Scaling", acquired: "Acquisito",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BackButton href="/explore" />
        <h1 className="text-xl font-bold" style={{ color: "var(--fg)" }}>Progetti</h1>
      </div>
      <div className="space-y-3">
        {(projects ?? []).map((p) => (
          <div key={p.id} className="rounded-xl border p-4 transition-colors" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold" style={{ color: "var(--fg)" }}>{p.name}</h2>
                {p.description && (
                  <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--muted)" }}>{p.description}</p>
                )}
              </div>
              <span className="text-xs px-2 py-1 rounded-full whitespace-nowrap shrink-0" style={{ background: "var(--surface)", color: "var(--muted)" }}>
                {stageLabels[p.stage] ?? p.stage}
              </span>
            </div>
            {p.looking_for?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {p.looking_for.map((r: string) => (
                  <span key={r} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--surface)", color: "var(--muted)" }}>
                    cercasi {r}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {!projects?.length && (
          <p className="text-center py-12" style={{ color: "var(--muted)" }}>Nessun progetto trovato.</p>
        )}
      </div>
    </div>
  );
}
