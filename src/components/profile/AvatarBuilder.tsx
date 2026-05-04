"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Check, ChevronLeft, ChevronRight } from "lucide-react";

// ─── skin tones (replace placeholders in SVG) ─────────────────────────────────
// Each tone: [SKIN1, SKIN2(light), SKIN3(shadow), SKIN4(dark shadow), SKIN5(mid shadow), SKIN6(very light)]
const SKIN_TONES = [
  { label: "Chiaro",      hex: "#FDDBB4", shades: ["#FDDBB4","#FFF0D6","#D4845A","#8C4A25","#B06030","#FDEFD0"] },
  { label: "Medio chiaro",hex: "#E8B88A", shades: ["#E8B88A","#F9CFA8","#C4703A","#7A3C1A","#9C5225","#F4E0C4"] },
  { label: "Medio",       hex: "#C68B5A", shades: ["#C68B5A","#DDA878","#A06030","#603010","#804020","#DEC8A8"] },
  { label: "Medio scuro", hex: "#8D5524", shades: ["#8D5524","#A87045","#703A14","#401808","#582814","#C0A080"] },
  { label: "Scuro",       hex: "#4A2810", shades: ["#4A2810","#6A4025","#381808","#200C04","#2C1008","#8A6040"] },
];

// ─── hair colors ──────────────────────────────────────────────────────────────
const HAIR_COLORS = [
  { label: "Nero",       hex: "#1A1A1A", hair1: "#1A1A1A", hair2: "#0D0D0D" },
  { label: "Bruno sc.",  hex: "#3B1F0A", hair1: "#3B1F0A", hair2: "#251208" },
  { label: "Bruno ch.",  hex: "#8B5E3C", hair1: "#8B5E3C", hair2: "#6A4520" },
  { label: "Biondo",     hex: "#D4A853", hair1: "#D4A853", hair2: "#B08030" },
  { label: "Grigio",     hex: "#909090", hair1: "#909090", hair2: "#606060" },
  { label: "Blu",        hex: "#1E40AF", hair1: "#1E40AF", hair2: "#0F2070" },
  { label: "Viola",      hex: "#7C3AED", hair1: "#7C3AED", hair2: "#4C1D95" },
  { label: "Verde",      hex: "#065F46", hair1: "#065F46", hair2: "#023520" },
];

// ─── clothing styles ──────────────────────────────────────────────────────────
const CLOTHES_STYLES = [
  { id: "orange", label: "Arancio",  preview: "#F87145" },
  { id: "navy",   label: "Blu navy", preview: "#1E3A5F" },
  { id: "green",  label: "Verde",    preview: "#16A34A" },
  { id: "purple", label: "Viola",    preview: "#7C3AED" },
];

// ─── background colors ────────────────────────────────────────────────────────
const BG_COLORS = [
  { id:"bg_orange", label:"Arancio", hex:"#FF4A24" },
  { id:"bg_navy",   label:"Navy",    hex:"#1E3A5F" },
  { id:"bg_grey",   label:"Grigio",  hex:"#8B9BB4" },
  { id:"bg_purple", label:"Viola",   hex:"#6D41FF" },
  { id:"bg_green",  label:"Verde",   hex:"#16A34A" },
  { id:"bg_amber",  label:"Ambra",   hex:"#D97706" },
  { id:"bg_pink",   label:"Rosa",    hex:"#C84FD0" },
  { id:"bg_sky",    label:"Cielo",   hex:"#0EA5E9" },
];

