import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsNav } from "@/components/settings/SettingsNav";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-lg font-bold mb-4" style={{ color: "var(--fg)" }}>Impostazioni</h1>

      {/* Mobile nav — scrollabile orizzontale */}
      <div className="md:hidden mb-4 -mx-3 px-3">
        <SettingsNav mobile />
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <div className="hidden md:block w-44 shrink-0">
          <SettingsNav />
        </div>

        {/* Content — no card on mobile, card on desktop */}
        <div className="flex-1 min-w-0 overflow-x-hidden">
          {/* Mobile: plain sections, no outer card */}
          <div className="md:hidden">
            {children}
          </div>
          {/* Desktop: wrapped in card */}
          <div className="hidden md:block rounded-2xl border p-6"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
