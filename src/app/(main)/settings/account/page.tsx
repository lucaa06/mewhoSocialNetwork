import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AccountSettingsForm } from "@/components/settings/AccountSettingsForm";

export const metadata: Metadata = { title: "Impostazioni account" };

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div>
      <h2 className="text-lg font-semibold text-black mb-4">Account</h2>
      <AccountSettingsForm profile={profile} email={user!.email ?? ""} />
    </div>
  );
}
