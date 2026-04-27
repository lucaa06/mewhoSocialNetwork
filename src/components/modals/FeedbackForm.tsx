"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { feedbackSchema, type FeedbackInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const CATEGORIES = [
  { value: "suggestion", label: "Suggerimento" },
  { value: "compliment", label: "Complimento" },
  { value: "problem", label: "Problema" },
  { value: "idea", label: "Idea" },
];

export function FeedbackForm() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { category: "suggestion" },
  });

  const message = watch("message", "");

  async function onSubmit(data: FeedbackInput) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("feedback").insert({ user_id: user?.id ?? null, ...data });
    if (error) { toast.error("Errore durante l'invio"); return; }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center mx-auto mb-3">
          <span className="text-white text-lg">✓</span>
        </div>
        <p className="font-semibold text-black">Grazie per il feedback!</p>
        <p className="text-sm text-black/45 mt-1">Lo leggeremo con attenzione.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label-xs block mb-2">Categoria</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(({ value, label }) => (
            <label key={value} className="relative cursor-pointer">
              <input type="radio" value={value} {...register("category")} className="sr-only peer" />
              <div className="border border-black/8 peer-checked:border-black peer-checked:bg-black/4 rounded-xl px-3 py-2 text-sm text-center text-black/60 peer-checked:text-black transition-colors">
                {label}
              </div>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="label-xs block mb-1.5">Messaggio</label>
        <textarea
          {...register("message")}
          rows={5}
          placeholder="Scrivi qui il tuo messaggio..."
          className="input-base resize-none"
        />
        <div className="flex justify-between mt-1">
          {errors.message && <span className="text-xs text-black/50">{errors.message.message}</span>}
          <span className="text-xs text-black/30 ml-auto">{message.length}/2000</span>
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full py-2.5"
      >
        {isSubmitting ? "Inviando..." : "Invia feedback"}
      </button>
    </form>
  );
}
