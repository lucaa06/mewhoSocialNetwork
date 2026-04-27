import type { Metadata } from "next";
import { FeedbackForm } from "@/components/modals/FeedbackForm";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Invia il tuo feedback al team di me&who.",
};

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-black/6 shadow-[0_2px_24px_rgba(0,0,0,0.06)] p-8 max-w-lg w-full">
        <h1 className="text-xl font-bold text-black mb-2">Feedback</h1>
        <p className="text-sm text-black/45 mb-6">
          Hai un&apos;idea, un complimento o un problema? Scrivici.
        </p>
        <FeedbackForm />
        <p className="text-center text-sm mt-6">
          <a href="/feedback/bug" className="text-black/50 hover:text-black transition-colors">
            Segnala un bug invece →
          </a>
        </p>
      </div>
    </div>
  );
}
