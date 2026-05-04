"use client";

import { useState } from "react";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import { X, Check, ChevronLeft, ChevronRight, Shuffle } from "lucide-react";

// ─── state ────────────────────────────────────────────────────────────────────
interface AvatarCfg {
  bg:           string;
  skinColor:    string;
  top:          string;
  hairColor:    string;
  eyes:         string;
  eyebrows:     string;
  mouth:        string;
  clothing:     string;
  clothesColor: string;
  accessories:  string;   // "" = none
  facialHair:   string;   // "" = none
}

// ─── option tables ────────────────────────────────────────────────────────────
const BG = [
  "#FF4A24","#1E3A5F","#6D41FF","#16A34A",
  "#D97706","#C84FD0","#0EA5E9","#0f0c1a",
];

const SKIN = [
  { hex:"fddbb4", label:"Chiaro +" },
  { hex:"fd9841", label:"Chiaro"   },
  { hex:"edb98a", label:"Medio ch."},
  { hex:"d08b5b", label:"Medio"    },
  { hex:"ae5d29", label:"Medio sc."},
  { hex:"614335", label:"Scuro"    },
  { hex:"4a312c", label:"Scuro +"  },
];

const HAIR_COLOR = [
  { hex:"2c1b18", label:"Nero"     },
  { hex:"724133", label:"Bruno"    },
  { hex:"a55728", label:"Castano"  },
  { hex:"b58143", label:"Biondo"   },
  { hex:"c93305", label:"Rosso"    },
  { hex:"f59797", label:"Rosa"     },
  { hex:"e8e1e1", label:"Grigio"   },
  { hex:"ecdcbf", label:"Platino"  },
  { hex:"65c9ff", label:"Blu"      },
  { hex:"4a312c", label:"Mogano"   },
];

const CLOTHES_COLOR = [
  { hex:"262e33", label:"Carbone"  },
  { hex:"FF4A24", label:"Corallo"  },
  { hex:"65c9ff", label:"Azzurro"  },
  { hex:"25557c", label:"Navy"     },
  { hex:"a7ffc4", label:"Menta"    },
  { hex:"ff5c5c", label:"Rosso"    },
  { hex:"ffffb1", label:"Giallo"   },
  { hex:"ffffff", label:"Bianco"   },
];

const TOPS: { id: string; label: string }[] = [
  { id:"shortFlat",         label:"Corti lisci"  },
  { id:"shortCurly",        label:"Corti ricci"  },
  { id:"shortWaved",        label:"Corti mossi"  },
  { id:"shortRound",        label:"Corti tondi"  },
  { id:"curly",             label:"Ricci"        },
  { id:"curvy",             label:"Mossi"        },
  { id:"bigHair",           label:"Voluminosi"   },
  { id:"straight01",        label:"Lisci"        },
  { id:"longButNotTooLong", label:"Lunghi"       },
  { id:"bob",               label:"Bob"          },
  { id:"bun",               label:"Chignon"      },
  { id:"miaWallace",        label:"Mia Wallace"  },
  { id:"fro",               label:"Afro"         },
  { id:"dreads",            label:"Dreadlock"    },
  { id:"shavedSides",       label:"Rasati"       },
  { id:"sides",             label:"Laterali"     },
  { id:"theCaesar",         label:"Caesar"       },
  { id:"frida",             label:"Frida"        },
  { id:"shaggy",            label:"Spettinato"   },
  { id:"hijab",             label:"Hijab"        },
  { id:"hat",               label:"Cappello"     },
];

const EYES_OPTS: { id: string; label: string }[] = [
  { id:"default",   label:"Normali"    },
  { id:"happy",     label:"Felici"     },
  { id:"closed",    label:"Chiusi"     },
  { id:"wink",      label:"Occhiolino" },
  { id:"surprised", label:"Sorpresi"   },
  { id:"squint",    label:"Socchiusi"  },
  { id:"side",      label:"Di lato"    },
  { id:"eyeRoll",   label:"Rotati"     },
  { id:"xDizzy",    label:"Stralunati" },
  { id:"hearts",    label:"Cuori"      },
  { id:"cry",       label:"Lacrime"    },
];

