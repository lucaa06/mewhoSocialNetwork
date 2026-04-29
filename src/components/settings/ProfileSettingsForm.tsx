"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/validations";
import type { Profile } from "@/types/database";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket, FlaskConical, User, Check, X, Pipette, CheckCircle } from "lucide-react";
import { celebrate } from "@/lib/celebrate";
import { saveProfile } from "@/app/actions/profile";

/* ── Role options ─────────────────────────────────────────────────── */
const ROLES = [
  { value: "user",       label: "Maker",       sublabel: "Qui per esplorare e fare", icon: User,         color: "#D97706", bg: "rgba(217,119,6,0.08)"   },
  { value: "startupper", label: "Startupper",  sublabel: "Sto costruendo qualcosa",  icon: Rocket,       color: "#FF4A24", bg: "rgba(255,74,36,0.08)"   },
  { value: "researcher", label: "Ricercatore", sublabel: "Ricerca e innovazione",    icon: FlaskConical, color: "#6D41FF", bg: "rgba(109,65,255,0.08)"  },
] as const;

/* ── Banner color presets ─────────────────────────────────────────── */
const BANNER_PRESETS = [
  { label: "Brand",    value: null,      preview: "linear-gradient(135deg,#FF4A24,#6D41FF)" },
  { label: "Corallo",  value: "#FF4A24", preview: "#FF4A24" },
  { label: "Viola",    value: "#6D41FF", preview: "#6D41FF" },
  { label: "Mezzanotte", value: "#0f0c1a", preview: "#0f0c1a" },
  { label: "Oceano",   value: "#0a1628", preview: "#0a1628" },
  { label: "Foresta",  value: "#0d1a0e", preview: "#0d1a0e" },
  { label: "Ambra",    value: "#92400e", preview: "#92400e" },
  { label: "Rosa",     value: "#831843", preview: "#831843" },
  { label: "Grafite",  value: "#1c1917", preview: "#1c1917" },
];

/* ── Emoji suggestions ────────────────────────────────────────────── */
const EMOJI_SUGGESTIONS = [
  "🚀","💡","🔬","🎨","💻","⚡","🌍","🤝","📊","🎯",
  "🏆","🦁","🌟","✨","🔥","💎","🧪","🌱","🎭","🎵",
  "📚","🏗️","🎲","🐉","🦊","🐺","🦋","🌊","🏔️","🎪",
];

