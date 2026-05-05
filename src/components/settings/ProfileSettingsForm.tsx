"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/validations";
import type { Profile } from "@/types/database";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket, FlaskConical, User, Check, Pipette, CheckCircle, Sparkles } from "lucide-react";
import { celebrate } from "@/lib/celebrate";
import { saveProfile } from "@/app/actions/profile";
import { AvatarBuilder } from "@/components/profile/AvatarBuilder";

const ROLES = [
  { value: "user",       label: "Maker",       sublabel: "Qui per esplorare e fare", icon: User,         color: "#D97706", bg: "rgba(217,119,6,0.08)"  },
  { value: "startupper", label: "Startupper",  sublabel: "Sto costruendo qualcosa",  icon: Rocket,       color: "#FB7141", bg: "rgba(251,113,65,0.08)"  },
  { value: "researcher", label: "Ricercatore", sublabel: "Ricerca e innovazione",    icon: FlaskConical, color: "#6D41FF", bg: "rgba(109,65,255,0.08)" },
] as const;

const BANNER_PRESETS = [
  { label: "Brand",      value: null,      preview: "linear-gradient(135deg,#FB7141,#1E386C)" },
  { label: "Corallo",    value: "#FB7141", preview: "#FB7141" },
  { label: "Viola",      value: "#6D41FF", preview: "#6D41FF" },
  { label: "Mezzanotte", value: "#0f0c1a", preview: "#0f0c1a" },
  { label: "Oceano",     value: "#0a1628", preview: "#0a1628" },
  { label: "Foresta",    value: "#0d1a0e", preview: "#0d1a0e" },
  { label: "Ambra",      value: "#92400e", preview: "#92400e" },
  { label: "Rosa",       value: "#831843", preview: "#831843" },
  { label: "Grafite",    value: "#1c1917", preview: "#1c1917" },
];

