import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Accedi", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-black">Bentornato</h1>
        <p className="text-base text-black/40 mt-1">Accedi al tuo account per continuare</p>
      </div>
      <Suspense fallback={null}><LoginForm /></Suspense>
      <div className="mt-5 p-4 rounded-2xl border border-black/8 bg-black/[0.02]">
        <p className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-1">Assistenza</p>
        <p className="text-sm text-black/60">
          Password dimenticata?{" "}
          <a href="/forgot-password" className="font-semibold text-black hover:underline">Resettala!</a>
        </p>
      </div>
      <p className="text-center text-sm text-black/30 mt-7">
        Non hai un account?{" "}
        <a href="/register" className="text-black font-medium hover:underline transition-colors">Registrati</a>
      </p>
    </>
  );
}
