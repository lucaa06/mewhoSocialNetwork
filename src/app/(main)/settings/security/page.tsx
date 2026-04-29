import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { MfaSection } from "@/components/settings/MfaSection";

export const metadata: Metadata = { title: "Impostazioni sicurezza" };

export default async function SecuritySettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.auth.mfa.listFactors();
  const totpFactor = data?.totp?.[0];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-black mb-4">Sicurezza</h2>
        <MfaSection isEnrolled={!!totpFactor} factorId={totpFactor?.id} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-black mb-4">Cambia password</h3>
        <ChangePasswordForm email={user?.email ?? ""} />
      </div>
    </div>
  );
}
