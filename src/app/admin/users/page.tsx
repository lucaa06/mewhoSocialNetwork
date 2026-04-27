import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminUserTable } from "@/components/admin/AdminUserTable";

export const metadata: Metadata = { title: "Admin — Utenti" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; suspended?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();

  let query = supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, role, country_code, is_verified, is_suspended, is_banned, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (params.q) {
    query = query.or(`username.ilike.%${params.q}%,display_name.ilike.%${params.q}%`);
  }
  if (params.role) query = query.eq("role", params.role);
  if (params.suspended === "1") query = query.eq("is_suspended", true);

  const { data: users } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Utenti</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <form method="GET" className="flex gap-2">
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Cerca per username o nome..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <select name="role" defaultValue={params.role} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">Tutti i ruoli</option>
              <option value="user">User</option>
              <option value="startupper">Startupper</option>
              <option value="researcher">Researcher</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
              Filtra
            </button>
          </form>
        </div>
        <AdminUserTable users={users ?? []} />
      </div>
    </div>
  );
}
