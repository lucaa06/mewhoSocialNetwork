// High-quality flat vector SVGs — viewBox="0 0 400 400"
// Character layout: head cx=200 cy=192, eyes y=172, mouth y=238, chin y=298
// SKIN_PLACEHOLDER → skin hex, HAIR_PLACEHOLDER → hair hex at render time

export type LayerKey =
  | "background" | "body" | "clothes" | "head" | "ears"
  | "beard" | "mouth" | "nose" | "eyes" | "eyebrows"
  | "details" | "hair_back" | "hair_front" | "glasses" | "accessories";

export interface AvatarOption  { id: string; label: string; svg: string }
export interface AvatarCategory { key: LayerKey; label: string; optional?: boolean; options: AvatarOption[] }
export interface AvatarState {
  bgColor: string; skinTone: string; hairColor: string;
  layers: Record<LayerKey, string | null>;
}

const w = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">${inner}</svg>`;

// ─── BACKGROUND ───────────────────────────────────────────────────────────────
export const BG_OPTIONS: AvatarOption[] = [
  { id:"bg_orange", label:"Arancione", svg: w(`<circle cx="200" cy="200" r="199" fill="#FF4A24"/>`) },
  { id:"bg_navy",   label:"Blu navy",  svg: w(`<circle cx="200" cy="200" r="199" fill="#1E3A5F"/>`) },
  { id:"bg_grey",   label:"Grigio",    svg: w(`<circle cx="200" cy="200" r="199" fill="#8B9BB4"/>`) },
  { id:"bg_purple", label:"Viola",     svg: w(`<circle cx="200" cy="200" r="199" fill="#6D41FF"/>`) },
  { id:"bg_green",  label:"Verde",     svg: w(`<circle cx="200" cy="200" r="199" fill="#16A34A"/>`) },
  { id:"bg_amber",  label:"Ambra",     svg: w(`<circle cx="200" cy="200" r="199" fill="#D97706"/>`) },
  { id:"bg_pink",   label:"Rosa",      svg: w(`<circle cx="200" cy="200" r="199" fill="#C84FD0"/>`) },
  { id:"bg_sky",    label:"Cielo",     svg: w(`<circle cx="200" cy="200" r="199" fill="#0EA5E9"/>`) },
];

// ─── EARS ─────────────────────────────────────────────────────────────────────
export const EARS_OPTIONS: AvatarOption[] = [
  { id:"ears_1", label:"Normali", svg: w(`
    <ellipse cx="101" cy="193" rx="16" ry="22" fill="SKIN_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <ellipse cx="101" cy="193" rx="9" ry="13" fill="SKIN_PLACEHOLDER" stroke="#c8895a" stroke-width="1.5" opacity=".5"/>
    <ellipse cx="299" cy="193" rx="16" ry="22" fill="SKIN_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <ellipse cx="299" cy="193" rx="9" ry="13" fill="SKIN_PLACEHOLDER" stroke="#c8895a" stroke-width="1.5" opacity=".5"/>
  `) },
];

// ─── BODY (neck + shoulders — always below clothes) ───────────────────────────
export const BODY_OPTIONS: AvatarOption[] = [
  { id:"body_1", label:"Standard", svg: w(`
    <path d="M172,296 C172,296 168,308 168,328 L232,328 C232,308 228,296 228,296Z" fill="SKIN_PLACEHOLDER"/>
    <ellipse cx="200" cy="296" rx="28" ry="8" fill="SKIN_PLACEHOLDER"/>
    <ellipse cx="200" cy="328" rx="32" ry="10" fill="SKIN_PLACEHOLDER"/>
  `) },
];

// ─── HEAD ─────────────────────────────────────────────────────────────────────
const FACE = `<path d="M200,84 C260,84 300,128 300,185 C300,234 278,268 248,285 C233,294 217,299 200,299 C183,299 167,294 152,285 C122,268 100,234 100,185 C100,128 140,84 200,84Z" fill="SKIN_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
<path d="M152,285 Q200,310 248,285" fill="SKIN_PLACEHOLDER" stroke="none"/>`;

export const HEAD_OPTIONS: AvatarOption[] = [
  { id:"head_oval",   label:"Ovale",     svg: w(FACE) },
  { id:"head_round",  label:"Rotondo",   svg: w(`
    <circle cx="200" cy="192" r="110" fill="SKIN_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
  `) },
  { id:"head_square", label:"Squadrato", svg: w(`
    <path d="M200,84 C248,84 300,118 302,172 C305,228 290,268 254,286 C237,294 220,300 200,300 C180,300 163,294 146,286 C110,268 95,228 98,172 C100,118 152,84 200,84Z" fill="SKIN_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
  `) },
];

