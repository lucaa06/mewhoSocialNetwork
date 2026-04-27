"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/validations";
import type { Profile } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export function ProfileSettingsForm({ profile }: { profile: Profile | null }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      display_name: profile?.display_name ?? "",
      bio: profile?.bio ?? "",
      role: (profile?.role as ProfileUpdateInput["role"]) ?? "user",
      country_code: profile?.country_code ?? "",
      city: profile?.city ?? "",
    },
  });

  async function onSubmit(data: ProfileUpdateInput) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update(data).eq("id", profile!.id);
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Profilo aggiornato");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <p className="label-xs mb-1.5">Nome visualizzato</p>
        <input {...register("display_name")} className="input-base" />
        {errors.display_name && <p className="text-xs text-black/40 mt-1">{errors.display_name.message}</p>}
      </div>
      <div>
        <p className="label-xs mb-1.5">Ruolo</p>
        <select {...register("role")} className="input-base cursor-pointer">
          <option value="user">Utente</option>
          <option value="startupper">Startupper</option>
          <option value="researcher">Ricercatore</option>
        </select>
      </div>
      <div>
        <p className="label-xs mb-1.5">Città</p>
        <input {...register("city")} placeholder="Es. Milano" className="input-base" />
      </div>
      <div>
        <p className="label-xs mb-1.5">Bio</p>
        <textarea {...register("bio")} rows={3} placeholder="Parlaci di te..." className="input-base resize-none" />
      </div>
      <button type="submit" disabled={loading}
        className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-black/85 disabled:opacity-40 transition-colors"
      >
        {loading ? "Salvando..." : "Salva"}
      </button>
    </form>
  );
}
