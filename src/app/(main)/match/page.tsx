import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MatchDeck } from "@/components/match/MatchDeck";

export const metadata: Metadata = {
  title: "Collegamento",
  description: "Trova persone con cui collaborare. Swipe per connetterti.",
};

export default async function MatchPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/match");

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "calc(100dvh - 120px)",
      maxWidth: 440,
      margin: "0 auto",
      padding: "16px 16px 0",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", fontFamily: "var(--fh)", letterSpacing: "-0.4px", margin: "0 0 2px" }}>
          Collegamento
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
          Swipe a destra per connetterti, a sinistra per passare oltre.
        </p>
      </div>

      <MatchDeck />
    </div>
  );
}
