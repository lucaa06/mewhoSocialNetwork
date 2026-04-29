"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reportSchema, type ReportInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const REASONS = [
  "Spam o contenuto ripetitivo",
  "Contenuto offensivo o molestia",
  "Disinformazione",
  "Contenuto illegale",
  "Violazione della privacy",
  "Profilo falso o impersonificazione",
  "Altro",
];

interface ReportFormProps {
  defaultTargetType: "user" | "post" | "comment";
  defaultTargetId: string;
}

export function ReportForm({ defaultTargetType, defaultTargetId }: ReportFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ReportInput>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      target_type: defaultTargetType,
      target_id: defaultTargetId,
    },
  });

  async function onSubmit(data: ReportInput) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Devi essere loggato per segnalare"); return; }

    // Enforce max 3 reports per target (for user reports)
    if (data.target_type === "user") {
      const { count } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("target_id", data.target_id)
        .eq("target_type", "user")
        .in("status", ["pending", "reviewed"]);
      if ((count ?? 0) >= 3) {
        toast.info("Questo account ha già ricevuto il numero massimo di segnalazioni in revisione.");
        return;
      }
    }

    // Check: this user hasn't already reported this target
    const { count: alreadyReported } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("reporter_id", user.id)
      .eq("target_id", data.target_id)
      .eq("target_type", data.target_type);
    if ((alreadyReported ?? 0) > 0) {
      toast.info("Hai già segnalato questo contenuto.");
      return;
    }

    const { error } = await supabase.from("reports").insert({ reporter_id: user.id, ...data });
    if (error) { toast.error("Errore durante la segnalazione"); return; }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center mx-auto mb-3">
          <span className="text-white text-lg">✓</span>
        </div>
        <p className="font-semibold text-black">Segnalazione inviata</p>
        <p className="text-sm text-black/45 mt-1">
          Il team di moderazione esaminerà il tuo report entro 24 ore.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("target_type")} />
      <input type="hidden" {...register("target_id")} />
      <div>
        <label className="label-xs block mb-2">Motivo</label>
        <div className="space-y-2">
          {REASONS.map((reason) => (
            <label key={reason} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                value={reason}
                {...register("reason")}
                className="accent-black"
              />
              <span className="text-sm text-black/70 group-hover:text-black transition-colors">{reason}</span>
            </label>
          ))}
        </div>
        {errors.reason && <p className="text-xs text-black/50 mt-1">{errors.reason.message}</p>}
      </div>
      <div>
        <label className="label-xs block mb-1.5">Dettagli aggiuntivi (opzionale)</label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="Descrivi il problema..."
          className="input-base resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-black/85 disabled:opacity-40 transition-colors"
      >
        {isSubmitting ? "Inviando..." : "Invia segnalazione"}
      </button>
    </form>
  );
}
