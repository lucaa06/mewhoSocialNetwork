import type { Metadata } from "next";
import { Suspense } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminUserTable } from "@/components/admin/AdminUserTable";
import { AdminUserFilters } from "@/components/admin/AdminUserFilters";

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

  // Fetch auth users to get emails
  const { data: { users: authUsers } } = await createAdminClient().auth.admin.listUsers({ perPage: 1000 });
  const emailMap = new Map<string, string>(
    (authUsers ?? []).map((u) => [u.id, u.email ?? ""])
  );

  const usersWithEmail = (users ?? []).map((u) => ({
    ...u,
    email: emailMap.get(u.id) || undefined,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-black">Utenti</h1>
      <Suspense>
        <AdminUserFilters q={params.q} role={params.role} suspended={params.suspended} />
      </Suspense>
      <div className="bg-white border border-black/6 rounded-2xl">
        <AdminUserTable users={usersWithEmail} />
      </div>
    </div>
  );
}
