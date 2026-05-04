// All SVGs share viewBox="0 0 400 400" matching the canvas.
// SKIN_PLACEHOLDER and HAIR_PLACEHOLDER are replaced at render time.

export type LayerKey =
  | "background" | "body" | "clothes" | "head" | "ears"
  | "beard" | "mouth" | "nose" | "eyes" | "eyebrows"
  | "details" | "hair_back" | "hair_front" | "glasses" | "accessories";

export interface AvatarOption {
  id: string;
  label: string;
  svg: string;
}

export interface AvatarCategory {
  key: LayerKey;
  label: string;
  optional?: boolean;
  options: AvatarOption[];
}

export interface AvatarState {
  bgColor: string;
  skinTone: string;
  hairColor: string;
  layers: Record<LayerKey, string | null>;
}

// ─── helpers ──────────────────────────────────────────────────────────────────
const wrap = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">${inner}</svg>`;

// ─── Background ───────────────────────────────────────────────────────────────
const BG_COLORS = ["#FF4A24","#1E3A5F","#8B9BB4","#6D41FF","#16A34A","#D97706","#C84FD0","#0EA5E9"];

export const BG_OPTIONS: AvatarOption[] = BG_COLORS.map((c, i) => ({
  id: `bg_${i}`,
  label: c,
  svg: wrap(`<circle cx="200" cy="200" r="198" fill="${c}"/>`),
}));

// ─── Body (neck + shoulders) ──────────────────────────────────────────────────
const bodyBase = (neckW = 52, shoulderY = 310) => wrap(`
  <ellipse cx="200" cy="${shoulderY + 40}" rx="${neckW / 2 + 2}" ry="14" fill="SKIN_PLACEHOLDER"/>
  <rect x="${200 - neckW / 2}" y="268" width="${neckW}" height="${shoulderY - 268}" fill="SKIN_PLACEHOLDER"/>
  <ellipse cx="200" cy="275" rx="${neckW / 2}" ry="12" fill="SKIN_PLACEHOLDER"/>
`);

export const BODY_OPTIONS: AvatarOption[] = [
  { id: "body_1", label: "Standard", svg: bodyBase(52, 310) },
  { id: "body_2", label: "Largo",    svg: bodyBase(60, 305) },
  { id: "body_3", label: "Stretto",  svg: bodyBase(44, 315) },
];

// ─── Clothes ──────────────────────────────────────────────────────────────────
const hoodie = (c1: string, c2: string) => wrap(`
  <path d="M60,400 Q80,300 130,285 L200,310 L270,285 Q320,300 340,400 Z" fill="${c1}" stroke="#1a1a2e" stroke-width="2.5"/>
  <path d="M155,285 Q200,330 245,285" fill="none" stroke="${c2}" stroke-width="3"/>
  <path d="M200,295 L200,320" stroke="${c2}" stroke-width="3"/>
`);
const tshirt = (c: string) => wrap(`
  <path d="M80,400 Q95,305 130,288 L155,280 Q155,308 245,308 Q245,280 270,288 Q305,305 320,400 Z" fill="${c}" stroke="#1a1a2e" stroke-width="2.5"/>
  <path d="M130,288 Q120,265 100,268 L80,295 Q100,295 105,285" fill="${c}" stroke="#1a1a2e" stroke-width="2.5"/>
  <path d="M270,288 Q280,265 300,268 L320,295 Q300,295 295,285" fill="${c}" stroke="#1a1a2e" stroke-width="2.5"/>
`);
const shirt = (c: string) => wrap(`
  <path d="M75,400 Q90,305 125,285 L155,275 L155,285 Q200,310 245,285 L245,275 L275,285 Q310,305 325,400 Z" fill="${c}" stroke="#1a1a2e" stroke-width="2.5"/>
  <path d="M155,275 L155,340" stroke="#d4d4d4" stroke-width="2"/>
  <circle cx="155" cy="295" r="3" fill="#aaa"/>
  <circle cx="155" cy="315" r="3" fill="#aaa"/>
`);
const jacket = (c1: string, c2: string) => wrap(`
  <path d="M75,400 Q88,300 125,283 L200,315 L275,283 Q312,300 325,400 Z" fill="${c1}" stroke="#1a1a2e" stroke-width="2.5"/>
  <path d="M175,315 L175,400" stroke="${c2}" stroke-width="3"/>
  <path d="M225,315 L225,400" stroke="${c2}" stroke-width="3"/>
  <path d="M125,283 Q115,262 95,265 L75,290 Q95,290 100,278" fill="${c1}" stroke="#1a1a2e" stroke-width="2.5"/>
  <path d="M275,283 Q285,262 305,265 L325,290 Q305,290 300,278" fill="${c1}" stroke="#1a1a2e" stroke-width="2.5"/>
`);
const tank = (c: string) => wrap(`
  <path d="M110,400 L110,305 Q115,285 140,280 Q200,300 260,280 Q285,285 290,305 L290,400 Z" fill="${c}" stroke="#1a1a2e" stroke-width="2.5"/>
  <path d="M110,305 Q105,285 120,278" fill="none" stroke="#1a1a2e" stroke-width="2.5"/>
  <path d="M290,305 Q295,285 280,278" fill="none" stroke="#1a1a2e" stroke-width="2.5"/>
`);

