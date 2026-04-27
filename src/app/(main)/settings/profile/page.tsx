import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";

export const metadata: Metadata = { title: "Impostazioni profilo" };

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div>
      <h2 className="text-lg font-semibold text-black mb-4">Profilo pubblico</h2>
      <ProfileSettingsForm profile={profile} />
    </div>
  );
}
