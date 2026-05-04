"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

// ─── types ────────────────────────────────────────────────────────────────────
interface AvatarState {
  bg:       string;
  skinIdx:  number;
  hairIdx:  number;
  clothesId: string;
  accessory: string;
}

// ─── skin tones — 6 shades each [SKIN1..SKIN6] ───────────────────────────────
const SKIN_TONES = [
  { label:"Chiaro",       hex:"#FDDBB4", s:["#FDDBB4","#FFF0D6","#D4845A","#8C4A25","#B06030","#FDEFD0"] },
  { label:"Medio chiaro", hex:"#E8B88A", s:["#E8B88A","#F9CFA8","#C4703A","#7A3C1A","#9C5225","#F4E0C4"] },
  { label:"Medio",        hex:"#C68B5A", s:["#C68B5A","#DDA878","#A06030","#603010","#804020","#DEC8A8"] },
  { label:"Medio scuro",  hex:"#8D5524", s:["#8D5524","#A87045","#703A14","#401808","#582814","#C0A080"] },
  { label:"Scuro",        hex:"#4A2810", s:["#4A2810","#6A4025","#381808","#200C04","#2C1008","#8A6040"] },
];

// ─── hair colors ──────────────────────────────────────────────────────────────
const HAIR_COLORS = [
  { label:"Nero",      hex:"#1A1A1A", h1:"#1A1A1A", h2:"#0D0D0D" },
  { label:"Bruno",     hex:"#3B1F0A", h1:"#3B1F0A", h2:"#251208" },
  { label:"Castano",   hex:"#7B4F2E", h1:"#7B4F2E", h2:"#553420" },
  { label:"Biondo",    hex:"#C8961E", h1:"#C8961E", h2:"#9A7010" },
  { label:"Grigio",    hex:"#888888", h1:"#888888", h2:"#555555" },
  { label:"Blu",       hex:"#1E3FAF", h1:"#1E3FAF", h2:"#0F1F70" },
  { label:"Viola",     hex:"#7020C8", h1:"#7020C8", h2:"#4A1090" },
  { label:"Rosso",     hex:"#B82020", h1:"#B82020", h2:"#801010" },
];

// ─── clothing styles ──────────────────────────────────────────────────────────
const CLOTHES = [
  { id:"orange", label:"Arancio",  preview:"#F87145" },
  { id:"navy",   label:"Navy",     preview:"#1E3A5F" },
  { id:"green",  label:"Verde",    preview:"#16A34A" },
  { id:"purple", label:"Viola",    preview:"#7C3AED" },
  { id:"red",    label:"Rosso",    preview:"#dc2626" },
];

// ─── backgrounds ─────────────────────────────────────────────────────────────
const BG_COLORS = [
  "#FF4A24","#1E3A5F","#8B9BB4","#6D41FF",
  "#16A34A","#D97706","#C84FD0","#0EA5E9",
];