export const CLOTHES_OPTIONS: AvatarOption[] = [
  { id: "hoodie_orange", label: "Felpa arancio", svg: hoodie("#FF4A24","#cc3a1a") },
  { id: "hoodie_navy",   label: "Felpa blu",     svg: hoodie("#1E3A5F","#162c48") },
  { id: "tshirt_white",  label: "T-shirt bianca", svg: tshirt("#f5f5f5") },
  { id: "tshirt_black",  label: "T-shirt nera",  svg: tshirt("#2a2a2a") },
  { id: "shirt_blue",    label: "Camicia blu",   svg: shirt("#4a90d9") },
  { id: "shirt_white",   label: "Camicia bianca",svg: shirt("#fafafa") },
  { id: "jacket_denim",  label: "Giacca denim",  svg: jacket("#4a6fa5","#3a5a8a") },
  { id: "jacket_black",  label: "Giacca nera",   svg: jacket("#2a2a2a","#1a1a1a") },
  { id: "tank_grey",     label: "Canottiera",    svg: tank("#9ca3af") },
];

// ─── Head shapes ──────────────────────────────────────────────────────────────
const head = (rx: number, ry: number, cy = 172) => wrap(`
  <ellipse cx="200" cy="${cy}" rx="${rx}" ry="${ry}" fill="SKIN_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2.5"/>
`);

export const HEAD_OPTIONS: AvatarOption[] = [
  { id: "head_oval",   label: "Ovale",    svg: head(82, 96) },
  { id: "head_round",  label: "Rotondo",  svg: head(90, 90, 175) },
  { id: "head_square", label: "Squadrato",svg: wrap(`
    <rect x="115" y="80" width="170" height="185" rx="42" fill="SKIN_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2.5"/>
  `)},
];

// ─── Ears ─────────────────────────────────────────────────────────────────────
const ears = (cy = 172, rx = 82) => wrap(`
  <ellipse cx="${200 - rx - 5}" cy="${cy}" rx="14" ry="20" fill="SKIN_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
  <ellipse cx="${200 + rx + 5}" cy="${cy}" rx="14" ry="20" fill="SKIN_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
`);

export const EARS_OPTIONS: AvatarOption[] = [
  { id: "ears_normal", label: "Normali", svg: ears(172, 82) },
  { id: "ears_small",  label: "Piccole", svg: ears(174, 82).replace(/rx="14"/g,'rx="10"').replace(/ry="20"/g,'ry="14"') },
];