// ─── EYEBROWS ─────────────────────────────────────────────────────────────────
export const EYEBROWS_OPTIONS: AvatarOption[] = [
  { id:"brow_arch",   label:"Arcuate", svg: w(`
    <path d="M136,150 Q162,138 186,148" fill="none" stroke="HAIR_PLACEHOLDER" stroke-width="6" stroke-linecap="round"/>
    <path d="M214,148 Q238,138 264,150" fill="none" stroke="HAIR_PLACEHOLDER" stroke-width="6" stroke-linecap="round"/>
  `) },
  { id:"brow_flat",   label:"Dritte",  svg: w(`
    <path d="M136,152 L186,149" stroke="HAIR_PLACEHOLDER" stroke-width="6" stroke-linecap="round"/>
    <path d="M214,149 L264,152" stroke="HAIR_PLACEHOLDER" stroke-width="6" stroke-linecap="round"/>
  `) },
  { id:"brow_thick",  label:"Spesse",  svg: w(`
    <path d="M133,154 Q162,140 188,150" fill="none" stroke="HAIR_PLACEHOLDER" stroke-width="10" stroke-linecap="round"/>
    <path d="M212,150 Q238,140 267,154" fill="none" stroke="HAIR_PLACEHOLDER" stroke-width="10" stroke-linecap="round"/>
  `) },
  { id:"brow_raised", label:"Alzate",  svg: w(`
    <path d="M136,155 Q162,140 186,152" fill="none" stroke="HAIR_PLACEHOLDER" stroke-width="6" stroke-linecap="round"/>
    <path d="M214,152 Q238,140 264,155" fill="none" stroke="HAIR_PLACEHOLDER" stroke-width="6" stroke-linecap="round"/>
    <path d="M136,155 Q162,140 186,152" fill="none" stroke="HAIR_PLACEHOLDER" stroke-width="6" stroke-linecap="round" opacity=".4"/>
  `) },
];

// ─── EYES ─────────────────────────────────────────────────────────────────────
const EYE_L = (iris="IRIS") => `
  <ellipse cx="162" cy="172" rx="23" ry="17" fill="white" stroke="#1a0e05" stroke-width="2"/>
  <circle  cx="162" cy="173" r="13" fill="${iris}"/>
  <circle  cx="162" cy="173" r="8"  fill="#0d0500"/>
  <circle  cx="167" cy="168" r="4"  fill="white"/>
  <path d="M139,166 Q162,156 185,166" fill="none" stroke="#1a0e05" stroke-width="3" stroke-linecap="round"/>
  <path d="M140,179 Q162,186 184,179" fill="none" stroke="#1a0e05" stroke-width="1.5" stroke-linecap="round"/>`;
const EYE_R = (iris="IRIS") => `
  <ellipse cx="238" cy="172" rx="23" ry="17" fill="white" stroke="#1a0e05" stroke-width="2"/>
  <circle  cx="238" cy="173" r="13" fill="${iris}"/>
  <circle  cx="238" cy="173" r="8"  fill="#0d0500"/>
  <circle  cx="243" cy="168" r="4"  fill="white"/>
  <path d="M215,166 Q238,156 261,166" fill="none" stroke="#1a0e05" stroke-width="3" stroke-linecap="round"/>
  <path d="M216,179 Q238,186 260,179" fill="none" stroke="#1a0e05" stroke-width="1.5" stroke-linecap="round"/>`;

export const EYES_OPTIONS: AvatarOption[] = [
  { id:"eyes_brown",  label:"Marroni", svg: w(EYE_L("#7B4F2E")+EYE_R("#7B4F2E")) },
  { id:"eyes_blue",   label:"Blu",     svg: w(EYE_L("#4A7FC1")+EYE_R("#4A7FC1")) },
  { id:"eyes_green",  label:"Verdi",   svg: w(EYE_L("#4A8C5C")+EYE_R("#4A8C5C")) },
  { id:"eyes_dark",   label:"Scuri",   svg: w(EYE_L("#2A1800")+EYE_R("#2A1800")) },
  { id:"eyes_wink",   label:"Ammicc.", svg: w(`
    ${EYE_L("#7B4F2E")}
    <path d="M215,172 Q238,162 261,172" fill="none" stroke="#1a0e05" stroke-width="3" stroke-linecap="round"/>
    <path d="M215,172 Q238,180 261,172" fill="none" stroke="#1a0e05" stroke-width="2" stroke-linecap="round"/>
  `) },
  { id:"eyes_large",  label:"Grandi",  svg: w(`
    <ellipse cx="162" cy="172" rx="27" ry="22" fill="white" stroke="#1a0e05" stroke-width="2"/>
    <circle  cx="162" cy="173" r="16" fill="#7B4F2E"/>
    <circle  cx="162" cy="173" r="10" fill="#0d0500"/>
    <circle  cx="168" cy="167" r="5"  fill="white"/>
    <path d="M135,164 Q162,153 189,164" fill="none" stroke="#1a0e05" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="238" cy="172" rx="27" ry="22" fill="white" stroke="#1a0e05" stroke-width="2"/>
    <circle  cx="238" cy="173" r="16" fill="#7B4F2E"/>
    <circle  cx="238" cy="173" r="10" fill="#0d0500"/>
    <circle  cx="244" cy="167" r="5"  fill="white"/>
    <path d="M211,164 Q238,153 265,164" fill="none" stroke="#1a0e05" stroke-width="3" stroke-linecap="round"/>
  `) },
];

// ─── NOSE ─────────────────────────────────────────────────────────────────────
export const NOSE_OPTIONS: AvatarOption[] = [
  { id:"nose_button", label:"Piccolo", svg: w(`
    <ellipse cx="190" cy="217" rx="9" ry="6"  fill="none" stroke="#c8895a" stroke-width="2"/>
    <ellipse cx="210" cy="217" rx="9" ry="6"  fill="none" stroke="#c8895a" stroke-width="2"/>
    <path d="M190,210 Q200,195 210,210" fill="none" stroke="#c8895a" stroke-width="2" stroke-linecap="round"/>
  `) },
  { id:"nose_medium", label:"Medio",   svg: w(`
    <path d="M194,180 Q190,205 180,216 Q200,224 220,216 Q210,205 206,180" fill="none" stroke="#c8895a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M180,216 Q190,222 200,220 Q210,222 220,216" fill="none" stroke="#c8895a" stroke-width="2.5" stroke-linecap="round"/>
  `) },
  { id:"nose_wide",   label:"Largo",   svg: w(`
    <path d="M197,178 Q190,205 175,217 Q200,228 225,217 Q210,205 203,178" fill="none" stroke="#c8895a" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="178" cy="217" rx="12" ry="8" fill="none" stroke="#c8895a" stroke-width="2"/>
    <ellipse cx="222" cy="217" rx="12" ry="8" fill="none" stroke="#c8895a" stroke-width="2"/>
  `) },
];

