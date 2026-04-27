import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verifica email",
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mx-auto mb-5">
        <span className="text-white text-2xl">@</span>
      </div>
      <h1 className="text-xl font-bold text-black mb-2">Controlla la tua email</h1>
      <p className="text-black/50 text-sm">
        Ti abbiamo inviato un link di conferma. Controlla anche la cartella spam.
      </p>
      <p className="text-center text-sm text-black/35 mt-6">
        <a href="/login" className="text-black font-medium hover:underline">← Torna al login</a>
      </p>
    </div>
  );
}