// ─── Beard ────────────────────────────────────────────────────────────────────
export const BEARD_OPTIONS: AvatarOption[] = [
  { id: "beard_none",  label: "Nessuna", svg: wrap("") },
  { id: "beard_short", label: "Corta",   svg: wrap(`
    <path d="M138,230 Q145,265 200,272 Q255,265 262,230 Q240,245 200,247 Q160,245 138,230Z" fill="HAIR_PLACEHOLDER" opacity="0.9"/>
  `)},
  { id: "beard_full",  label: "Lunga",   svg: wrap(`
    <path d="M132,225 Q130,285 200,300 Q270,285 268,225 Q245,250 200,255 Q155,250 132,225Z" fill="HAIR_PLACEHOLDER" opacity="0.9"/>
    <path d="M165,295 Q200,330 235,295 Q218,320 200,325 Q182,320 165,295Z" fill="HAIR_PLACEHOLDER" opacity="0.9"/>
  `)},
  { id: "beard_mustache", label: "Baffi", svg: wrap(`
    <path d="M172,218 Q185,228 200,222 Q215,228 228,218 Q218,232 200,228 Q182,232 172,218Z" fill="HAIR_PLACEHOLDER" opacity="0.9"/>
  `)},
  { id: "beard_goatee", label: "Pizzetto", svg: wrap(`
    <ellipse cx="200" cy="250" rx="22" ry="16" fill="HAIR_PLACEHOLDER" opacity="0.9"/>
    <path d="M172,218 Q185,228 200,222 Q215,228 228,218 Q218,232 200,228 Q182,232 172,218Z" fill="HAIR_PLACEHOLDER" opacity="0.9"/>
  `)},
];

// ─── Mouth ────────────────────────────────────────────────────────────────────
export const MOUTH_OPTIONS: AvatarOption[] = [
  { id: "mouth_smile",  label: "Sorriso",  svg: wrap(`
    <path d="M172,220 Q200,242 228,220" fill="none" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/>
    <path d="M174,222 Q200,244 226,222 Q200,252 174,222Z" fill="#e74c3c" opacity="0.7"/>
  `)},
  { id: "mouth_neutral",label: "Neutra",   svg: wrap(`
    <path d="M178,228 L222,228" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/>
  `)},
  { id: "mouth_open",   label: "Aperta",   svg: wrap(`
    <path d="M170,218 Q200,242 230,218 Q220,248 200,250 Q180,248 170,218Z" fill="#c0392b"/>
    <path d="M174,234 L226,234" stroke="#e8c4b8" stroke-width="3"/>
  `)},
  { id: "mouth_smirk",  label: "Sorrisetto",svg: wrap(`
    <path d="M178,225 Q208,238 228,220" fill="none" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/>
  `)},
];

// ─── Nose ─────────────────────────────────────────────────────────────────────
export const NOSE_OPTIONS: AvatarOption[] = [
  { id: "nose_small",  label: "Piccolo", svg: wrap(`
    <path d="M193,178 Q196,198 188,205 Q200,210 212,205 Q204,198 207,178" fill="none" stroke="SKIN_PLACEHOLDER" stroke-width="3" stroke-linecap="round" filter="brightness(0.75)"/>
    <ellipse cx="193" cy="204" rx="7" ry="5" fill="none" stroke="#c9956e" stroke-width="2"/>
    <ellipse cx="207" cy="204" rx="7" ry="5" fill="none" stroke="#c9956e" stroke-width="2"/>
  `)},
  { id: "nose_medium", label: "Medio",   svg: wrap(`
    <path d="M191,175 Q193,200 182,210 Q200,216 218,210 Q207,200 209,175" fill="none" stroke="#c9956e" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M182,210 Q191,218 200,215 Q209,218 218,210" fill="none" stroke="#c9956e" stroke-width="2.5"/>
  `)},
  { id: "nose_wide",   label: "Largo",   svg: wrap(`
    <path d="M195,175 Q195,198 180,210 Q200,220 220,210 Q205,198 205,175" fill="none" stroke="#c9956e" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="184" cy="210" rx="10" ry="7" fill="none" stroke="#c9956e" stroke-width="2"/>
    <ellipse cx="216" cy="210" rx="10" ry="7" fill="none" stroke="#c9956e" stroke-width="2"/>
  `)},
];

// ─── Eyes ─────────────────────────────────────────────────────────────────────
const eye = (lx: number, rx: number, cy: number, style: string) => wrap(`
  ${style.replace(/LX/g, String(lx)).replace(/RX/g, String(rx)).replace(/CY/g, String(cy))}
`);

