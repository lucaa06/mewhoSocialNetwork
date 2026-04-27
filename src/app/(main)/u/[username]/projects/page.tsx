import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ username: string }> };

export default async function UserProjectsPage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles").select("id").eq("username", username).single();
  if (!profile) notFound();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", profile.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-black">Progetti di @{username}</h2>
      {(projects ?? []).map((p) => (
        <div key={p.id} className="bg-white rounded-xl border border-black/6 p-4">
          <h3 className="font-medium text-black">{p.name}</h3>
          {p.description && <p className="text-sm text-black/55 mt-1">{p.description}</p>}
        </div>
      ))}
      {!projects?.length && <p className="text-black/40 text-sm">Nessun progetto pubblico.</p>}
    </div>
  );
}
