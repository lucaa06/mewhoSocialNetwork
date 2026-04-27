import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsNav } from "@/components/settings/SettingsNav";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-lg font-semibold text-black mb-4 sm:mb-6">Impostazioni</h1>

      {/* Mobile nav — scrollabile orizzontale */}
      <div className="md:hidden mb-4 -mx-4 px-4">
        <SettingsNav mobile />
      </div>

      <div className="flex gap-6">
        {/* Desktop nav */}
        <div className="hidden md:block w-44 shrink-0">
          <SettingsNav />
        </div>
        <div className="flex-1 bg-white rounded-2xl border border-black/6 p-4 sm:p-6 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
