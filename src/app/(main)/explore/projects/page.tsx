import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

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
      <h1 className="text-xl font-bold text-black">Progetti</h1>
      <div className="space-y-3">
        {(projects ?? []).map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-black/6 p-4 hover:border-black/15 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold text-black">{p.name}</h2>
                {p.description && (
                  <p className="text-sm text-black/55 mt-1 line-clamp-2">{p.description}</p>
                )}
              </div>
              <span className="text-xs bg-black/5 text-black/60 px-2 py-1 rounded-full whitespace-nowrap">
                {stageLabels[p.stage] ?? p.stage}
              </span>
            </div>
            {p.looking_for?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {p.looking_for.map((r: string) => (
                  <span key={r} className="text-xs bg-black/4 text-black/55 px-2 py-0.5 rounded-full">
                    cercasi {r}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {!projects?.length && (
          <p className="text-center text-black/40 py-12">Nessun progetto trovato.</p>
        )}
      </div>
    </div>
  );
}