// ─── accessory overlays (400x400 SVG strings) ────────────────────────────────
const ACCESSORIES: { id:string; label:string; svg:string|null }[] = [
  { id:"none", label:"Nessuno", svg: null },
  { id:"phones", label:"Cuffie", svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <path d="M100,186 C100,102 144,68 200,68 C256,68 300,102 300,186" fill="none" stroke="#1a0e05" stroke-width="16" stroke-linecap="round"/>
    <rect x="84" y="168" width="36" height="48" rx="15" fill="#FF4A24" stroke="#1a0e05" stroke-width="2.5"/>
    <rect x="280" y="168" width="36" height="48" rx="15" fill="#FF4A24" stroke="#1a0e05" stroke-width="2.5"/>
    <rect x="88" y="174" width="28" height="36" rx="11" fill="#cc3a1a"/>
    <rect x="284" y="174" width="28" height="36" rx="11" fill="#cc3a1a"/>
  </svg>` },
  { id:"glasses_round", label:"Occhiali", svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <circle cx="155" cy="175" r="32" fill="#a8d8f0" fill-opacity=".15" stroke="#1a0e05" stroke-width="4.5"/>
    <circle cx="245" cy="175" r="32" fill="#a8d8f0" fill-opacity=".15" stroke="#1a0e05" stroke-width="4.5"/>
    <line x1="187" y1="175" x2="213" y2="175" stroke="#1a0e05" stroke-width="4"/>
    <line x1="105" y1="168" x2="123" y2="173" stroke="#1a0e05" stroke-width="4"/>
    <line x1="277" y1="173" x2="295" y2="168" stroke="#1a0e05" stroke-width="4"/>
  </svg>` },
  { id:"glasses_sun", label:"Occhiali sole", svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <circle cx="155" cy="175" r="32" fill="#1a0e05" fill-opacity=".9" stroke="#1a0e05" stroke-width="4.5"/>
    <circle cx="245" cy="175" r="32" fill="#1a0e05" fill-opacity=".9" stroke="#1a0e05" stroke-width="4.5"/>
    <line x1="187" y1="175" x2="213" y2="175" stroke="#1a0e05" stroke-width="4"/>
    <line x1="105" y1="168" x2="123" y2="173" stroke="#1a0e05" stroke-width="4"/>
    <line x1="277" y1="173" x2="295" y2="168" stroke="#1a0e05" stroke-width="4"/>
  </svg>` },
  { id:"earrings", label:"Orecchini", svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <circle cx="103" cy="197" r="13" fill="none" stroke="#f59e0b" stroke-width="4.5"/>
    <circle cx="297" cy="197" r="13" fill="none" stroke="#f59e0b" stroke-width="4.5"/>
    <line x1="103" y1="210" x2="103" y2="226" stroke="#f59e0b" stroke-width="3.5"/>
    <line x1="297" y1="210" x2="297" y2="226" stroke="#f59e0b" stroke-width="3.5"/>
    <circle cx="103" cy="228" r="6" fill="#f59e0b"/>
    <circle cx="297" cy="228" r="6" fill="#f59e0b"/>
  </svg>` },
];

// ─── tabs ─────────────────────────────────────────────────────────────────────
const TABS = ["Sfondo","Pelle","Capelli","Vestiti","Accessori"] as const;
type Tab = typeof TABS[number];

const DEFAULT_STATE: AvatarState = {
  bg: "#FF4A24", skinIdx: 1, hairIdx: 0, clothesId: "orange", accessory: "none",
};

// ─── color substitution ───────────────────────────────────────────────────────
function applySkin(svg: string, idx: number): string {
  const s = SKIN_TONES[idx].s;
  return svg
    .replace(/SKIN1/g,s[0]).replace(/SKIN2/g,s[1]).replace(/SKIN3/g,s[2])
    .replace(/SKIN4/g,s[3]).replace(/SKIN5/g,s[4]).replace(/SKIN6/g,s[5]);
}
function applyHair(svg: string, idx: number): string {
  const h = HAIR_COLORS[idx];
  return svg.replace(/HAIR1/g, h.h1).replace(/HAIR2/g, h.h2);
}

// ─── draw one SVG layer onto canvas ──────────────────────────────────────────
async function drawSvg(ctx: CanvasRenderingContext2D, svgStr: string): Promise<void> {
  const url = URL.createObjectURL(new Blob([svgStr], { type:"image/svg+xml" }));
  return new Promise(res => {
    const img = new Image();
    img.onload  = () => { ctx.drawImage(img,0,0,400,400); URL.revokeObjectURL(url); res(); };
    img.onerror = () => { URL.revokeObjectURL(url); res(); };
    img.src = url;
  });
}

// ─── render full avatar to canvas ────────────────────────────────────────────
async function renderAvatar(
  canvas: HTMLCanvasElement,
  state:  AvatarState,
  cache:  Record<string, string>,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0,0,400,400);

  // circular clip
  ctx.save();
  ctx.beginPath();
  ctx.arc(200,200,200,0,Math.PI*2);
  ctx.clip();

  // 1 — background circle
  ctx.fillStyle = state.bg;
  ctx.fillRect(0,0,400,400);

  // 2 — neck (skin, drawn before clothes)
  const neckRaw = cache["neck"];
  if (neckRaw) await drawSvg(ctx, applySkin(neckRaw, state.skinIdx));

  // 3 — clothes (color variant)
  const clothesRaw = cache[`clothes_${state.clothesId}`];
  if (clothesRaw) await drawSvg(ctx, applySkin(clothesRaw, state.skinIdx));

  // 4 — face (skin)
  const faceRaw = cache["face"];
  if (faceRaw) await drawSvg(ctx, applySkin(faceRaw, state.skinIdx));

  // 5 — eyes (contains collar details + eye whites)
  const eyesRaw = cache["eyes"];
  if (eyesRaw) await drawSvg(ctx, applySkin(eyesRaw, state.skinIdx));

  // 6 — hair (over face, drawn last for correct z-order)
  const hairRaw = cache["hair"];
  if (hairRaw) await drawSvg(ctx, applyHair(hairRaw, state.hairIdx));

  // 7 — accessory overlay
  const acc = ACCESSORIES.find(a => a.id === state.accessory);
  if (acc?.svg) await drawSvg(ctx, acc.svg);

  ctx.restore();
}