// ─── MOUTH ────────────────────────────────────────────────────────────────────
export const MOUTH_OPTIONS: AvatarOption[] = [
  { id:"mouth_bigsmile", label:"Sorriso",  svg: w(`
    <path d="M164,234 Q200,262 236,234" fill="none" stroke="#1a0e05" stroke-width="3" stroke-linecap="round"/>
    <path d="M166,236 Q200,264 234,236 Q200,272 166,236Z" fill="#e8c4b8"/>
    <path d="M172,250 L228,250" stroke="white" stroke-width="4" stroke-linecap="round"/>
    <path d="M164,234 Q200,262 236,234" fill="none" stroke="#1a0e05" stroke-width="3" stroke-linecap="round"/>
  `) },
  { id:"mouth_smile",    label:"Chiuso",   svg: w(`
    <path d="M170,238 Q200,258 230,238" fill="none" stroke="#1a0e05" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M172,240 Q200,260 228,240 Q200,268 172,240Z" fill="#c97b7b" opacity=".6"/>
  `) },
  { id:"mouth_neutral",  label:"Neutra",   svg: w(`
    <path d="M175,244 Q200,250 225,244" fill="none" stroke="#1a0e05" stroke-width="3" stroke-linecap="round"/>
    <path d="M176,245 Q200,251 224,245 Q200,258 176,245Z" fill="#c97b7b" opacity=".5"/>
  `) },
  { id:"mouth_smirk",   label:"Sorris.",   svg: w(`
    <path d="M175,242 Q205,254 232,238" fill="none" stroke="#1a0e05" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M176,243 Q205,255 230,240 Q205,263 176,243Z" fill="#c97b7b" opacity=".6"/>
  `) },
];

// ─── BEARD ────────────────────────────────────────────────────────────────────
export const BEARD_OPTIONS: AvatarOption[] = [
  { id:"beard_none",   label:"Nessuna", svg: w(``) },
  { id:"beard_stubble",label:"Barba",   svg: w(`
    <path d="M134,232 Q130,275 152,291 Q175,302 200,304 Q225,302 248,291 Q270,275 266,232 Q248,248 200,252 Q152,248 134,232Z" fill="HAIR_PLACEHOLDER" opacity=".82"/>
    <path d="M152,291 Q175,302 200,304 Q225,302 248,291 Q235,308 200,310 Q165,308 152,291Z" fill="HAIR_PLACEHOLDER" opacity=".82"/>
  `) },
  { id:"beard_full",   label:"Lunga",   svg: w(`
    <path d="M128,225 Q122,285 150,305 Q174,320 200,322 Q226,320 250,305 Q278,285 272,225 Q252,252 200,256 Q148,252 128,225Z" fill="HAIR_PLACEHOLDER" opacity=".9"/>
    <path d="M170,318 Q200,345 230,318 Q218,338 200,342 Q182,338 170,318Z" fill="HAIR_PLACEHOLDER" opacity=".9"/>
    <path d="M150,305 Q174,320 200,322 Q226,320 250,305 Q235,328 200,332 Q165,328 150,305Z" fill="HAIR_PLACEHOLDER" opacity=".9"/>
  `) },
  { id:"beard_mustache",label:"Baffi",  svg: w(`
    <path d="M168,232 Q184,242 200,236 Q216,242 232,232 Q220,248 200,244 Q180,248 168,232Z" fill="HAIR_PLACEHOLDER" opacity=".9"/>
  `) },
  { id:"beard_goatee", label:"Pizzetto",svg: w(`
    <path d="M168,232 Q184,242 200,236 Q216,242 232,232 Q220,248 200,244 Q180,248 168,232Z" fill="HAIR_PLACEHOLDER" opacity=".9"/>
    <ellipse cx="200" cy="272" rx="24" ry="20" fill="HAIR_PLACEHOLDER" opacity=".9"/>
    <path d="M180,258 Q200,266 220,258 Q220,282 200,288 Q180,282 180,258Z" fill="HAIR_PLACEHOLDER" opacity=".9"/>
  `) },
];