export function ProfileSettingsForm({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [loading, setLoading]             = useState(false);
  const [saved, setSaved]                 = useState(false);
  const [banner, setBanner]               = useState<string | null>(profile?.banner_color ?? null);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [showBuilder, setShowBuilder]     = useState(false);

  const initialBanner = profile?.banner_color ?? null;

  const { register, handleSubmit, control, formState: { errors, isDirty } } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      display_name: profile?.display_name ?? "",
      bio:          profile?.bio ?? "",
      role:         (profile?.role as ProfileUpdateInput["role"]) ?? "user",
      country_code: profile?.country_code ?? "",
      city:         profile?.city ?? "",
    },
  });

  const hasChanges = isDirty || banner !== initialBanner || !!avatarDataUrl;

  async function onSubmit(data: ProfileUpdateInput) {
    if (!profile) return;
    setLoading(true);
    const result = await saveProfile(data, null, banner, avatarDataUrl || undefined);
    setLoading(false);
    if (result.error) { toast.error(result.error); return; }
    setSaved(true);
    celebrate();
    await new Promise(r => setTimeout(r, 700));
    router.push(`/u/${result.username ?? profile.username}`);
  }

  function onValidationError(errs: Record<string, unknown>) {
    const msgs = Object.values(errs)
      .map((e: unknown) => (e as { message?: string })?.message)
      .filter(Boolean).join(", ");
    toast.error(msgs || "Controlla i campi e riprova");
  }

  const currentAvatarSrc = avatarDataUrl ?? profile?.avatar_url ?? null;

  return (
    <>
    {showBuilder && (
      <AvatarBuilder
        onSave={(dataUrl) => { setAvatarDataUrl(dataUrl); setShowBuilder(false); }}
        onClose={() => setShowBuilder(false)}
      />
    )}

    {saved && (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.18)", backdropFilter: "blur(6px)",
        animation: "fadeIn 0.15s ease",
      }}>
        <div style={{
          background: "white", borderRadius: "28%", width: 90, height: 90,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 20px 60px rgba(251,113,65,0.30)",
          animation: "popIn 0.3s cubic-bezier(.34,1.56,.64,1)",
        }}>
          <CheckCircle style={{ width: 48, height: 48, color: "#FB7141" }} />
        </div>
        <style>{`
          @keyframes popIn { 0%{transform:scale(0) rotate(-15deg);opacity:0} 100%{transform:scale(1) rotate(0);opacity:1} }
          @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        `}</style>
      </div>
    )}

    {hasChanges && (
      <div className="fixed bottom-24 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:max-w-sm z-50">
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl"
          style={{ background: "var(--fg)" }}>
          <span className="text-sm font-medium" style={{ color: "var(--bg)" }}>Modifiche non salvate</span>
          <button type="button" disabled={loading}
            onClick={handleSubmit(onSubmit, onValidationError)}
            className="shrink-0 px-4 py-1.5 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ background: "var(--accent)", color: "white" }}>
            {loading ? "…" : "Salva"}
          </button>
        </div>
      </div>
    )}

    <form onSubmit={handleSubmit(onSubmit, onValidationError)} className="space-y-6 overflow-x-hidden">

      {/* ── Avatar ─────────────────────────────────────────────────────── */}
      <div>
        <p className="label-xs mb-3">Foto profilo</p>
        <div className="flex items-center gap-4">
          {/* Preview */}
          <div className="w-16 h-16 rounded-full shrink-0 overflow-hidden flex items-center justify-center"
            style={{ background: currentAvatarSrc ? "transparent" : "var(--accent-soft)", border: "2px solid var(--border)" }}>
            {currentAvatarSrc
              ? <img src={currentAvatarSrc} alt="" className="w-full h-full object-cover" />
              : <span className="text-xl font-bold" style={{ color: "var(--accent)" }}>
                  {profile?.display_name?.[0]?.toUpperCase() ?? "?"}
                </span>
            }
          </div>
          {/* Builder button */}
          <button
            type="button"
            onClick={() => setShowBuilder(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "var(--accent-soft)", color: "var(--accent)", border: "1.5px solid var(--accent)" }}
          >
            <Sparkles className="w-4 h-4" />
            {avatarDataUrl ? "Modifica avatar" : "Crea il tuo avatar"}
          </button>
        </div>
      </div>

      {/* ── Banner ───────────────────────────────────────────────────────── */}
      <div>
        <p className="label-xs mb-3">Colore banner</p>
        <div className="w-full h-14 rounded-2xl mb-3" style={{
          background: banner ?? "linear-gradient(135deg,#FB7141,#1E386C)",
        }} />
        <div className="flex flex-wrap gap-2">
          {BANNER_PRESETS.map(({ label, value, preview }) => {
            const active = banner === value;
            return (
              <button key={label} type="button" onClick={() => setBanner(value)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  background: active ? "var(--accent-soft)" : "var(--surface)",
                  color: active ? "var(--accent)" : "var(--muted)",
                }}>
                <span className="w-4 h-4 rounded-full shrink-0" style={{ background: preview }} />
                {label}
                {active && <Check className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3 mt-3 p-3 rounded-xl"
          style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
          <Pipette className="w-4 h-4 shrink-0" style={{ color: "var(--muted)" }} />
          <span className="text-xs" style={{ color: "var(--muted)" }}>Colore libero</span>
          <div className="flex items-center gap-2 ml-auto">
            <input type="color"
              value={banner && !banner.startsWith("linear") ? banner : "#FB7141"}
              onChange={e => setBanner(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer"
              style={{ border: "1px solid var(--border)", padding: 2, background: "none" }} />
            {banner && !banner.startsWith("linear") && (
              <span className="text-xs font-mono" style={{ color: "var(--fg)" }}>{banner}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Nome ─────────────────────────────────────────────────────────── */}
      <div>
        <p className="label-xs mb-1.5">Nome visualizzato</p>
        <input {...register("display_name")} className="input-base" />
        {errors.display_name && <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{errors.display_name.message}</p>}
      </div>

      {/* ── Role ─────────────────────────────────────────────────────────── */}
      {profile?.role !== "admin" && (
        <div>
          <p className="label-xs mb-3">Chi sei?</p>
          <Controller control={control} name="role" render={({ field }) => (
            <div className="grid grid-cols-1 gap-2">
              {ROLES.map(({ value, label, sublabel, icon: Icon, color, bg }) => {
                const active = field.value === value;
                return (
                  <button key={value} type="button" onClick={() => field.onChange(value)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left w-full"
                    style={{ borderColor: active ? color : "var(--border)", background: active ? bg : "var(--card)" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                      <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{label}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{sublabel}</p>
                    </div>
                    {active && <Check className="w-4 h-4 shrink-0" style={{ color }} />}
                  </button>
                );
              })}
            </div>
          )} />
        </div>
      )}

      {/* ── Città ────────────────────────────────────────────────────────── */}
      <div>
        <p className="label-xs mb-1.5">Città</p>
        <input {...register("city")} placeholder="Es. Milano" className="input-base" />
      </div>

      {/* ── Bio ──────────────────────────────────────────────────────────── */}
      <div>
        <p className="label-xs mb-1.5">Bio</p>
        <textarea {...register("bio")} rows={3} placeholder="Parlaci di te..." className="input-base resize-none" />
      </div>

      <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5 text-sm">
        {loading ? "Applicando…" : "Salva profilo"}
      </button>
    </form>
    </>
  );
}