export function ProfileSettingsForm({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [loading, setLoading]       = useState(false);
  const [saved, setSaved]           = useState(false);
  const [emoji, setEmoji]           = useState<string>(profile?.avatar_emoji ?? "");
  const [banner, setBanner]         = useState<string | null>(profile?.banner_color ?? null);
  const [emojiInput, setEmojiInput] = useState(profile?.avatar_emoji ?? "");

  const initialEmoji  = profile?.avatar_emoji ?? "";
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

  const hasChanges = isDirty || emoji !== initialEmoji || banner !== initialBanner;

  async function onSubmit(data: ProfileUpdateInput) {
    if (!profile) return;
    setLoading(true);

    const result = await saveProfile(data, emoji || null, banner);

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
      .filter(Boolean)
      .join(", ");
    toast.error(msgs || "Controlla i campi e riprova");
  }

  /* preview bg for avatar */
  const avatarPreviewBg = emoji
    ? "var(--surface)"
    : profile?.avatar_url
    ? "transparent"
    : "var(--accent-soft)";

  return (
    <>
    {/* ── Save success overlay ───────────────────────────────── */}
    {saved && (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.18)",
        backdropFilter: "blur(6px)",
        animation: "fadeIn 0.15s ease",
      }}>
        <div style={{
          background: "white",
          borderRadius: "28%",
          width: 90, height: 90,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 20px 60px rgba(255,74,36,0.30)",
          animation: "popIn 0.3s cubic-bezier(.34,1.56,.64,1)",
        }}>
          <CheckCircle style={{ width: 48, height: 48, color: "#FF4A24" }} />
        </div>
        <style>{`
          @keyframes popIn {
            0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
            100% { transform: scale(1) rotate(0deg);   opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
        `}</style>
      </div>
    )}

    {/* ── Sticky unsaved-changes bar ─────────────────────────── */}
    <div
      style={{
        position: "fixed",
        top: 56,
        left: 0,
        right: 0,
        zIndex: 200,
        background: "rgba(245,243,241,0.96)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 20px",
        transition: "transform 0.22s cubic-bezier(.4,0,.2,1), opacity 0.22s ease",
        transform: hasChanges ? "translateY(0)" : "translateY(-110%)",
        opacity: hasChanges ? 1 : 0,
        pointerEvents: hasChanges ? "auto" : "none",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--muted)" }}>
        Hai modifiche non salvate
      </span>
      <button
        type="button"
        disabled={loading}
        onClick={handleSubmit(onSubmit, onValidationError)}
        style={{
          padding: "8px 20px",
          borderRadius: 14,
          fontSize: 13,
          fontWeight: 700,
          color: "white",
          background: loading ? "#ccc" : "linear-gradient(135deg,#FF4A24,#C84FD0)",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: loading ? "none" : "0 4px 14px rgba(255,74,36,0.35)",
          fontFamily: "var(--fh)",
          transition: "opacity 0.15s",
          whiteSpace: "nowrap",
        }}
      >
        {loading ? "Applicando…" : "Applica cambiamenti"}
      </button>
    </div>

    <form onSubmit={handleSubmit(onSubmit, onValidationError)} className="space-y-7">

      {/* ── Foto / Emoji ─────────────────────────────────────────────── */}
      <div>
        <p className="label-xs mb-3">Foto profilo</p>
        <div className="flex items-start gap-4">
          {/* Preview */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 text-3xl overflow-hidden"
            style={{ background: avatarPreviewBg, border: "1px solid var(--border)" }}
          >
            {emoji
              ? emoji
              : profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              : <span className="text-xl font-bold" style={{ color: "var(--accent)" }}>
                  {profile?.display_name?.[0]?.toUpperCase() ?? "?"}
                </span>
            }
          </div>

          {/* Controls */}
          <div className="flex-1 space-y-2.5">
            {/* Custom input */}
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2.5"
                style={{ border: "1px solid var(--border)", background: "var(--input-bg)" }}
              >
                <span className="text-xl leading-none">{emojiInput || "😀"}</span>
                <input
                  value={emojiInput}
                  onChange={e => { setEmojiInput(e.target.value); setEmoji(e.target.value); }}
                  placeholder="Incolla un'emoji..."
                  maxLength={2}
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                  style={{ color: "var(--fg)", fontFamily: "var(--fh)" }}
                />
              </div>
              {emoji && (
                <button
                  type="button"
                  onClick={() => { setEmoji(""); setEmojiInput(""); }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <X className="w-4 h-4" style={{ color: "var(--muted)" }} />
                </button>
              )}
            </div>
            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_SUGGESTIONS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => { setEmoji(e); setEmojiInput(e); }}
                  className="w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all"
                  style={{
                    background: emoji === e ? "var(--accent-soft)" : "var(--surface)",
                    border: `1px solid ${emoji === e ? "var(--accent)" : "var(--border)"}`,
                    transform: emoji === e ? "scale(1.1)" : undefined,
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
            <p className="text-[11px]" style={{ color: "var(--subtle)" }}>
              L&apos;emoji sostituisce la foto profilo. Rimuovila per usare la foto.
            </p>
          </div>
        </div>
      </div>

      {/* ── Banner ───────────────────────────────────────────────────── */}
      <div>
        <p className="label-xs mb-3">Colore banner</p>
        {/* Preview strip */}
        <div
          className="w-full h-14 rounded-2xl mb-3"
          style={{
            background: banner
              ? banner
              : "linear-gradient(135deg,#FF4A24 0%,#C84FD0 50%,#6D41FF 100%)",
          }}
        />
        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {BANNER_PRESETS.map(({ label, value, preview }) => {
            const active = banner === value;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setBanner(value)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  background: active ? "var(--accent-soft)" : "var(--surface)",
                  color: active ? "var(--accent)" : "var(--muted)",
                }}
              >
                <span
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ background: preview }}
                />
                {label}
                {active && <Check className="w-3 h-3" />}
              </button>
            );
          })}
        </div>

        {/* Custom color picker */}
        <div className="flex items-center gap-3 mt-3 p-3 rounded-xl" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
          <Pipette className="w-4 h-4 shrink-0" style={{ color: "var(--muted)" }} />
          <span className="text-xs" style={{ color: "var(--muted)" }}>Colore libero</span>
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="color"
              value={banner && !banner.startsWith("linear") ? banner : "#FF4A24"}
              onChange={e => setBanner(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer"
              style={{ border: "1px solid var(--border)", padding: 2, background: "none" }}
            />
            {banner && !banner.startsWith("linear") && (
              <span className="text-xs font-mono" style={{ color: "var(--fg)" }}>{banner}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Nome ─────────────────────────────────────────────────────── */}
      <div>
        <p className="label-xs mb-1.5">Nome visualizzato</p>
        <input {...register("display_name")} className="input-base" />
        {errors.display_name && <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{errors.display_name.message}</p>}
      </div>

      {/* ── Role ─────────────────────────────────────────────────────── */}
      {profile?.role !== "admin" && (
        <div>
          <p className="label-xs mb-3">Chi sei?</p>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {ROLES.map(({ value, label, sublabel, icon: Icon, color, bg }) => {
                  const active = field.value === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      className="flex flex-col items-start gap-2 p-4 rounded-2xl border-2 transition-all text-left"
                      style={{
                        borderColor: active ? color : "var(--border)",
                        background: active ? bg : "var(--card)",
                      }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                        <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight" style={{ color: "var(--fg)" }}>{label}</p>
                        <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "var(--muted)" }}>{sublabel}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>
      )}

      {/* ── Città ────────────────────────────────────────────────────── */}
      <div>
        <p className="label-xs mb-1.5">Città</p>
        <input {...register("city")} placeholder="Es. Milano" className="input-base" />
      </div>

      {/* ── Bio ──────────────────────────────────────────────────────── */}
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