const normalEye = `
  <ellipse cx="LX" cy="CY" rx="18" ry="13" fill="white" stroke="#1a1a2e" stroke-width="2"/>
  <circle cx="LX" cy="CY" r="8" fill="#4a7fc1"/>
  <circle cx="LX" cy="CY" r="4" fill="#1a1a2e"/>
  <circle cx="${"LX".replace("LX","")+"LX"}" cy="${"CY"}" r="2" fill="white" transform="translate(3,-3)"/>
  <ellipse cx="RX" cy="CY" rx="18" ry="13" fill="white" stroke="#1a1a2e" stroke-width="2"/>
  <circle cx="RX" cy="CY" r="8" fill="#4a7fc1"/>
  <circle cx="RX" cy="CY" r="4" fill="#1a1a2e"/>
`;

export const EYES_OPTIONS: AvatarOption[] = [
  { id: "eyes_normal", label: "Normali", svg: wrap(`
    <ellipse cx="163" cy="158" rx="20" ry="14" fill="white" stroke="#1a1a2e" stroke-width="2"/>
    <circle cx="163" cy="158" r="9" fill="#4a7fc1"/>
    <circle cx="163" cy="158" r="5" fill="#1a1a2e"/>
    <circle cx="166" cy="155" r="2.5" fill="white"/>
    <ellipse cx="237" cy="158" rx="20" ry="14" fill="white" stroke="#1a1a2e" stroke-width="2"/>
    <circle cx="237" cy="158" r="9" fill="#4a7fc1"/>
    <circle cx="237" cy="158" r="5" fill="#1a1a2e"/>
    <circle cx="240" cy="155" r="2.5" fill="white"/>
  `)},
  { id: "eyes_wink", label: "Ammiccanti", svg: wrap(`
    <ellipse cx="163" cy="160" rx="20" ry="14" fill="white" stroke="#1a1a2e" stroke-width="2"/>
    <circle cx="163" cy="160" r="9" fill="#4a7fc1"/>
    <circle cx="163" cy="160" r="5" fill="#1a1a2e"/>
    <circle cx="166" cy="157" r="2.5" fill="white"/>
    <path d="M218,155 Q237,148 256,155" fill="none" stroke="#1a1a2e" stroke-width="3" stroke-linecap="round"/>
    <path d="M218,160 Q237,152 256,160" fill="none" stroke="#1a1a2e" stroke-width="2.5"/>
  `)},
  { id: "eyes_large", label: "Grandi", svg: wrap(`
    <ellipse cx="163" cy="157" rx="24" ry="20" fill="white" stroke="#1a1a2e" stroke-width="2.5"/>
    <circle cx="163" cy="157" r="13" fill="#4a7fc1"/>
    <circle cx="163" cy="157" r="7" fill="#1a1a2e"/>
    <circle cx="167" cy="153" r="3" fill="white"/>
    <ellipse cx="237" cy="157" rx="24" ry="20" fill="white" stroke="#1a1a2e" stroke-width="2.5"/>
    <circle cx="237" cy="157" r="13" fill="#4a7fc1"/>
    <circle cx="237" cy="157" r="7" fill="#1a1a2e"/>
    <circle cx="241" cy="153" r="3" fill="white"/>
  `)},
  { id: "eyes_almond", label: "Mandorla", svg: wrap(`
    <path d="M140,162 Q163,148 186,162 Q163,172 140,162Z" fill="white" stroke="#1a1a2e" stroke-width="2"/>
    <circle cx="163" cy="162" r="7" fill="#4a7fc1"/>
    <circle cx="163" cy="162" r="4" fill="#1a1a2e"/>
    <path d="M214,162 Q237,148 260,162 Q237,172 214,162Z" fill="white" stroke="#1a1a2e" stroke-width="2"/>
    <circle cx="237" cy="162" r="7" fill="#4a7fc1"/>
    <circle cx="237" cy="162" r="4" fill="#1a1a2e"/>
  `)},
];

