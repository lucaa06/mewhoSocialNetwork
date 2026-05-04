"use client";

import { useReducer, useEffect, useRef, useState } from "react";
import { X, Check, ChevronLeft, ChevronRight } from "lucide-react";
import {
  CATEGORIES, DEFAULT_STATE, LAYER_ORDER, SKIN_TONES, HAIR_COLORS,
  applyColors, getOption,
  type AvatarState, type LayerKey,
} from "./avatarAssets";

// ─── reducer ─────────────────────────────────────────────────────────────────
type Action =
  | { type: "SET_LAYER"; key: LayerKey; id: string | null }
  | { type: "SET_SKIN";  value: string }
  | { type: "SET_HAIR";  value: string };

function reducer(state: AvatarState, action: Action): AvatarState {
  switch (action.type) {
    case "SET_LAYER": return { ...state, layers: { ...state.layers, [action.key]: action.id } };
    case "SET_SKIN":  return { ...state, skinTone: action.value };
    case "SET_HAIR":  return { ...state, hairColor: action.value };
  }
}

// ─── canvas render ────────────────────────────────────────────────────────────
async function renderToCanvas(canvas: HTMLCanvasElement, state: AvatarState) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const S = canvas.width;
  ctx.clearRect(0, 0, S, S);
  ctx.save();
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
  ctx.clip();

  for (const key of LAYER_ORDER) {
    const opt = getOption(key, state.layers[key]);
    if (!opt) continue;
    const colored = applyColors(opt.svg, state.skinTone, state.hairColor);
    const url = URL.createObjectURL(new Blob([colored], { type: "image/svg+xml" }));
    await new Promise<void>(res => {
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0, S, S); URL.revokeObjectURL(url); res(); };
      img.onerror = () => { URL.revokeObjectURL(url); res(); };
      img.src = url;
    });
  }
  ctx.restore();
}

// only categories shown in tabs (body + ears are invisible/auto)
const TAB_CATS = CATEGORIES.filter(c => c.key !== "body" && c.key !== "ears");

// ─── component ────────────────────────────────────────────────────────────────
export function AvatarBuilder({ onSave, onClose }: { onSave: (dataUrl: string) => void; onClose: () => void }) {
  const [state, dispatch]   = useReducer(reducer, DEFAULT_STATE);
  const [tabIdx, setTabIdx] = useState(0);
  const canvasRef           = useRef<HTMLCanvasElement>(null);
  const tabBarRef           = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current) renderToCanvas(canvasRef.current, state);
  }, [state]);

  function handleSave() {
    if (canvasRef.current) onSave(canvasRef.current.toDataURL("image/png"));
  }

  const cat        = TAB_CATS[tabIdx];
  const selected   = state.layers[cat.key];
  const visibleOpts = cat.options.filter(o => !o.id.endsWith("_none"));
  const noneId     = cat.options.find(o => o.id.endsWith("_none"))?.id ?? null;

  function prevTab() { setTabIdx(i => Math.max(0, i - 1)); }
  function nextTab() { setTabIdx(i => Math.min(TAB_CATS.length - 1, i + 1)); }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--card)" }}>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <button onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-xl"
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

      {/* ── Preview strip ─────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3 flex items-center gap-4"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>

        {/* Canvas */}
        <canvas ref={canvasRef} width={400} height={400}
          className="rounded-full shrink-0"
          style={{ width: 80, height: 80, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }} />

        {/* Color pickers */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {/* Skin */}
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--subtle)" }}>
              Carnagione
            </p>
            <div className="flex gap-2">
              {SKIN_TONES.map(c => (
                <button key={c} onClick={() => dispatch({ type: "SET_SKIN", value: c })}
                  className="rounded-full transition-all"
                  style={{
                    width: 28, height: 28, background: c, flexShrink: 0,
                    border: state.skinTone === c ? "3px solid var(--accent)" : "3px solid transparent",
                    outline: state.skinTone === c ? "2px solid var(--accent)" : "none",
                    outlineOffset: 1, boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }} />
              ))}
            </div>
          </div>
          {/* Hair */}
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--subtle)" }}>
              Capelli
            </p>
            <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
              {HAIR_COLORS.map(c => (
                <button key={c} onClick={() => dispatch({ type: "SET_HAIR", value: c })}
                  className="rounded-full transition-all shrink-0"
                  style={{
                    width: 28, height: 28, background: c,
                    border: state.hairColor === c ? "3px solid var(--accent)" : "3px solid transparent",
                    outline: state.hairColor === c ? "2px solid var(--accent)" : "none",
                    outlineOffset: 1, boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab bar ───────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-1 px-2 py-2"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <button onClick={prevTab} disabled={tabIdx === 0}
          className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 disabled:opacity-20"
          style={{ background: "var(--surface)" }}>
          <ChevronLeft className="w-4 h-4" style={{ color: "var(--muted)" }} />
        </button>

        <div ref={tabBarRef}
          className="flex gap-1 overflow-x-auto flex-1"
          style={{ scrollbarWidth: "none" }}>
          {TAB_CATS.map((c, i) => {
            const active = i === tabIdx;
            return (
              <button key={c.key} onClick={() => setTabIdx(i)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
                style={{
                  background: active ? "var(--accent)" : "transparent",
                  color: active ? "white" : "var(--muted)",
                }}>
                {c.label}
              </button>
            );
          })}
        </div>

        <button onClick={nextTab} disabled={tabIdx === TAB_CATS.length - 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 disabled:opacity-20"
          style={{ background: "var(--surface)" }}>
          <ChevronRight className="w-4 h-4" style={{ color: "var(--muted)" }} />
        </button>
      </div>

      {/* ── Options grid ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))" }}>

          {/* Nessuno button for optional categories */}
          {cat.optional && (
            <button
              onClick={() => dispatch({ type: "SET_LAYER", key: cat.key, id: noneId })}
              className="flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all"
              style={{
                border: `2px solid ${!selected || selected === noneId ? "var(--accent)" : "var(--border)"}`,
                background: !selected || selected === noneId ? "var(--accent-soft)" : "var(--surface)",
                aspectRatio: "1",
              }}>
              <span className="text-3xl leading-none">∅</span>
              <span className="text-[10px] font-medium" style={{ color: "var(--muted)" }}>Nessuno</span>
            </button>
          )}

          {visibleOpts.map(opt => {
            const isSelected = selected === opt.id;
            const colored    = applyColors(opt.svg, state.skinTone, state.hairColor);
            return (
              <button key={opt.id}
                onClick={() => dispatch({ type: "SET_LAYER", key: cat.key, id: opt.id })}
                className="flex flex-col items-center gap-1 p-1.5 rounded-2xl transition-all"
                style={{
                  border: `2px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                  background: isSelected ? "var(--accent-soft)" : "var(--surface)",
                }}>
                <div className="w-full rounded-xl overflow-hidden"
                  style={{ aspectRatio: "1" }}
                  dangerouslySetInnerHTML={{ __html: colored }} />
                <span className="text-[10px] font-medium text-center leading-tight w-full truncate px-0.5"
                  style={{ color: isSelected ? "var(--accent)" : "var(--muted)" }}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
