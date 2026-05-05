import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — Beta Feedback" };

const PRIORITY_STYLE: Record<string, { bg: string; color: string }> = {
  low:      { bg: "rgba(217,119,6,0.1)",  color: "#D97706" },
  normal:   { bg: "rgba(109,65,255,0.1)", color: "#6D41FF" },
  high:     { bg: "rgba(251,113,65,0.1)",  color: "#FB7141" },
  critical: { bg: "rgba(220,38,38,0.1)",  color: "#DC2626" },
};

export default async function AdminBetaPage({
  searchParams,
}: {
  searchParams: Promise<{ priority?: string; resolved?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();

  let query = supabase
    .from("beta_feedback")
    .select(`*, user:profiles!user_id(username, display_name, avatar_url)`)
    .order("created_at", { ascending: false })
    .limit(100);

  if (params.priority) query = query.eq("priority", params.priority);
  if (params.resolved === "1") query = query.eq("is_resolved", true);
  else query = query.eq("is_resolved", false);

  const { data: items } = await query;

  const { data: betaUsers } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("is_beta", true)
    .order("display_name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-black">Beta Feedback</h1>
          <p className="text-sm text-black/40 mt-0.5">{betaUsers?.length ?? 0} beta tester attivi</p>
        </div>
      </div>

      {/* Beta testers list */}
      {betaUsers && betaUsers.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-black/30 uppercase tracking-widest mb-2">Beta Tester</p>
          <div className="flex flex-wrap gap-2">
            {betaUsers.map(u => (
              <a
                key={u.id}
                href={`/u/${u.username}`}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-colors hover:bg-[rgba(109,65,255,0.15)]"
                style={{ background: "rgba(109,65,255,0.08)", color: "#6D41FF" }}
              >
                @{u.username}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { href: "/admin/beta", label: "Aperti" },
          { href: "/admin/beta?resolved=1", label: "Risolti" },
          { href: "/admin/beta?priority=critical", label: "🔴 Critici" },
          { href: "/admin/beta?priority=high", label: "🟠 Alta priorità" },
        ].map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
            style={{ background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.5)" }}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Feedback list */}
      <div className="bg-white border border-black/6 rounded-2xl divide-y divide-black/4">
        {(items ?? []).length === 0 && (
          <p className="text-center text-black/25 py-12 text-sm">Nessun feedback beta</p>
        )}
        {(items ?? []).map(item => {
          const prio = PRIORITY_STYLE[item.priority] ?? PRIORITY_STYLE.normal;
          const user = item.user as { username: string; display_name: string } | null;
          return (
            <div key={item.id} className="p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                    style={{ background: prio.bg, color: prio.color }}
                  >
                    {item.priority}
                  </span>
                  <span className="text-xs text-black/30">
                    @{user?.username ?? "—"} · {formatDate(item.created_at)}
                  </span>
                </div>
                <p className="text-sm text-black/80">{item.message}</p>
              </div>
              <ResolveButton id={item.id} isResolved={item.is_resolved} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResolveButton({ id, isResolved }: { id: string; isResolved: boolean }) {
  return (
    <form action={`/api/admin/beta/${id}/resolve`} method="POST">
      <button
        type="submit"
        className="text-xs px-3 py-1.5 rounded-xl transition-colors shrink-0"
        style={isResolved
          ? { background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.35)" }
          : { background: "rgba(109,65,255,0.1)", color: "#6D41FF" }
        }
      >
        {isResolved ? "Riapri" : "Risolvi"}
      </button>
    </form>
  );
}