// ─── Eyebrows ─────────────────────────────────────────────────────────────────
export const EYEBROWS_OPTIONS: AvatarOption[] = [
  { id: "brow_straight", label: "Dritte", svg: wrap(`
    <path d="M140,138 L184,136" stroke="HAIR_PLACEHOLDER" stroke-width="5" stroke-linecap="round"/>
    <path d="M216,136 L260,138" stroke="HAIR_PLACEHOLDER" stroke-width="5" stroke-linecap="round"/>
  `)},
  { id: "brow_arched",   label: "Arcuate", svg: wrap(`
    <path d="M140,142 Q163,130 184,138" fill="none" stroke="HAIR_PLACEHOLDER" stroke-width="5" stroke-linecap="round"/>
    <path d="M216,138 Q237,130 260,142" fill="none" stroke="HAIR_PLACEHOLDER" stroke-width="5" stroke-linecap="round"/>
  `)},
  { id: "brow_thick",    label: "Spesse",  svg: wrap(`
    <path d="M138,140 Q163,130 186,138" fill="none" stroke="HAIR_PLACEHOLDER" stroke-width="8" stroke-linecap="round"/>
    <path d="M214,138 Q237,130 262,140" fill="none" stroke="HAIR_PLACEHOLDER" stroke-width="8" stroke-linecap="round"/>
  `)},
];

// ─── Details ──────────────────────────────────────────────────────────────────
export const DETAILS_OPTIONS: AvatarOption[] = [
  { id: "details_none",      label: "Nessuno",    svg: wrap("") },
  { id: "details_freckles",  label: "Lentiggini", svg: wrap(`
    <circle cx="175" cy="192" r="3" fill="#c97b5a" opacity="0.6"/>
    <circle cx="185" cy="198" r="2.5" fill="#c97b5a" opacity="0.6"/>
    <circle cx="168" cy="200" r="2" fill="#c97b5a" opacity="0.6"/>
    <circle cx="225" cy="192" r="3" fill="#c97b5a" opacity="0.6"/>
    <circle cx="215" cy="198" r="2.5" fill="#c97b5a" opacity="0.6"/>
    <circle cx="232" cy="200" r="2" fill="#c97b5a" opacity="0.6"/>
  `)},
  { id: "details_blush",     label: "Guance",     svg: wrap(`
    <ellipse cx="152" cy="195" rx="22" ry="12" fill="#f87171" opacity="0.25"/>
    <ellipse cx="248" cy="195" rx="22" ry="12" fill="#f87171" opacity="0.25"/>
  `)},
  { id: "details_mole",      label: "Neo",         svg: wrap(`
    <circle cx="226" cy="208" r="4" fill="#3a2a1a"/>
  `)},
  { id: "details_bindi",     label: "Bindi",       svg: wrap(`
    <circle cx="200" cy="128" r="8" fill="#c0392b"/>
    <circle cx="200" cy="128" r="4" fill="#e74c3c"/>
  `)},
];

// ─── Hair back ────────────────────────────────────────────────────────────────
export const HAIR_BACK_OPTIONS: AvatarOption[] = [
  { id: "hair_back_none",    label: "Nessuno",     svg: wrap("") },
  { id: "hair_back_long",    label: "Lunghi",      svg: wrap(`
    <path d="M118,115 Q80,200 90,350 L110,360 Q115,240 140,175" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="1.5"/>
    <path d="M282,115 Q320,200 310,350 L290,360 Q285,240 260,175" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="1.5"/>
  `)},
  { id: "hair_back_ponytail",label: "Coda alta",   svg: wrap(`
    <path d="M190,82 Q195,140 192,320 Q198,340 200,320 Q202,340 208,320 Q205,140 210,82" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="1.5"/>
    <ellipse cx="200" cy="84" rx="18" ry="10" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
  `)},
  { id: "hair_back_dreads",  label: "Dreadlock",   svg: wrap(`
    <path d="M118,120 Q85,190 88,320 Q100,340 105,310 Q108,230 128,165" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
    <path d="M125,125 Q100,195 103,310 Q113,330 118,305 Q120,240 138,170" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
    <path d="M282,120 Q315,190 312,320 Q300,340 295,310 Q292,230 272,165" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
    <path d="M275,125 Q300,195 297,310 Q287,330 282,305 Q280,240 262,170" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
  `)},
  { id: "hair_back_braids",  label: "Trecce",      svg: wrap(`
    <path d="M120,120 Q110,200 108,340 Q118,355 122,330 Q124,240 135,170" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="1.5"/>
    <path d="M280,120 Q290,200 292,340 Q282,355 278,330 Q276,240 265,170" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="1.5"/>
    <line x1="112" y1="170" x2="134" y2="172" stroke="#1a1a2e" stroke-width="2"/>
    <line x1="111" y1="200" x2="133" y2="202" stroke="#1a1a2e" stroke-width="2"/>
    <line x1="110" y1="230" x2="133" y2="232" stroke="#1a1a2e" stroke-width="2"/>
    <line x1="266" y1="170" x2="288" y2="172" stroke="#1a1a2e" stroke-width="2"/>
    <line x1="267" y1="200" x2="289" y2="202" stroke="#1a1a2e" stroke-width="2"/>
    <line x1="267" y1="230" x2="290" y2="232" stroke="#1a1a2e" stroke-width="2"/>
  `)},
];