// ─── DETAILS ─────────────────────────────────────────────────────────────────
export const DETAILS_OPTIONS: AvatarOption[] = [
  { id:"det_none",    label:"Nessuno",    svg: w(``) },
  { id:"det_freckle", label:"Lentiggini", svg: w(`
    <circle cx="172" cy="197" r="3.5" fill="#c97b5a" opacity=".55"/>
    <circle cx="184" cy="204" r="3"   fill="#c97b5a" opacity=".55"/>
    <circle cx="165" cy="205" r="2.5" fill="#c97b5a" opacity=".55"/>
    <circle cx="178" cy="210" r="2.5" fill="#c97b5a" opacity=".45"/>
    <circle cx="228" cy="197" r="3.5" fill="#c97b5a" opacity=".55"/>
    <circle cx="216" cy="204" r="3"   fill="#c97b5a" opacity=".55"/>
    <circle cx="235" cy="205" r="2.5" fill="#c97b5a" opacity=".55"/>
    <circle cx="222" cy="210" r="2.5" fill="#c97b5a" opacity=".45"/>
  `) },
  { id:"det_blush",  label:"Guance",     svg: w(`
    <ellipse cx="148" cy="200" rx="26" ry="16" fill="#f87171" opacity=".22"/>
    <ellipse cx="252" cy="200" rx="26" ry="16" fill="#f87171" opacity=".22"/>
  `) },
  { id:"det_mole",   label:"Neo",        svg: w(`<circle cx="228" cy="212" r="4.5" fill="#2a1400"/>`) },
  { id:"det_bindi",  label:"Bindi",      svg: w(`
    <circle cx="200" cy="128" r="10" fill="#c0392b"/>
    <circle cx="200" cy="128" r="5"  fill="#e74c3c"/>
    <circle cx="200" cy="128" r="2"  fill="#c0392b"/>
  `) },
];

// ─── HAIR BACK (long/dreads — drawn before head) ──────────────────────────────
export const HAIR_BACK_OPTIONS: AvatarOption[] = [
  { id:"hb_none",    label:"Nessuno",    svg: w(``) },
  { id:"hb_long",    label:"Lunghi",     svg: w(`
    <path d="M103,155 C85,210 82,310 90,380 Q105,390 112,375 Q108,300 118,220 Q128,180 128,155Z" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="1.5"/>
    <path d="M297,155 C315,210 318,310 310,380 Q295,390 288,375 Q292,300 282,220 Q272,180 272,155Z" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="1.5"/>
  `) },
  { id:"hb_ponytail",label:"Coda",       svg: w(`
    <path d="M182,82 Q178,150 175,340 Q188,360 200,340 Q212,360 225,340 Q222,150 218,82Z" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="1.5"/>
    <rect x="184" y="75" width="32" height="14" rx="7" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="1.5"/>
    <rect x="186" y="72" width="28" height="8" rx="4" fill="#FF4A24"/>
  `) },
  { id:"hb_dreads",  label:"Dreadlock",  svg: w(`
    <path d="M108,148 C88,200 80,310 86,395 Q96,400 104,388 Q100,300 112,215 Q120,175 122,148Z" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <path d="M120,140 C105,195 99,305 106,385 Q114,395 122,382 Q118,296 128,212 Q135,172 136,140Z" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <path d="M133,136 C122,188 118,298 125,375 Q133,388 141,375 Q136,290 145,208 Q151,168 150,136Z" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <path d="M292,148 C312,200 320,310 314,395 Q304,400 296,388 Q300,300 288,215 Q280,175 278,148Z" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <path d="M280,140 C295,195 301,305 294,385 Q286,395 278,382 Q282,296 272,212 Q265,172 264,140Z" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <path d="M267,136 C278,188 282,298 275,375 Q267,388 259,375 Q264,290 255,208 Q249,168 250,136Z" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
  `) },
  { id:"hb_braids",  label:"Trecce",     svg: w(`
    <path d="M106,152 C88,210 85,320 92,398 Q104,402 110,390 Q105,308 116,226 Q124,180 124,152Z" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="1.5"/>
    <line x1="108" y1="185" x2="122" y2="187" stroke="#1a0e05" stroke-width="2.5"/>
    <line x1="107" y1="215" x2="121" y2="217" stroke="#1a0e05" stroke-width="2.5"/>
    <line x1="106" y1="245" x2="120" y2="247" stroke="#1a0e05" stroke-width="2.5"/>
    <line x1="106" y1="275" x2="119" y2="277" stroke="#1a0e05" stroke-width="2.5"/>
    <line x1="105" y1="305" x2="118" y2="307" stroke="#1a0e05" stroke-width="2.5"/>
    <path d="M294,152 C312,210 315,320 308,398 Q296,402 290,390 Q295,308 284,226 Q276,180 276,152Z" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="1.5"/>
    <line x1="292" y1="185" x2="278" y2="187" stroke="#1a0e05" stroke-width="2.5"/>
    <line x1="293" y1="215" x2="279" y2="217" stroke="#1a0e05" stroke-width="2.5"/>
    <line x1="294" y1="245" x2="280" y2="247" stroke="#1a0e05" stroke-width="2.5"/>
    <line x1="294" y1="275" x2="281" y2="277" stroke="#1a0e05" stroke-width="2.5"/>
    <line x1="295" y1="305" x2="282" y2="307" stroke="#1a0e05" stroke-width="2.5"/>
  `) },
];

