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
      <p className="text-center text-sm text-black/30 mt-7">
        Non hai un account?{" "}
        <a href="/register" className="text-black font-medium hover:underline transition-colors">Registrati</a>
      </p>
    </>
  );
}