// ─── Hair front ───────────────────────────────────────────────────────────────
export const HAIR_FRONT_OPTIONS: AvatarOption[] = [
  { id: "hair_short_side",  label: "Corti laterali", svg: wrap(`
    <path d="M118,145 Q118,78 200,72 Q282,78 282,145 Q265,100 200,98 Q135,100 118,145Z" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
    <path d="M118,145 Q110,105 120,85" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
    <path d="M282,145 Q290,105 280,85" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
  `)},
  { id: "hair_fringe",      label: "Frangia",        svg: wrap(`
    <path d="M118,148 Q118,75 200,68 Q282,75 282,148 Q265,95 200,92 Q135,95 118,148Z" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
    <path d="M140,120 Q175,132 220,125 Q255,118 278,130" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="1"/>
    <path d="M118,148 Q110,108 120,88" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
    <path d="M282,148 Q290,108 280,88" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
  `)},
  { id: "hair_curly",       label: "Ricci",           svg: wrap(`
    <path d="M115,148 Q112,75 200,65 Q288,75 285,148 Q270,90 200,88 Q130,90 115,148Z" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
    <circle cx="130" cy="100" r="18" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
    <circle cx="155" cy="80"  r="20" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
    <circle cx="185" cy="72"  r="20" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
    <circle cx="215" cy="72"  r="20" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
    <circle cx="245" cy="80"  r="20" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
    <circle cx="270" cy="100" r="18" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
  `)},
  { id: "hair_bald",        label: "Rasato",          svg: wrap(`
    <path d="M118,168 Q118,78 200,72 Q282,78 282,168 Q265,110 200,108 Q135,110 118,168Z" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2" opacity="0.5"/>
  `)},
  { id: "hair_messy",       label: "Spettinati",      svg: wrap(`
    <path d="M118,148 Q116,78 200,70 Q284,78 282,148 Q265,95 200,93 Q135,95 118,148Z" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
    <path d="M140,85 Q155,72 170,82" fill="none" stroke="HAIR_PLACEHOLDER" stroke-width="8" stroke-linecap="round"/>
    <path d="M200,72 Q210,58 225,70" fill="none" stroke="HAIR_PLACEHOLDER" stroke-width="8" stroke-linecap="round"/>
    <path d="M255,82 Q268,70 278,84" fill="none" stroke="HAIR_PLACEHOLDER" stroke-width="8" stroke-linecap="round"/>
    <path d="M118,148 Q110,108 120,88" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
    <path d="M282,148 Q290,108 280,88" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
  `)},
  { id: "hair_shaved",      label: "Zero",            svg: wrap(`
    <path d="M118,155 Q118,88 200,82 Q282,88 282,155 Q265,115 200,113 Q135,115 118,155Z" fill="HAIR_PLACEHOLDER" opacity="0.4" stroke="#1a1a2e" stroke-width="1.5"/>
  `)},
];

