import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Messaggi",
  robots: { index: false, follow: false },
};

export default function MessagesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-2xl bg-black/4 flex items-center justify-center">
        <MessageCircle className="w-8 h-8 text-black/30" />
      </div>
      <div className="text-center">
        <h1 className="text-lg font-semibold text-black">Messaggi</h1>
        <p className="text-sm text-black/40 mt-1">In arrivo nella prossima versione.</p>
      </div>
    </div>
  );
}