// ─── HAIR FRONT ───────────────────────────────────────────────────────────────
export const HAIR_FRONT_OPTIONS: AvatarOption[] = [
  { id:"hf_short_side", label:"Corti lati",  svg: w(`
    <path d="M100,168 C100,95 144,68 200,68 C256,68 300,95 300,168 C290,128 270,106 248,100 C230,96 216,94 200,94 C184,94 170,96 152,100 C130,106 110,128 100,168Z" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <path d="M100,168 C96,148 96,120 104,100" stroke="#1a0e05" stroke-width="2" fill="HAIR_PLACEHOLDER" stroke-linecap="round"/>
    <path d="M300,168 C304,148 304,120 296,100" stroke="#1a0e05" stroke-width="2" fill="HAIR_PLACEHOLDER" stroke-linecap="round"/>
    <path d="M200,68 C216,68 228,72 228,80 Q214,75 200,75 Q186,75 172,80 C172,72 184,68 200,68Z" fill="HAIR_PLACEHOLDER"/>
  `) },
  { id:"hf_fringe",    label:"Frangia",      svg: w(`
    <path d="M100,168 C100,95 144,68 200,68 C256,68 300,95 300,168 C290,122 268,100 246,96 C228,92 214,90 200,90 C186,90 172,92 154,96 C132,100 110,122 100,168Z" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <path d="M130,116 Q165,138 200,132 Q235,138 270,116 Q248,150 200,148 Q152,150 130,116Z" fill="HAIR_PLACEHOLDER"/>
    <path d="M100,168 C96,148 96,120 104,100" stroke="#1a0e05" stroke-width="2" fill="HAIR_PLACEHOLDER"/>
    <path d="M300,168 C304,148 304,120 296,100" stroke="#1a0e05" stroke-width="2" fill="HAIR_PLACEHOLDER"/>
  `) },
  { id:"hf_curly",     label:"Ricci",        svg: w(`
    <path d="M100,170 C100,95 144,65 200,65 C256,65 300,95 300,170 C290,120 268,98 200,95 C132,98 110,120 100,170Z" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="1.5"/>
    <circle cx="130" cy="108" r="22" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <circle cx="155" cy="84"  r="24" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <circle cx="185" cy="72"  r="23" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <circle cx="215" cy="72"  r="23" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <circle cx="245" cy="84"  r="24" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <circle cx="270" cy="108" r="22" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <path d="M100,170 C96,148 96,120 108,102" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="1.5"/>
    <path d="M300,170 C304,148 304,120 292,102" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="1.5"/>
  `) },
  { id:"hf_afro",      label:"Afro",         svg: w(`
    <ellipse cx="200" cy="118" rx="115" ry="88" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <path d="M88,150 C85,120 90,95 100,80" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <path d="M312,150 C315,120 310,95 300,80" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <ellipse cx="200" cy="118" rx="115" ry="88" fill="none" stroke="#1a0e05" stroke-width="2"/>
  `) },
  { id:"hf_messy",     label:"Spettinati",   svg: w(`
    <path d="M100,165 C100,95 144,68 200,68 C256,68 300,95 300,165 C290,118 268,96 200,93 C132,96 110,118 100,165Z" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="1.5"/>
    <path d="M148,82 Q160,62 175,78" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M200,68 Q208,50 222,65" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M252,82 Q264,64 276,80" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M120,102 Q108,84 120,74" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M100,165 C96,145 97,118 106,98" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="1.5"/>
    <path d="M300,165 C304,145 303,118 294,98" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="1.5"/>
  `) },
  { id:"hf_bald",      label:"Rasato",       svg: w(`
    <path d="M100,168 C100,98 144,72 200,72 C256,72 300,98 300,168 C292,130 272,108 200,106 C128,108 108,130 100,168Z" fill="HAIR_PLACEHOLDER" opacity=".35" stroke="#1a0e05" stroke-width="1.5"/>
  `) },
  { id:"hf_wavylong",  label:"Mossi",        svg: w(`
    <path d="M100,168 C100,95 144,68 200,68 C256,68 300,95 300,168 C290,122 270,100 248,96 C228,92 200,90 200,90 C200,90 172,92 152,96 C130,100 110,122 100,168Z" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <path d="M100,168 C96,148 93,118 100,95 Q104,200 100,168Z" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <path d="M300,168 C304,148 307,118 300,95 Q296,200 300,168Z" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <path d="M100,168 C96,210 98,240 100,260" fill="none" stroke="HAIR_PLACEHOLDER" stroke-width="22" stroke-linecap="round"/>
    <path d="M300,168 C304,210 302,240 300,260" fill="none" stroke="HAIR_PLACEHOLDER" stroke-width="22" stroke-linecap="round"/>
  `) },
];

