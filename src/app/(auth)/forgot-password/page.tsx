import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Password dimenticata",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-7">
        <h1 className="text-xl font-bold text-black">Recupera password</h1>
        <p className="text-sm text-black/40 mt-1">
          Inserisci la tua email e ti mandiamo un link per reimpostare la password.
        </p>
      </div>
      <ForgotPasswordForm />
      <p className="text-center text-sm text-black/35 mt-6">
        <a href="/login" className="text-black font-medium hover:underline">← Torna al login</a>
      </p>
    </>
  );
}