// ─── Glasses ──────────────────────────────────────────────────────────────────
export const GLASSES_OPTIONS: AvatarOption[] = [
  { id: "glasses_none",   label: "Nessuno",      svg: wrap("") },
  { id: "glasses_round",  label: "Rotondi",      svg: wrap(`
    <circle cx="163" cy="162" r="26" fill="none" stroke="#1a1a2e" stroke-width="3.5"/>
    <circle cx="237" cy="162" r="26" fill="none" stroke="#1a1a2e" stroke-width="3.5"/>
    <line x1="189" y1="162" x2="211" y2="162" stroke="#1a1a2e" stroke-width="3"/>
    <line x1="113" y1="158" x2="137" y2="160" stroke="#1a1a2e" stroke-width="3"/>
    <line x1="263" y1="160" x2="287" y2="158" stroke="#1a1a2e" stroke-width="3"/>
    <circle cx="163" cy="162" r="26" fill="#a8d8f0" opacity="0.15"/>
    <circle cx="237" cy="162" r="26" fill="#a8d8f0" opacity="0.15"/>
  `)},
  { id: "glasses_rect",   label: "Rettangolari", svg: wrap(`
    <rect x="136" y="147" width="54" height="32" rx="6" fill="#a8d8f0" fill-opacity="0.15" stroke="#1a1a2e" stroke-width="3.5"/>
    <rect x="210" y="147" width="54" height="32" rx="6" fill="#a8d8f0" fill-opacity="0.15" stroke="#1a1a2e" stroke-width="3.5"/>
    <line x1="190" y1="163" x2="210" y2="163" stroke="#1a1a2e" stroke-width="3"/>
    <line x1="110" y1="158" x2="136" y2="160" stroke="#1a1a2e" stroke-width="3"/>
    <line x1="264" y1="160" x2="290" y2="158" stroke="#1a1a2e" stroke-width="3"/>
  `)},
  { id: "glasses_sun",    label: "Da sole",      svg: wrap(`
    <circle cx="163" cy="162" r="26" fill="#1a1a2e" opacity="0.85" stroke="#1a1a2e" stroke-width="3"/>
    <circle cx="237" cy="162" r="26" fill="#1a1a2e" opacity="0.85" stroke="#1a1a2e" stroke-width="3"/>
    <line x1="189" y1="162" x2="211" y2="162" stroke="#1a1a2e" stroke-width="3"/>
    <line x1="113" y1="158" x2="137" y2="160" stroke="#1a1a2e" stroke-width="3"/>
    <line x1="263" y1="160" x2="287" y2="158" stroke="#1a1a2e" stroke-width="3"/>
  `)},
];

// ─── Accessories ─────────────────────────────────────────────────────────────
export const ACCESSORIES_OPTIONS: AvatarOption[] = [
  { id: "acc_none",     label: "Nessuno",   svg: wrap("") },
  { id: "acc_headphones", label: "Cuffie", svg: wrap(`
    <path d="M118,162 Q118,75 200,72 Q282,75 282,162" fill="none" stroke="#2a2a2a" stroke-width="10" stroke-linecap="round"/>
    <rect x="105" y="148" width="26" height="38" rx="10" fill="#FF4A24" stroke="#1a1a2e" stroke-width="2"/>
    <rect x="269" y="148" width="26" height="38" rx="10" fill="#FF4A24" stroke="#1a1a2e" stroke-width="2"/>
  `)},
  { id: "acc_hijab",   label: "Velo",      svg: wrap(`
    <path d="M110,145 Q110,72 200,68 Q290,72 290,145 Q290,240 270,290 Q240,320 200,325 Q160,320 130,290 Q110,240 110,145Z" fill="HAIR_PLACEHOLDER" stroke="#1a1a2e" stroke-width="2"/>
    <path d="M115,148 Q112,180 115,220 Q128,205 118,175Z" fill="HAIR_PLACEHOLDER" opacity="0.7"/>
    <path d="M285,148 Q288,180 285,220 Q272,205 282,175Z" fill="HAIR_PLACEHOLDER" opacity="0.7"/>
  `)},
  { id: "acc_headband",label: "Cerchietto",svg: wrap(`
    <path d="M118,128 Q118,80 200,75 Q282,80 282,128" fill="none" stroke="#FF4A24" stroke-width="12" stroke-linecap="round"/>
  `)},
  { id: "acc_earrings",label: "Orecchini", svg: wrap(`
    <circle cx="113" cy="182" r="8" fill="none" stroke="#f59e0b" stroke-width="3"/>
    <circle cx="287" cy="182" r="8" fill="none" stroke="#f59e0b" stroke-width="3"/>
  `)},
  { id: "acc_necklace",label: "Collana",   svg: wrap(`
    <path d="M155,275 Q200,295 245,275" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
    <circle cx="200" cy="295" r="6" fill="#f59e0b"/>
  `)},
];

