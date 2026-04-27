"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bugReportSchema, type BugReportInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export function BugReportForm() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<BugReportInput>({
    resolver: zodResolver(bugReportSchema),
    defaultValues: { severity: "medium" },
  });

  async function onSubmit(data: BugReportInput) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const browser_info = {
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: new Date().toISOString(),
    };
    const { error } = await supabase.from("bug_reports").insert({ user_id: user?.id ?? null, ...data, browser_info });
    if (error) { toast.error("Errore durante la segnalazione"); return; }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center mx-auto mb-3">
          <span className="text-white text-lg">✓</span>
        </div>
        <p className="font-semibold text-black">Bug segnalato!</p>
        <p className="text-sm text-black/45 mt-1">Grazie per averci aiutato a migliorare.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label-xs block mb-1.5">Titolo</label>
        <input
          {...register("title")}
          placeholder="Descrivi brevemente il bug..."
          className="input-base"
        />
        {errors.title && <p className="text-xs text-black/50 mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label className="label-xs block mb-1.5">Descrizione</label>
        <textarea
          {...register("description")}
          rows={5}
          placeholder="Come riprodurre il bug? Cosa ti aspettavi? Cosa è successo invece?"
          className="input-base resize-none"
        />
        {errors.description && <p className="text-xs text-black/50 mt-1">{errors.description.message}</p>}
      </div>
      <div>
        <label className="label-xs block mb-1.5">Gravità</label>
        <select {...register("severity")} className="input-base cursor-pointer">
          <option value="low">Bassa — disturbo estetico</option>
          <option value="medium">Media — funzionalità limitata</option>
          <option value="high">Alta — funzionalità non funziona</option>
          <option value="critical">Critica — perdita dati / sicurezza</option>
        </select>
      </div>
      <p className="text-xs text-black/30">
        Raccoglieremo automaticamente: URL, browser, dimensioni schermo.
      </p>
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full py-2.5"
      >
        {isSubmitting ? "Inviando..." : "Segnala bug"}
      </button>
    </form>
  );
}
