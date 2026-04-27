import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Admin — Analytics" };

export default async function AdminAnalyticsPage() {
  const supabase = createAdminClient();

  // Users per country (top 10)
  const { data: byCountry } = await supabase
    .from("profiles")
    .select("country_code")
    .not("country_code", "is", null)
    .limit(1000);

  const countryCounts = (byCountry ?? []).reduce(
    (acc: Record<string, number>, { country_code }) => {
      if (country_code) acc[country_code] = (acc[country_code] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const topCountries = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // Users per role
  const { data: byRole } = await supabase.from("profiles").select("role").limit(10000);
  const roleCounts = (byRole ?? []).reduce(
    (acc: Record<string, number>, { role }) => {
      acc[role] = (acc[role] ?? 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Utenti per paese</h2>
          <div className="space-y-2">
            {topCountries.map(([code, count]) => (
              <div key={code} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{code}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Utenti per ruolo</h2>
          <div className="space-y-2">
            {Object.entries(roleCounts).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{role}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
