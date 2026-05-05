import Link from "next/link";
import { LogoIcon } from "@/components/ui/Logo";

export function GuestBanner() {
  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center gap-4"
      style={{
        background: "linear-gradient(135deg,rgba(251,113,65,0.07) 0%,rgba(109,65,255,0.07) 100%)",
        border: "1px solid rgba(251,113,65,0.15)",
      }}
    >
      <LogoIcon size={36} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold" style={{ color: "var(--fg)", fontFamily: "var(--fh)" }}>
          Benvenuto su me&amp;who
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
          Esplora idee e progetti. Entra per interagire.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/login"
          className="text-sm font-medium px-3 py-1.5 rounded-xl transition-colors"
          style={{ color: "var(--muted)", border: "1px solid var(--border)" }}
        >
          Accedi
        </Link>
        <Link
          href="/register"
          className="text-sm font-semibold px-3 py-1.5 rounded-xl text-white transition-all"
          style={{ background: "#FB7141", boxShadow: "0 2px 10px rgba(251,113,65,0.30)" }}
        >
          Registrati
        </Link>
      </div>
    </div>
  );
}
