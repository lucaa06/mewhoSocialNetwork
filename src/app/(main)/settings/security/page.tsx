import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { MfaSection } from "@/components/settings/MfaSection";

export const metadata: Metadata = { title: "Impostazioni sicurezza" };

export default async function SecuritySettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.mfa.listFactors();
  const totpFactor = data?.totp?.[0];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-black">Sicurezza</h2>
      <MfaSection isEnrolled={!!totpFactor} factorId={totpFactor?.id} />
      <ChangePasswordForm />
    </div>
  );
}