const BROW_OPTS: { id: string; label: string }[] = [
  { id:"defaultNatural",       label:"Normali"     },
  { id:"raisedExcitedNatural", label:"Su"          },
  { id:"angryNatural",         label:"Arrabbiato"  },
  { id:"sadConcernedNatural",  label:"Triste"      },
  { id:"flatNatural",          label:"Piatte"      },
  { id:"frownNatural",         label:"Accigliato"  },
  { id:"unibrowNatural",       label:"Monociglio"  },
  { id:"upDownNatural",        label:"Asimmetrica" },
];

const MOUTH_OPTS: { id: string; label: string }[] = [
  { id:"smile",      label:"Sorriso"     },
  { id:"twinkle",    label:"Felice"      },
  { id:"default",    label:"Normale"     },
  { id:"serious",    label:"Serio"       },
  { id:"sad",        label:"Triste"      },
  { id:"concerned",  label:"Preoccupato" },
  { id:"disbelief",  label:"Incredulo"   },
  { id:"tongue",     label:"Linguaccia"  },
  { id:"eating",     label:"Mangia"      },
  { id:"grimace",    label:"Smorfia"     },
  { id:"screamOpen", label:"Urlo"        },
];

const CLOTHING_OPTS: { id: string; label: string }[] = [
  { id:"hoodie",           label:"Felpa"           },
  { id:"shirtCrewNeck",    label:"T-shirt"         },
  { id:"shirtVNeck",       label:"T-shirt V"       },
  { id:"graphicShirt",     label:"Graphic tee"     },
  { id:"collarAndSweater", label:"Maglione"        },
  { id:"blazerAndShirt",   label:"Blazer"          },
  { id:"blazerAndSweater", label:"Blazer maglione" },
  { id:"overall",          label:"Salopette"       },
  { id:"shirtScoopNeck",   label:"Scollato"        },
];

const ACC_OPTS: { id: string; label: string }[] = [
  { id:"",              label:"Nessuno"      },
  { id:"round",         label:"Tondi"        },
  { id:"prescription01",label:"Classici"     },
  { id:"prescription02",label:"Rettangolari" },
  { id:"wayfarers",     label:"Wayfarer"     },
  { id:"sunglasses",    label:"Da sole"      },
  { id:"kurt",          label:"Kurt"         },
  { id:"eyepatch",      label:"Benda"        },
];

const BEARD_OPTS: { id: string; label: string }[] = [
  { id:"",               label:"Nessuna" },
  { id:"beardLight",     label:"Leggera" },
  { id:"beardMedium",    label:"Media"   },
  { id:"beardMajestic",  label:"Folta"   },
  { id:"moustacheFancy", label:"Baffi"   },
  { id:"moustacheMagnum",label:"Magnum"  },
];

const TABS = ["Capelli","Viso","Occhi","Bocca","Vestiti","Extra","Sfondo"] as const;
type Tab = typeof TABS[number];

const DEFAULT_CFG: AvatarCfg = {
  bg:           "FF4A24",
  skinColor:    "edb98a",
  top:          "shortFlat",
  hairColor:    "2c1b18",
  eyes:         "default",
  eyebrows:     "defaultNatural",
  mouth:        "smile",
  clothing:     "hoodie",
  clothesColor: "65c9ff",
  accessories:  "",
  facialHair:   "",
};