// ─── accessories (overlay SVGs, 400x400 coords) ───────────────────────────────
const ACCESSORIES = [
  { id:"ac_none",   label:"Nessuno", svg: null },
  { id:"ac_phones", label:"Cuffie",  svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <path d="M100,185 C100,100 144,68 200,68 C256,68 300,100 300,185" fill="none" stroke="#1a0e05" stroke-width="14" stroke-linecap="round"/>
    <rect x="86" y="168" width="34" height="46" rx="14" fill="#FF4A24" stroke="#1a0e05" stroke-width="2.5"/>
    <rect x="280" y="168" width="34" height="46" rx="14" fill="#FF4A24" stroke="#1a0e05" stroke-width="2.5"/>
    <rect x="90" y="174" width="26" height="34" rx="10" fill="#CC3A1A"/>
    <rect x="284" y="174" width="26" height="34" rx="10" fill="#CC3A1A"/>
  </svg>` },
  { id:"ac_glasses", label:"Occhiali", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <circle cx="162" cy="174" r="30" fill="#a8d8f0" fill-opacity=".18" stroke="#1a0e05" stroke-width="4"/>
    <circle cx="238" cy="174" r="30" fill="#a8d8f0" fill-opacity=".18" stroke="#1a0e05" stroke-width="4"/>
    <line x1="192" y1="174" x2="208" y2="174" stroke="#1a0e05" stroke-width="3.5"/>
    <line x1="108" y1="168" x2="132" y2="172" stroke="#1a0e05" stroke-width="3.5"/>
    <line x1="268" y1="172" x2="292" y2="168" stroke="#1a0e05" stroke-width="3.5"/>
  </svg>` },
  { id:"ac_sun",    label:"Occhiali sole", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <circle cx="162" cy="174" r="30" fill="#1a0e05" fill-opacity=".88" stroke="#1a0e05" stroke-width="4"/>
    <circle cx="238" cy="174" r="30" fill="#1a0e05" fill-opacity=".88" stroke="#1a0e05" stroke-width="4"/>
    <line x1="192" y1="174" x2="208" y2="174" stroke="#1a0e05" stroke-width="3.5"/>
    <line x1="108" y1="168" x2="132" y2="172" stroke="#1a0e05" stroke-width="3.5"/>
    <line x1="268" y1="172" x2="292" y2="168" stroke="#1a0e05" stroke-width="3.5"/>
  </svg>` },
  { id:"ac_necklace",label:"Collana", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <path d="M158,292 Q200,316 242,292" fill="none" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="200" cy="316" r="9" fill="#f59e0b" stroke="#1a0e05" stroke-width="1.5"/>
    <circle cx="200" cy="316" r="5" fill="#fbbf24"/>
  </svg>` },
  { id:"ac_earrings",label:"Orecchini", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <circle cx="101" cy="196" r="12" fill="none" stroke="#f59e0b" stroke-width="4"/>
    <circle cx="299" cy="196" r="12" fill="none" stroke="#f59e0b" stroke-width="4"/>
    <line x1="101" y1="208" x2="101" y2="222" stroke="#f59e0b" stroke-width="3"/>
    <line x1="299" y1="208" x2="299" y2="222" stroke="#f59e0b" stroke-width="3"/>
    <circle cx="101" cy="223" r="5" fill="#f59e0b"/>
    <circle cx="299" cy="223" r="5" fill="#f59e0b"/>
  </svg>` },
];

// ─── state ────────────────────────────────────────────────────────────────────
interface State {
  bgColor:   string;
  skinIdx:   number;
  hairIdx:   number;
  clothesId: string;
  accessory: string;
}

const DEFAULT: State = {
  bgColor:   "#FF4A24",
  skinIdx:   1,
  hairIdx:   0,
  clothesId: "orange",
  accessory: "ac_none",
};

const TABS = ["Sfondo","Pelle","Capelli","Vestiti","Accessori"] as const;
type Tab = typeof TABS[number];

// ─── apply skin/hair placeholders ────────────────────────────────────────────
function applyColors(svg: string, skinIdx: number, hairIdx: number): string {
  const s = SKIN_TONES[skinIdx].shades;
  const h = HAIR_COLORS[hairIdx];
  return svg
    .replace(/SKIN1/g, s[0]).replace(/SKIN2/g, s[1]).replace(/SKIN3/g, s[2])
    .replace(/SKIN4/g, s[3]).replace(/SKIN5/g, s[4]).replace(/SKIN6/g, s[5])
    .replace(/HAIR1/g, h.hair1).replace(/HAIR2/g, h.hair2);
}

// ─── render canvas ────────────────────────────────────────────────────────────
async function drawLayer(ctx: CanvasRenderingContext2D, svgString: string) {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url  = URL.createObjectURL(blob);
  await new Promise<void>(res => {
    const img = new Image();
    img.onload  = () => { ctx.drawImage(img, 0, 0, 400, 400); URL.revokeObjectURL(url); res(); };
    img.onerror = () => { URL.revokeObjectURL(url); res(); };
    img.src = url;
  });
}

async function renderAvatar(
  canvas: HTMLCanvasElement,
  state:  State,
  svgCache: Record<string, string>,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, 400, 400);

  // clip circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(200, 200, 200, 0, Math.PI * 2);
  ctx.clip();

  // 1. background
  ctx.fillStyle = state.bgColor;
  ctx.fillRect(0, 0, 400, 400);

  // 2. character SVG (clothes variant)
  const clothesSvgRaw = svgCache[`clothes_${state.clothesId}`];
  if (clothesSvgRaw) {
    const colored = applyColors(clothesSvgRaw, state.skinIdx, state.hairIdx);
    await drawLayer(ctx, colored);
  }

  // 3. accessory overlay
  const acc = ACCESSORIES.find(a => a.id === state.accessory);
  if (acc?.svg) await drawLayer(ctx, acc.svg);

  ctx.restore();
}

// ─── component ────────────────────────────────────────────────────────────────
export function AvatarBuilder({ onSave, onClose }: { onSave: (url: string) => void; onClose: () => void }) {
  const [state,   setState]   = useState<State>(DEFAULT);
  const [tab,     setTab]     = useState<Tab>("Sfondo");
  const [tabIdx,  setTabIdx]  = useState(0);
  const [loading, setLoading] = useState(true);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const svgCache   = useRef<Record<string, string>>({});
  const renderLock = useRef(false);

  // pre-fetch SVG files
  useEffect(() => {
    const files = ["orange","navy","green","purple"].map(s => `clothes_${s}`);
    Promise.all(files.map(async name => {
      const res = await fetch(`/avatars/${name}.svg`);
      svgCache.current[name] = await res.text();
    })).then(() => setLoading(false));
  }, []);

  const doRender = useCallback(async (s: State) => {
    if (!canvasRef.current || renderLock.current) return;
    renderLock.current = true;
    await renderAvatar(canvasRef.current, s, svgCache.current);
    renderLock.current = false;
  }, []);

  useEffect(() => { if (!loading) doRender(state); }, [state, loading, doRender]);

  function update(partial: Partial<State>) {
    setState(prev => { const next = { ...prev, ...partial }; return next; });
  }

  function changeTab(i: number) {
    setTabIdx(i);
    setTab(TABS[i]);
  }

  function handleSave() {
    if (canvasRef.current) onSave(canvasRef.current.toDataURL("image/png"));
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--card)" }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl"
          style={{ background: "var(--surface)" }}>
          <X className="w-4 h-4" style={{ color: "var(--muted)" }} />
        </button>
        <p className="text-sm font-bold" style={{ color: "var(--fg)", fontFamily: "var(--fh)" }}>
          Crea il tuo avatar
        </p>
        <button onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: "var(--accent)" }}>
          <Check className="w-3.5 h-3.5" /> Salva
        </button>
      </div>

      {/* ── Preview ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center py-4 shrink-0"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full z-10"
              style={{ background: "var(--surface)" }}>
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
            </div>
          )}
          <canvas ref={canvasRef} width={400} height={400} className="rounded-full block"
            style={{ width: 140, height: 140, boxShadow: "0 6px 24px rgba(0,0,0,0.18)" }} />
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-2 py-2 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => changeTab(Math.max(0, tabIdx - 1))} disabled={tabIdx === 0}
          className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 disabled:opacity-20"
          style={{ background: "var(--surface)" }}>
          <ChevronLeft className="w-4 h-4" style={{ color: "var(--muted)" }} />
        </button>
        <div className="flex gap-1 overflow-x-auto flex-1" style={{ scrollbarWidth: "none" }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => changeTab(i)}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
              style={{ background: t === tab ? "var(--accent)" : "transparent", color: t === tab ? "white" : "var(--muted)" }}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={() => changeTab(Math.min(TABS.length - 1, tabIdx + 1))} disabled={tabIdx === TABS.length - 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 disabled:opacity-20"
          style={{ background: "var(--surface)" }}>
          <ChevronRight className="w-4 h-4" style={{ color: "var(--muted)" }} />
        </button>
      </div>

      {/* ── Panel ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4">

        {tab === "Sfondo" && (
          <div className="grid grid-cols-4 gap-3">
            {BG_COLORS.map(c => (
              <button key={c.id} onClick={() => update({ bgColor: c.hex })}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
                style={{
                  border: `2px solid ${state.bgColor === c.hex ? "var(--accent)" : "var(--border)"}`,
                  background: state.bgColor === c.hex ? "var(--accent-soft)" : "var(--surface)",
                }}>
                <div className="w-12 h-12 rounded-full shadow-sm" style={{ background: c.hex }} />
                <span className="text-[10px] font-medium" style={{ color: "var(--muted)" }}>{c.label}</span>
              </button>
            ))}
          </div>
        )}

        {tab === "Pelle" && (
          <div className="grid grid-cols-3 gap-3">
            {SKIN_TONES.map((s, i) => (
              <button key={s.hex} onClick={() => update({ skinIdx: i })}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
                style={{
                  border: `2px solid ${state.skinIdx === i ? "var(--accent)" : "var(--border)"}`,
                  background: state.skinIdx === i ? "var(--accent-soft)" : "var(--surface)",
                }}>
                <div className="w-14 h-14 rounded-full shadow-sm" style={{ background: s.hex }} />
                <span className="text-[10px] font-medium text-center" style={{ color: "var(--muted)" }}>{s.label}</span>
              </button>
            ))}
          </div>
        )}

        {tab === "Capelli" && (
          <div className="grid grid-cols-4 gap-3">
            {HAIR_COLORS.map((h, i) => (
              <button key={h.hex} onClick={() => update({ hairIdx: i })}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
                style={{
                  border: `2px solid ${state.hairIdx === i ? "var(--accent)" : "var(--border)"}`,
                  background: state.hairIdx === i ? "var(--accent-soft)" : "var(--surface)",
                }}>
                <div className="w-10 h-10 rounded-full shadow-sm" style={{ background: h.hex }} />
                <span className="text-[9px] font-medium text-center" style={{ color: "var(--muted)" }}>{h.label}</span>
              </button>
            ))}
          </div>
        )}

        {tab === "Vestiti" && (
          <div className="grid grid-cols-2 gap-3">
            {CLOTHES_STYLES.map(c => (
              <button key={c.id} onClick={() => update({ clothesId: c.id })}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
                style={{
                  border: `2px solid ${state.clothesId === c.id ? "var(--accent)" : "var(--border)"}`,
                  background: state.clothesId === c.id ? "var(--accent-soft)" : "var(--surface)",
                }}>
                <div className="w-14 h-14 rounded-full shadow-sm" style={{ background: c.preview }} />
                <span className="text-xs font-semibold" style={{ color: state.clothesId === c.id ? "var(--accent)" : "var(--muted)" }}>{c.label}</span>
              </button>
            ))}
          </div>
        )}

        {tab === "Accessori" && (
          <div className="grid grid-cols-2 gap-3">
            {ACCESSORIES.map(a => (
              <button key={a.id} onClick={() => update({ accessory: a.id })}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
                style={{
                  border: `2px solid ${state.accessory === a.id ? "var(--accent)" : "var(--border)"}`,
                  background: state.accessory === a.id ? "var(--accent-soft)" : "var(--surface)",
                }}>
                {a.svg
                  ? <div className="w-16 h-16" dangerouslySetInnerHTML={{ __html: a.svg }} />
                  : <div className="w-16 h-16 flex items-center justify-center text-3xl">∅</div>
                }
                <span className="text-xs font-semibold" style={{ color: state.accessory === a.id ? "var(--accent)" : "var(--muted)" }}>{a.label}</span>
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
