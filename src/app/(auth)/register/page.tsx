import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Registrati", robots: { index: false, follow: false } };

export default function RegisterPage() {
  return (
    <>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-black">Crea il tuo account</h1>
        <p className="text-base text-black/40 mt-1">Unisciti alla community</p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-black/30 mt-7">
        Hai già un account?{" "}
        <a href="/login" className="text-black font-medium hover:underline transition-colors">Accedi</a>
      </p>
      <p className="text-center text-xs text-black/20 mt-3">
        Registrandoti accetti i{" "}
        <a href="/legal/terms" className="underline underline-offset-2">Termini</a>
        {" "}e la{" "}
        <a href="/legal/privacy" className="underline underline-offset-2">Privacy Policy</a>.
      </p>
    </>
  );
}