// ─── CLOTHES ──────────────────────────────────────────────────────────────────
export const CLOTHES_OPTIONS: AvatarOption[] = [
  // Hoodie
  { id:"c_hoodie_orange", label:"Felpa arancio", svg: w(`
    <path d="M55,400 Q70,300 118,275 L168,260 Q200,278 232,260 L282,275 Q330,300 345,400Z" fill="#FF4A24" stroke="#1a0e05" stroke-width="2"/>
    <path d="M118,275 Q108,250 95,255 L68,288 Q88,290 96,278" fill="#FF4A24" stroke="#1a0e05" stroke-width="2"/>
    <path d="M282,275 Q292,250 305,255 L332,288 Q312,290 304,278" fill="#FF4A24" stroke="#1a0e05" stroke-width="2"/>
    <path d="M168,260 Q184,268 200,268 Q216,268 232,260 Q220,280 200,282 Q180,280 168,260Z" fill="#cc3a1a" stroke="#1a0e05" stroke-width="1.5"/>
    <line x1="200" y1="282" x2="200" y2="400" stroke="#cc3a1a" stroke-width="4"/>
  `) },
  { id:"c_hoodie_navy",   label:"Felpa blu",    svg: w(`
    <path d="M55,400 Q70,300 118,275 L168,260 Q200,278 232,260 L282,275 Q330,300 345,400Z" fill="#1E3A5F" stroke="#1a0e05" stroke-width="2"/>
    <path d="M118,275 Q108,250 95,255 L68,288 Q88,290 96,278" fill="#1E3A5F" stroke="#1a0e05" stroke-width="2"/>
    <path d="M282,275 Q292,250 305,255 L332,288 Q312,290 304,278" fill="#1E3A5F" stroke="#1a0e05" stroke-width="2"/>
    <path d="M168,260 Q184,268 200,268 Q216,268 232,260 Q220,280 200,282 Q180,280 168,260Z" fill="#162c48" stroke="#1a0e05" stroke-width="1.5"/>
    <line x1="200" y1="282" x2="200" y2="400" stroke="#162c48" stroke-width="4"/>
  `) },
  { id:"c_hoodie_grey",   label:"Felpa grigia", svg: w(`
    <path d="M55,400 Q70,300 118,275 L168,260 Q200,278 232,260 L282,275 Q330,300 345,400Z" fill="#6b7280" stroke="#1a0e05" stroke-width="2"/>
    <path d="M118,275 Q108,250 95,255 L68,288 Q88,290 96,278" fill="#6b7280" stroke="#1a0e05" stroke-width="2"/>
    <path d="M282,275 Q292,250 305,255 L332,288 Q312,290 304,278" fill="#6b7280" stroke="#1a0e05" stroke-width="2"/>
    <path d="M168,260 Q184,268 200,268 Q216,268 232,260 Q220,280 200,282 Q180,280 168,260Z" fill="#4b5563" stroke="#1a0e05" stroke-width="1.5"/>
    <line x1="200" y1="282" x2="200" y2="400" stroke="#4b5563" stroke-width="4"/>
  `) },
  // T-shirt
  { id:"c_tshirt_white",  label:"T-shirt bianca", svg: w(`
    <path d="M65,400 Q80,308 125,284 L155,272 L155,290 Q200,308 245,290 L245,272 L275,284 Q320,308 335,400Z" fill="#f5f5f5" stroke="#1a0e05" stroke-width="2"/>
    <path d="M125,284 Q112,258 92,262 L65,294 Q88,294 96,282" fill="#f5f5f5" stroke="#1a0e05" stroke-width="2"/>
    <path d="M275,284 Q288,258 308,262 L335,294 Q312,294 304,282" fill="#f5f5f5" stroke="#1a0e05" stroke-width="2"/>
    <path d="M155,272 Q177,264 200,264 Q223,264 245,272" fill="none" stroke="#ddd" stroke-width="1.5"/>
  `) },
  { id:"c_tshirt_black",  label:"T-shirt nera",  svg: w(`
    <path d="M65,400 Q80,308 125,284 L155,272 L155,290 Q200,308 245,290 L245,272 L275,284 Q320,308 335,400Z" fill="#1f1f1f" stroke="#1a0e05" stroke-width="2"/>
    <path d="M125,284 Q112,258 92,262 L65,294 Q88,294 96,282" fill="#1f1f1f" stroke="#1a0e05" stroke-width="2"/>
    <path d="M275,284 Q288,258 308,262 L335,294 Q312,294 304,282" fill="#1f1f1f" stroke="#1a0e05" stroke-width="2"/>
  `) },
  // Collared shirt
  { id:"c_shirt_blue",    label:"Camicia blu",   svg: w(`
    <path d="M65,400 Q78,305 122,282 L155,270 L162,285 L200,298 L238,285 L245,270 L278,282 Q322,305 335,400Z" fill="#4a7fc1" stroke="#1a0e05" stroke-width="2"/>
    <path d="M122,282 Q110,256 90,260 L65,290 Q88,290 96,278" fill="#4a7fc1" stroke="#1a0e05" stroke-width="2"/>
    <path d="M278,282 Q290,256 310,260 L335,290 Q312,290 304,278" fill="#4a7fc1" stroke="#1a0e05" stroke-width="2"/>
    <path d="M155,270 L162,285 L200,298" fill="none" stroke="#1a0e05" stroke-width="2"/>
    <path d="M245,270 L238,285 L200,298" fill="none" stroke="#1a0e05" stroke-width="2"/>
    <path d="M155,270 L148,262 Q168,268 200,270 Q232,268 252,262 L245,270" fill="#3a6faa" stroke="#1a0e05" stroke-width="1.5"/>
    <circle cx="200" cy="312" r="4" fill="#3a6faa"/>
    <circle cx="200" cy="332" r="4" fill="#3a6faa"/>
    <circle cx="200" cy="352" r="4" fill="#3a6faa"/>
  `) },
  { id:"c_shirt_white",   label:"Camicia bianca",svg: w(`
    <path d="M65,400 Q78,305 122,282 L155,270 L162,285 L200,298 L238,285 L245,270 L278,282 Q322,305 335,400Z" fill="#fafafa" stroke="#1a0e05" stroke-width="2"/>
    <path d="M122,282 Q110,256 90,260 L65,290 Q88,290 96,278" fill="#fafafa" stroke="#1a0e05" stroke-width="2"/>
    <path d="M278,282 Q290,256 310,260 L335,290 Q312,290 304,278" fill="#fafafa" stroke="#1a0e05" stroke-width="2"/>
    <path d="M155,270 L162,285 L200,298" fill="none" stroke="#1a0e05" stroke-width="2"/>
    <path d="M245,270 L238,285 L200,298" fill="none" stroke="#1a0e05" stroke-width="2"/>
    <path d="M155,270 L148,262 Q168,268 200,270 Q232,268 252,262 L245,270" fill="#e8e8e8" stroke="#1a0e05" stroke-width="1.5"/>
    <circle cx="200" cy="312" r="4" fill="#ccc"/>
    <circle cx="200" cy="332" r="4" fill="#ccc"/>
  `) },
  // Denim jacket
  { id:"c_denim",         label:"Giacca denim",  svg: w(`
    <path d="M60,400 Q75,298 118,276 L200,312 L282,276 Q325,298 340,400Z" fill="#4a6fa5" stroke="#1a0e05" stroke-width="2"/>
    <path d="M118,276 Q106,250 86,254 L60,285 Q82,285 90,272" fill="#4a6fa5" stroke="#1a0e05" stroke-width="2"/>
    <path d="M282,276 Q294,250 314,254 L340,285 Q318,285 310,272" fill="#4a6fa5" stroke="#1a0e05" stroke-width="2"/>
    <path d="M155,264 L164,278 L200,292 L236,278 L245,264" fill="none" stroke="#1a0e05" stroke-width="2"/>
    <path d="M155,264 Q168,258 200,260 Q232,258 245,264" fill="#3a5a8a" stroke="#1a0e05" stroke-width="1.5"/>
    <path d="M164,278 L164,340" stroke="#3a5a8a" stroke-width="3"/>
    <path d="M236,278 L236,340" stroke="#3a5a8a" stroke-width="3"/>
    <rect x="155" y="290" width="24" height="15" rx="3" fill="#3a5a8a" stroke="#1a0e05" stroke-width="1"/>
  `) },
];

