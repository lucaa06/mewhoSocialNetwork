import type { Metadata } from "next";
import { Suspense } from "react";
import { TwoFactorForm } from "@/components/auth/TwoFactorForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Verifica identità", robots: { index: false, follow: false } };

export default function TwoFactorPage() {
  return (
    <>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-black">Verifica in due passaggi</h1>
        <p className="text-base text-black/40 mt-1">Conferma la tua identità</p>
      </div>
      <Suspense fallback={null}>
        <TwoFactorForm />
      </Suspense>
      <p className="text-center text-sm text-black/30 mt-7">
        Problemi con il codice?{" "}
        <a href="/login" className="text-black font-medium hover:underline transition-colors">Torna al login</a>
      </p>
    </>
  );
}