// ─── CATEGORIES array ─────────────────────────────────────────────────────────
export const CATEGORIES: AvatarCategory[] = [
  { key: "background",   label: "Sfondo",        options: BG_OPTIONS },
  { key: "head",         label: "Viso",           options: HEAD_OPTIONS },
  { key: "hair_front",   label: "Capelli",        options: HAIR_FRONT_OPTIONS },
  { key: "hair_back",    label: "Capelli retro",  options: HAIR_BACK_OPTIONS, optional: true },
  { key: "eyes",         label: "Occhi",          options: EYES_OPTIONS },
  { key: "eyebrows",     label: "Sopracciglia",   options: EYEBROWS_OPTIONS },
  { key: "nose",         label: "Naso",           options: NOSE_OPTIONS },
  { key: "mouth",        label: "Bocca",          options: MOUTH_OPTIONS },
  { key: "beard",        label: "Barba",          options: BEARD_OPTIONS, optional: true },
  { key: "details",      label: "Dettagli",       options: DETAILS_OPTIONS, optional: true },
  { key: "clothes",      label: "Vestiti",        options: CLOTHES_OPTIONS },
  { key: "glasses",      label: "Occhiali",       options: GLASSES_OPTIONS, optional: true },
  { key: "accessories",  label: "Accessori",      options: ACCESSORIES_OPTIONS, optional: true },
  // body and ears are auto-selected, not in tabs
  { key: "body",         label: "Corpo",          options: BODY_OPTIONS },
  { key: "ears",         label: "Orecchie",       options: EARS_OPTIONS },
];

// ─── Default state ────────────────────────────────────────────────────────────
export const DEFAULT_STATE: AvatarState = {
  bgColor:   "#FF4A24",
  skinTone:  "#E8B88A",
  hairColor: "#1A1A1A",
  layers: {
    background:  "bg_0",
    body:        "body_1",
    clothes:     "hoodie_orange",
    head:        "head_oval",
    ears:        "ears_normal",
    beard:       "beard_none",
    mouth:       "mouth_smile",
    nose:        "nose_medium",
    eyes:        "eyes_normal",
    eyebrows:    "brow_arched",
    details:     "details_none",
    hair_back:   "hair_back_none",
    hair_front:  "hair_short_side",
    glasses:     "glasses_none",
    accessories: "acc_none",
  },
};

export const SKIN_TONES = ["#FDDBB4","#E8B88A","#C68B5A","#8D5524","#4A2810"];
export const HAIR_COLORS = ["#1A1A1A","#4A2E19","#8B5E3C","#D4A853","#C0C0C0","#4169E1","#8B008B","#2E8B57"];

// ─── Render-time helpers ──────────────────────────────────────────────────────
export function applyColors(svg: string, skin: string, hair: string): string {
  return svg.replace(/SKIN_PLACEHOLDER/g, skin).replace(/HAIR_PLACEHOLDER/g, hair);
}

export function getOption(key: LayerKey, id: string | null): AvatarOption | undefined {
  if (!id) return undefined;
  const cat = CATEGORIES.find(c => c.key === key);
  return cat?.options.find(o => o.id === id);
}

export const LAYER_ORDER: LayerKey[] = [
  "background","body","clothes","head","ears",
  "beard","mouth","nose","eyes","eyebrows",
  "details","hair_back","hair_front","glasses","accessories",
];