// ─── component ────────────────────────────────────────────────────────────────
export function AvatarBuilder({ onSave, onClose }: {
  onSave: (dataUrl: string) => void;
  onClose: () => void;
}) {
  const [state,   setState]   = useState<AvatarState>(DEFAULT_STATE);
  const [tab,     setTab]     = useState<Tab>("Sfondo");
  const [tabIdx,  setTabIdx]  = useState(0);
  const [ready,   setReady]   = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cacheRef  = useRef<Record<string, string>>({});
  const rendering = useRef(false);

  // preload all SVG layer files
  useEffect(() => {
    const files = [
      "neck","face","eyes","hair",
      ...CLOTHES.map(c => `clothes_${c.id}`),
    ];
    Promise.all(files.map(async name => {
      const res = await fetch(`/avatars/layers/${name}.svg`);
      if (res.ok) cacheRef.current[name] = await res.text();
    })).then(() => setReady(true));
  }, []);

  const doRender = useCallback(async (s: AvatarState) => {
    if (!canvasRef.current || rendering.current) return;
    rendering.current = true;
    await renderAvatar(canvasRef.current, s, cacheRef.current);
    rendering.current = false;
  }, []);

  useEffect(() => { if (ready) doRender(state); }, [state, ready, doRender]);

  function update(partial: Partial<AvatarState>) {
    setState(prev => ({ ...prev, ...partial }));
  }

  function nav(dir: -1|1) {
    const next = Math.max(0, Math.min(TABS.length-1, tabIdx+dir));
    setTabIdx(next); setTab(TABS[next]);
  }

  function handleSave() {
    if (canvasRef.current) onSave(canvasRef.current.toDataURL("image/png"));
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background:"var(--card)" }}>

      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom:"1px solid var(--border)" }}>
        <button onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-xl"
          style={{ background:"var(--surface)" }}>
          <X className="w-4 h-4" style={{ color:"var(--muted)" }}/>
        </button>
        <p className="text-sm font-bold" style={{ color:"var(--fg)", fontFamily:"var(--fh)" }}>
          Crea il tuo avatar
        </p>
        <button onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background:"var(--accent)" }}>
          <Check className="w-3.5 h-3.5"/> Salva
        </button>
      </div>

      {/* preview */}
      <div className="flex items-center justify-center py-4 shrink-0"
        style={{ borderBottom:"1px solid var(--border)", background:"var(--surface)" }}>
        <div className="relative">
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full z-10"
              style={{ background:"var(--surface)" }}>
              <Loader2 className="w-6 h-6 animate-spin" style={{ color:"var(--accent)" }}/>
            </div>
          )}
          <canvas ref={canvasRef} width={400} height={400}
            className="rounded-full block"
            style={{ width:148, height:148, boxShadow:"0 6px 28px rgba(0,0,0,0.20)" }}/>
        </div>
      </div>

      {/* tab bar */}
      <div className="flex items-center gap-1 px-2 py-2 shrink-0"
        style={{ borderBottom:"1px solid var(--border)" }}>
        <button onClick={()=>nav(-1)} disabled={tabIdx===0}
          className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 disabled:opacity-20"
          style={{ background:"var(--surface)" }}>
          <ChevronLeft className="w-4 h-4" style={{ color:"var(--muted)" }}/>
        </button>
        <div className="flex gap-1 overflow-x-auto flex-1" style={{ scrollbarWidth:"none" }}>
          {TABS.map((t,i)=>(
            <button key={t} onClick={()=>{setTabIdx(i);setTab(t);}}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
              style={{
                background: t===tab ? "var(--accent)" : "transparent",
                color:      t===tab ? "white" : "var(--muted)",
              }}>{t}</button>
          ))}
        </div>
        <button onClick={()=>nav(1)} disabled={tabIdx===TABS.length-1}
          className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 disabled:opacity-20"
          style={{ background:"var(--surface)" }}>
          <ChevronRight className="w-4 h-4" style={{ color:"var(--muted)" }}/>
        </button>
      </div>

      {/* panel */}
      <div className="flex-1 overflow-y-auto p-4">

        {tab==="Sfondo" && (
          <div className="grid grid-cols-4 gap-3">
            {BG_COLORS.map(c=>(
              <button key={c} onClick={()=>update({bg:c})}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
                style={{
                  border:`2px solid ${state.bg===c?"var(--accent)":"var(--border)"}`,
                  background: state.bg===c?"var(--accent-soft)":"var(--surface)",
                }}>
                <div className="w-12 h-12 rounded-full" style={{background:c,boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}/>
              </button>
            ))}
          </div>
        )}

        {tab==="Pelle" && (
          <div className="grid grid-cols-3 gap-3">
            {SKIN_TONES.map((s,i)=>(
              <button key={s.hex} onClick={()=>update({skinIdx:i})}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
                style={{
                  border:`2px solid ${state.skinIdx===i?"var(--accent)":"var(--border)"}`,
                  background: state.skinIdx===i?"var(--accent-soft)":"var(--surface)",
                }}>
                <div className="w-14 h-14 rounded-full" style={{background:s.hex,boxShadow:"0 2px 8px rgba(0,0,0,0.18)"}}/>
                <span className="text-[11px] font-medium" style={{color:"var(--muted)"}}>{s.label}</span>
              </button>
            ))}
          </div>
        )}

        {tab==="Capelli" && (
          <div className="grid grid-cols-4 gap-3">
            {HAIR_COLORS.map((h,i)=>(
              <button key={h.hex} onClick={()=>update({hairIdx:i})}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
                style={{
                  border:`2px solid ${state.hairIdx===i?"var(--accent)":"var(--border)"}`,
                  background: state.hairIdx===i?"var(--accent-soft)":"var(--surface)",
                }}>
                <div className="w-10 h-10 rounded-full" style={{background:h.hex,boxShadow:"0 2px 8px rgba(0,0,0,0.18)"}}/>
                <span className="text-[10px] font-medium text-center" style={{color:"var(--muted)"}}>{h.label}</span>
              </button>
            ))}
          </div>
        )}

        {tab==="Vestiti" && (
          <div className="grid grid-cols-3 gap-3">
            {CLOTHES.map(c=>(
              <button key={c.id} onClick={()=>update({clothesId:c.id})}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
                style={{
                  border:`2px solid ${state.clothesId===c.id?"var(--accent)":"var(--border)"}`,
                  background: state.clothesId===c.id?"var(--accent-soft)":"var(--surface)",
                }}>
                <div className="w-12 h-12 rounded-full" style={{background:c.preview,boxShadow:"0 2px 8px rgba(0,0,0,0.18)"}}/>
                <span className="text-[11px] font-semibold"
                  style={{color:state.clothesId===c.id?"var(--accent)":"var(--muted)"}}>{c.label}</span>
              </button>
            ))}
          </div>
        )}

        {tab==="Accessori" && (
          <div className="grid grid-cols-2 gap-3">
            {ACCESSORIES.map(a=>(
              <button key={a.id} onClick={()=>update({accessory:a.id})}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
                style={{
                  border:`2px solid ${state.accessory===a.id?"var(--accent)":"var(--border)"}`,
                  background: state.accessory===a.id?"var(--accent-soft)":"var(--surface)",
                }}>
                {a.svg
                  ? <div className="w-20 h-20" dangerouslySetInnerHTML={{__html:a.svg}}/>
                  : <div className="w-20 h-20 flex items-center justify-center text-4xl">∅</div>}
                <span className="text-xs font-semibold"
                  style={{color:state.accessory===a.id?"var(--accent)":"var(--muted)"}}>{a.label}</span>
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
