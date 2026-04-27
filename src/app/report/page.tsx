import type { Metadata } from "next";
import { ReportForm } from "@/components/modals/ReportForm";

export const metadata: Metadata = {
  title: "Segnala",
  robots: { index: false, follow: false },
};

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; id?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-black/6 shadow-[0_2px_24px_rgba(0,0,0,0.06)] p-8 max-w-lg w-full">
        <h1 className="text-xl font-bold text-black mb-2">Segnala un problema</h1>
        <p className="text-sm text-black/45 mb-6">
          Il tuo report sarà esaminato dal team di moderazione entro 24 ore.
        </p>
        <ReportForm
          defaultTargetType={(params.type as "user" | "post" | "comment") ?? "post"}
          defaultTargetId={params.id ?? ""}
        />
      </div>
    </div>
  );
}