// ─── GLASSES ─────────────────────────────────────────────────────────────────
export const GLASSES_OPTIONS: AvatarOption[] = [
  { id:"gl_none",   label:"Nessuno",      svg: w(``) },
  { id:"gl_round",  label:"Rotondi",      svg: w(`
    <circle cx="162" cy="174" r="30" fill="#a8d8f0" fill-opacity=".18" stroke="#1a0e05" stroke-width="4"/>
    <circle cx="238" cy="174" r="30" fill="#a8d8f0" fill-opacity=".18" stroke="#1a0e05" stroke-width="4"/>
    <line x1="192" y1="174" x2="208" y2="174" stroke="#1a0e05" stroke-width="3.5"/>
    <line x1="108" y1="168" x2="132" y2="172" stroke="#1a0e05" stroke-width="3.5"/>
    <line x1="268" y1="172" x2="292" y2="168" stroke="#1a0e05" stroke-width="3.5"/>
  `) },
  { id:"gl_rect",   label:"Rettangolari", svg: w(`
    <rect x="132" y="158" width="60" height="36" rx="7" fill="#a8d8f0" fill-opacity=".18" stroke="#1a0e05" stroke-width="4"/>
    <rect x="208" y="158" width="60" height="36" rx="7" fill="#a8d8f0" fill-opacity=".18" stroke="#1a0e05" stroke-width="4"/>
    <line x1="192" y1="176" x2="208" y2="176" stroke="#1a0e05" stroke-width="3.5"/>
    <line x1="108" y1="168" x2="132" y2="172" stroke="#1a0e05" stroke-width="3.5"/>
    <line x1="268" y1="172" x2="292" y2="168" stroke="#1a0e05" stroke-width="3.5"/>
  `) },
  { id:"gl_sun",    label:"Da sole",      svg: w(`
    <circle cx="162" cy="174" r="30" fill="#1a0e05" fill-opacity=".88" stroke="#1a0e05" stroke-width="4"/>
    <circle cx="238" cy="174" r="30" fill="#1a0e05" fill-opacity=".88" stroke="#1a0e05" stroke-width="4"/>
    <line x1="192" y1="174" x2="208" y2="174" stroke="#1a0e05" stroke-width="3.5"/>
    <line x1="108" y1="168" x2="132" y2="172" stroke="#1a0e05" stroke-width="3.5"/>
    <line x1="268" y1="172" x2="292" y2="168" stroke="#1a0e05" stroke-width="3.5"/>
  `) },
  { id:"gl_wire",   label:"Sottili",      svg: w(`
    <circle cx="162" cy="174" r="26" fill="none" stroke="#8B6914" stroke-width="2.5"/>
    <circle cx="238" cy="174" r="26" fill="none" stroke="#8B6914" stroke-width="2.5"/>
    <line x1="188" y1="174" x2="212" y2="174" stroke="#8B6914" stroke-width="2.5"/>
    <line x1="112" y1="170" x2="136" y2="172" stroke="#8B6914" stroke-width="2.5"/>
    <line x1="264" y1="172" x2="288" y2="170" stroke="#8B6914" stroke-width="2.5"/>
  `) },
];