// ─── helpers ──────────────────────────────────────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
function buildSvg(cfg: AvatarCfg): string {
  const opts: Record<string, any> = {
    seed:                   "user",
    backgroundColor:        [cfg.bg],
    skinColor:              [cfg.skinColor],
    top:                    [cfg.top],
    hairColor:              [cfg.hairColor],
    eyes:                   [cfg.eyes],
    eyebrows:               [cfg.eyebrows],
    mouth:                  [cfg.mouth],
    clothing:               [cfg.clothing],
    clothesColor:           [cfg.clothesColor],
    accessoriesProbability: cfg.accessories ? 100 : 0,
    facialHairProbability:  cfg.facialHair  ? 100 : 0,
  };
  if (cfg.accessories) opts.accessories = [cfg.accessories];
  if (cfg.facialHair)  opts.facialHair  = [cfg.facialHair];
  return createAvatar(avataaars, opts).toString();
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function svgToDataUrl(svg: string): string {
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
}

async function svgToPng(svgStr: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url  = URL.createObjectURL(blob);
    const img  = new Image();
    const cnv  = document.createElement("canvas");
    cnv.width  = 400;
    cnv.height = 400;
    img.onload  = () => {
      const ctx = cnv.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error("no ctx")); return; }
      ctx.save();
      ctx.beginPath();
      ctx.arc(200, 200, 200, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, 0, 0, 400, 400);
      ctx.restore();
      URL.revokeObjectURL(url);
      resolve(cnv.toDataURL("image/png"));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("load error")); };
    img.src = url;
  });
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── sub-components ───────────────────────────────────────────────────────────
function Chips({
  opts, value, onSelect,
}: { opts: { id: string; label: string }[]; value: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map(o => {
        const active = o.id === value;
        return (
          <button key={o.id} type="button" onClick={() => onSelect(o.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: active ? "var(--accent)"      : "var(--surface)",
              color:      active ? "white"              : "var(--muted)",
              border:     `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
            }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Swatches({
  colors, value, onSelect, size = 11,
}: { colors: { hex: string; label: string }[]; value: string; onSelect: (hex: string) => void; size?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map(c => {
        const active = c.hex === value;
        return (
          <button key={c.hex} type="button" title={c.label} onClick={() => onSelect(c.hex)}
            className="flex flex-col items-center gap-1"
            style={{ opacity: active ? 1 : 0.75 }}>
            <div style={{
              width:  size * 4, height: size * 4,
              borderRadius: "50%",
              background:   `#${c.hex}`,
              border:       `2.5px solid ${active ? "var(--accent)" : "transparent"}`,
              boxShadow:    active ? "0 0 0 1.5px var(--accent)" : "0 1px 4px rgba(0,0,0,0.18)",
            }} />
            <span className="text-[9px]" style={{ color: "var(--muted)" }}>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export function AvatarBuilder({ onSave, onClose }: {
  onSave:  (dataUrl: string) => void;
  onClose: () => void;
}) {
  const [cfg,    setCfg]    = useState<AvatarCfg>(DEFAULT_CFG);
  const [tabIdx, setTabIdx] = useState(0);
  const [saving, setSaving] = useState(false);

  const tab = TABS[tabIdx];

  function update(partial: Partial<AvatarCfg>) {
    setCfg(prev => ({ ...prev, ...partial }));
  }

  function nav(dir: -1 | 1) {
    setTabIdx(i => Math.max(0, Math.min(TABS.length - 1, i + dir)));
  }

  function randomize() {
    update({
      bg:           pick(BG).replace("#", ""),
      skinColor:    pick(SKIN).hex,
      top:          pick(TOPS).id,
      hairColor:    pick(HAIR_COLOR).hex,
      eyes:         pick(EYES_OPTS).id,
      eyebrows:     pick(BROW_OPTS).id,
      mouth:        pick(MOUTH_OPTS).id,
      clothing:     pick(CLOTHING_OPTS).id,
      clothesColor: pick(CLOTHES_COLOR).hex,
      accessories:  pick(ACC_OPTS).id,
      facialHair:   pick(BEARD_OPTS).id,
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const png = await svgToPng(buildSvg(cfg));
      onSave(png);
    } finally {
      setSaving(false);
    }
  }

  const svgUrl = svgToDataUrl(buildSvg(cfg));

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--card)" }}>

      {/* ── header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <button type="button" onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-xl"
          style={{ background: "var(--surface)" }}>
          <X className="w-4 h-4" style={{ color: "var(--muted)" }} />
        </button>
        <p className="text-sm font-bold" style={{ color: "var(--fg)", fontFamily: "var(--fh)" }}>
          Crea il tuo avatar
        </p>
        <button type="button" disabled={saving} onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
          style={{ background: "var(--accent)" }}>
          <Check className="w-3.5 h-3.5" />
          {saving ? "…" : "Salva"}
        </button>
      </div>

      {/* ── preview ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-5 py-4 shrink-0"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
        <img src={svgUrl} alt="Avatar preview"
          className="rounded-full"
          style={{ width: 140, height: 140, boxShadow: "0 6px 28px rgba(0,0,0,0.20)" }} />
        <button type="button" onClick={randomize} title="Casuale"
          className="w-10 h-10 flex items-center justify-center rounded-xl"
          style={{ background: "var(--accent-soft)", border: "1.5px solid var(--accent)" }}>
          <Shuffle className="w-4 h-4" style={{ color: "var(--accent)" }} />
        </button>
      </div>

      {/* ── tab bar ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-2 py-2 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <button type="button" onClick={() => nav(-1)} disabled={tabIdx === 0}
          className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 disabled:opacity-20"
          style={{ background: "var(--surface)" }}>
          <ChevronLeft className="w-4 h-4" style={{ color: "var(--muted)" }} />
        </button>
        <div className="flex gap-1 overflow-x-auto flex-1" style={{ scrollbarWidth: "none" }}>
          {TABS.map((t, i) => (
            <button key={t} type="button" onClick={() => setTabIdx(i)}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
              style={{
                background: i === tabIdx ? "var(--accent)" : "transparent",
                color:      i === tabIdx ? "white"         : "var(--muted)",
              }}>
              {t}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => nav(1)} disabled={tabIdx === TABS.length - 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 disabled:opacity-20"
          style={{ background: "var(--surface)" }}>
          <ChevronRight className="w-4 h-4" style={{ color: "var(--muted)" }} />
        </button>
      </div>

      {/* ── panel ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {tab === "Capelli" && (
          <>
            <div>
              <p className="label-xs mb-3">Stile capelli</p>
              <Chips opts={TOPS} value={cfg.top} onSelect={id => update({ top: id })} />
            </div>
            <div>
              <p className="label-xs mb-3">Colore capelli</p>
              <Swatches colors={HAIR_COLOR} value={cfg.hairColor} onSelect={hex => update({ hairColor: hex })} />
            </div>
          </>
        )}

        {tab === "Viso" && (
          <>
            <div>
              <p className="label-xs mb-3">Carnagione</p>
              <Swatches colors={SKIN} value={cfg.skinColor} onSelect={hex => update({ skinColor: hex })} />
            </div>
            <div>
              <p className="label-xs mb-3">Sopracciglia</p>
              <Chips opts={BROW_OPTS} value={cfg.eyebrows} onSelect={id => update({ eyebrows: id })} />
            </div>
          </>
        )}

        {tab === "Occhi" && (
          <div>
            <p className="label-xs mb-3">Occhi</p>
            <Chips opts={EYES_OPTS} value={cfg.eyes} onSelect={id => update({ eyes: id })} />
          </div>
        )}

        {tab === "Bocca" && (
          <div>
            <p className="label-xs mb-3">Espressione</p>
            <Chips opts={MOUTH_OPTS} value={cfg.mouth} onSelect={id => update({ mouth: id })} />
          </div>
        )}

        {tab === "Vestiti" && (
          <>
            <div>
              <p className="label-xs mb-3">Tipo</p>
              <Chips opts={CLOTHING_OPTS} value={cfg.clothing} onSelect={id => update({ clothing: id })} />
            </div>
            <div>
              <p className="label-xs mb-3">Colore</p>
              <Swatches colors={CLOTHES_COLOR} value={cfg.clothesColor} onSelect={hex => update({ clothesColor: hex })} />
            </div>
          </>
        )}

        {tab === "Extra" && (
          <>
            <div>
              <p className="label-xs mb-3">Occhiali</p>
              <Chips opts={ACC_OPTS} value={cfg.accessories} onSelect={id => update({ accessories: id })} />
            </div>
            <div>
              <p className="label-xs mb-3">Barba</p>
              <Chips opts={BEARD_OPTS} value={cfg.facialHair} onSelect={id => update({ facialHair: id })} />
            </div>
          </>
        )}

        {tab === "Sfondo" && (
          <div>
            <p className="label-xs mb-3">Colore sfondo</p>
            <div className="grid grid-cols-4 gap-4">
              {BG.map(c => {
                const hex = c.replace("#", "");
                const active = hex === cfg.bg;
                return (
                  <button key={c} type="button" onClick={() => update({ bg: hex })}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
                    style={{
                      border:     `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
                      background: active ? "var(--accent-soft)" : "var(--surface)",
                    }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%",
                      background: c,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