// ─── ACCESSORIES ─────────────────────────────────────────────────────────────
export const ACCESSORIES_OPTIONS: AvatarOption[] = [
  { id:"ac_none",       label:"Nessuno",    svg: w(``) },
  { id:"ac_headphones", label:"Cuffie",     svg: w(`
    <path d="M100,185 C100,100 144,68 200,68 C256,68 300,100 300,185" fill="none" stroke="#1a0e05" stroke-width="14" stroke-linecap="round"/>
    <rect x="86"  y="168" width="34" height="46" rx="14" fill="#FF4A24" stroke="#1a0e05" stroke-width="2.5"/>
    <rect x="280" y="168" width="34" height="46" rx="14" fill="#FF4A24" stroke="#1a0e05" stroke-width="2.5"/>
    <rect x="90"  y="174" width="26" height="34" rx="10" fill="#cc3a1a"/>
  `) },
  { id:"ac_hijab",      label:"Velo",       svg: w(`
    <path d="M100,150 C100,72 144,62 200,62 C256,62 300,72 300,150 C300,255 278,305 248,328 Q224,345 200,348 Q176,345 152,328 C122,305 100,255 100,150Z" fill="HAIR_PLACEHOLDER" stroke="#1a0e05" stroke-width="2"/>
    <path d="M100,155 C96,185 94,215 96,240 Q108,220 110,190Z" fill="HAIR_PLACEHOLDER"/>
    <path d="M300,155 C304,185 306,215 304,240 Q292,220 290,190Z" fill="HAIR_PLACEHOLDER"/>
    <path d="M100,150 Q108,165 105,185" fill="none" stroke="#1a0e05" stroke-width="1.5" opacity=".4"/>
    <path d="M300,150 Q292,165 295,185" fill="none" stroke="#1a0e05" stroke-width="1.5" opacity=".4"/>
  `) },
  { id:"ac_headband",   label:"Cerchietto", svg: w(`
    <path d="M100,138 C100,90 144,68 200,68 C256,68 300,90 300,138" fill="none" stroke="#FF4A24" stroke-width="18" stroke-linecap="round"/>
    <path d="M100,138 C100,90 144,68 200,68 C256,68 300,90 300,138" fill="none" stroke="#cc3a1a" stroke-width="3" stroke-linecap="round" stroke-dasharray="0 32 0 32"/>
  `) },
  { id:"ac_earrings",   label:"Orecchini",  svg: w(`
    <circle cx="101" cy="196" r="12" fill="none" stroke="#f59e0b" stroke-width="4"/>
    <circle cx="299" cy="196" r="12" fill="none" stroke="#f59e0b" stroke-width="4"/>
    <line x1="101" y1="208" x2="101" y2="220" stroke="#f59e0b" stroke-width="3"/>
    <line x1="299" y1="208" x2="299" y2="220" stroke="#f59e0b" stroke-width="3"/>
    <circle cx="101" cy="221" r="5" fill="#f59e0b"/>
    <circle cx="299" cy="221" r="5" fill="#f59e0b"/>
  `) },
  { id:"ac_necklace",   label:"Collana",    svg: w(`
    <path d="M155,290 Q200,318 245,290" fill="none" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="200" cy="318" r="9" fill="#f59e0b" stroke="#1a0e05" stroke-width="1.5"/>
    <circle cx="200" cy="318" r="5" fill="#fbbf24"/>
  `) },
];

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export const CATEGORIES: AvatarCategory[] = [
  { key:"background",  label:"Sfondo",        options: BG_OPTIONS },
  { key:"head",        label:"Viso",           options: HEAD_OPTIONS },
  { key:"hair_front",  label:"Capelli",        options: HAIR_FRONT_OPTIONS },
  { key:"hair_back",   label:"Cap. retro",     options: HAIR_BACK_OPTIONS, optional:true },
  { key:"eyes",        label:"Occhi",          options: EYES_OPTIONS },
  { key:"eyebrows",    label:"Sopracciglia",   options: EYEBROWS_OPTIONS },
  { key:"nose",        label:"Naso",           options: NOSE_OPTIONS },
  { key:"mouth",       label:"Bocca",          options: MOUTH_OPTIONS },
  { key:"beard",       label:"Barba",          options: BEARD_OPTIONS,  optional:true },
  { key:"details",     label:"Dettagli",       options: DETAILS_OPTIONS,optional:true },
  { key:"clothes",     label:"Vestiti",        options: CLOTHES_OPTIONS },
  { key:"glasses",     label:"Occhiali",       options: GLASSES_OPTIONS,optional:true },
  { key:"accessories", label:"Accessori",      options: ACCESSORIES_OPTIONS, optional:true },
  { key:"body",        label:"Corpo",          options: BODY_OPTIONS },
  { key:"ears",        label:"Orecchie",       options: EARS_OPTIONS },
];

// ─── DEFAULT STATE ────────────────────────────────────────────────────────────
export const DEFAULT_STATE: AvatarState = {
  bgColor:   "#FF4A24",
  skinTone:  "#E8B88A",
  hairColor: "#1A1A1A",
  layers: {
    background:  "bg_orange",
    body:        "body_1",
    clothes:     "c_hoodie_orange",
    head:        "head_oval",
    ears:        "ears_1",
    beard:       "beard_none",
    mouth:       "mouth_smile",
    nose:        "nose_button",
    eyes:        "eyes_brown",
    eyebrows:    "brow_arch",
    details:     "det_none",
    hair_back:   "hb_none",
    hair_front:  "hf_short_side",
    glasses:     "gl_none",
    accessories: "ac_none",
  },
};

export const SKIN_TONES  = ["#FDDBB4","#E8B88A","#C68B5A","#8D5524","#4A2810"];
export const HAIR_COLORS = ["#1A1A1A","#4A2E19","#8B5E3C","#D4A853","#C0C0C0","#4169E1","#8B008B","#2E8B57"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
export function applyColors(svg: string, skin: string, hair: string): string {
  return svg.replace(/SKIN_PLACEHOLDER/g, skin).replace(/HAIR_PLACEHOLDER/g, hair);
}
export function getOption(key: LayerKey, id: string | null): AvatarOption | undefined {
  if (!id) return undefined;
  return CATEGORIES.find(c => c.key === key)?.options.find(o => o.id === id);
}
export const LAYER_ORDER: LayerKey[] = [
  "background","body","clothes","head","ears",
  "beard","mouth","nose","eyes","eyebrows",
  "details","hair_back","hair_front","glasses","accessories",
];
