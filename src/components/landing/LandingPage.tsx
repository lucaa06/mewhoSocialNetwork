"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Rocket, Users2, FlaskConical, MapPin, MessageCircle,
  Zap, Globe, BadgeCheck, ArrowRight, Sparkles,
} from "lucide-react";
import { APP_VERSION_LABEL } from "@/lib/version";

const FEATURES = [
  {
    icon: MapPin,
    title: "Geolocalizzato",
    description: "Connettiti con startup, ricercatori e maker nella tua città. Le migliori collaborazioni nascono vicino a te.",
    color: "#FF4A24",
    bg: "rgba(255,74,36,0.08)",
  },
  {
    icon: Users2,
    title: "Community tematiche",
    description: "Entra in community di startup, ricerca, tech e creatività. Trova il tuo tribe e fai accadere le cose.",
    color: "#6D41FF",
    bg: "rgba(109,65,255,0.08)",
  },
  {
    icon: FlaskConical,
    title: "Ricerca & Innovazione",
    description: "Uno spazio pensato per ricercatori e innovatori. Condividi scoperte, trova co-founder, crea impatto.",
    color: "#C84FD0",
    bg: "rgba(200,79,208,0.08)",
  },
  {
    icon: MessageCircle,
    title: "Conversazioni reali",
    description: "Messaggi diretti, commenti profondi. Zero algoritmi tossici, zero pubblicità. Solo persone.",
    color: "#0EA5E9",
    bg: "rgba(14,165,233,0.08)",
  },
];

const ROLES = [
  { icon: Rocket,       label: "Startupper",  color: "#FF4A24", desc: "Costruisci il futuro" },
  { icon: FlaskConical, label: "Ricercatore",  color: "#6D41FF", desc: "Esplora l'ignoto"    },
  { icon: Zap,          label: "Maker",        color: "#D97706", desc: "Crea qualcosa di bello" },
  { icon: Globe,        label: "Innovatore",   color: "#16A34A", desc: "Cambia il mondo"      },
];

function useInView(ref: React.RefObject<Element | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setInView(true); }, { threshold: 0.15 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

function FeatureCard({ icon: Icon, title, description, color, bg, delay }: {
  icon: typeof MapPin; title: string; description: string;
  color: string; bg: string; delay: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref as React.RefObject<Element | null>);

  return (
    <div
      ref={ref}
      className="rounded-3xl p-6 transition-all duration-700"
      style={{
        background: "white",
        border: "1.5px solid rgba(0,0,0,0.06)",
        boxShadow: "0 2px 24px rgba(0,0,0,0.04)",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: bg }}>
        <Icon className="w-6 h-6" style={{ color }} strokeWidth={1.8} />
      </div>
      <h3 className="text-base font-bold mb-2" style={{ color: "#0a0a0a", fontFamily: "var(--fh)" }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "#666" }}>{description}</p>
    </div>
  );
}

export function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const featuresRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[200] overflow-y-auto"
      style={{ background: "#fafafa", color: "#0a0a0a" }}
    >
      {/* Nav */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-8 h-14"
        style={{ background: "rgba(250,250,250,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logoNoText.svg" alt="me&who" className="h-8 w-auto" />
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(109,65,255,0.10)", color: "#6D41FF" }}>
            {APP_VERSION_LABEL}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login"
            className="hidden sm:block text-sm font-medium px-4 py-2 rounded-xl transition-colors hover:bg-black/5"
            style={{ color: "#555" }}>
            Accedi
          </Link>
          <Link href="/register"
            className="flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg,#FF4A24,#C84FD0)", boxShadow: "0 4px 16px rgba(255,74,36,0.30)" }}>
            <Sparkles className="w-3.5 h-3.5" />
            Unisciti
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-5 sm:px-8 pt-16 pb-20 text-center">
        {/* Animated gradient orbs */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(255,74,36,0.12) 0%, rgba(200,79,208,0.08) 40%, transparent 70%)",
            filter: "blur(60px)",
            animation: "slowPulse 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(109,65,255,0.10) 0%, transparent 70%)",
            filter: "blur(50px)",
            animation: "slowPulse 8s ease-in-out infinite reverse",
          }}
        />

        <div
          className="relative z-10 transition-all duration-700"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(20px)" }}
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: "rgba(255,74,36,0.08)", border: "1px solid rgba(255,74,36,0.15)" }}>
            <MapPin className="w-3.5 h-3.5" style={{ color: "#FF4A24" }} />
            <span className="text-xs font-bold" style={{ color: "#FF4A24", letterSpacing: "0.05em" }}>
              IL SOCIAL PER CHI COSTRUISCE IL FUTURO
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl font-black leading-tight mb-5 max-w-2xl mx-auto"
            style={{ color: "#0a0a0a", fontFamily: "var(--fh)", letterSpacing: "-1.5px" }}
          >
            Incontra chi
            <span style={{ background: "linear-gradient(135deg,#FF4A24,#C84FD0,#6D41FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {" "}trasforma{" "}
            </span>
            le idee in realtà
          </h1>

          <p className="text-base sm:text-lg leading-relaxed max-w-lg mx-auto mb-8" style={{ color: "#666" }}>
            me&who è il social network per startupper, ricercatori e maker.
            Connettiti con le persone giuste nella tua città e costruisci qualcosa di straordinario.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link
              href="/register"
              className="flex items-center gap-2 text-base font-bold px-8 py-3.5 rounded-2xl text-white transition-all hover:scale-[1.03] active:scale-[.98]"
              style={{ background: "linear-gradient(135deg,#FF4A24,#C84FD0)", boxShadow: "0 6px 24px rgba(255,74,36,0.35)" }}
            >
              Inizia gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 text-base font-semibold px-8 py-3.5 rounded-2xl transition-all hover:bg-black/5"
              style={{ color: "#333", border: "1.5px solid rgba(0,0,0,0.10)" }}
            >
              Accedi
            </Link>
          </div>

          {/* Role chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {ROLES.map(({ icon: Icon, label, color, desc }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                style={{ background: "white", border: "1.5px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
              >
                <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}12` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} strokeWidth={1.8} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-none mb-0.5" style={{ color: "#0a0a0a" }}>{label}</p>
                  <p className="text-[10px] leading-none" style={{ color: "#999" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} className="px-5 sm:px-8 pb-20">
        <div className="max-w-3xl mx-auto">
          <div
            className="text-center mb-10 transition-all duration-700"
            style={{ opacity: mounted ? 1 : 0 }}
          >
            <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: "#0a0a0a", fontFamily: "var(--fh)", letterSpacing: "-0.8px" }}>
              Tutto quello che ti serve
            </h2>
            <p className="text-sm" style={{ color: "#888" }}>Progettato per chi ha idee e vuole realizzarle.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="px-5 sm:px-8 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl p-8 text-center"
            style={{ background: "linear-gradient(135deg,rgba(255,74,36,0.06),rgba(200,79,208,0.06),rgba(109,65,255,0.06))", border: "1.5px solid rgba(109,65,255,0.12)" }}>
            <BadgeCheck className="w-10 h-10 mx-auto mb-4" style={{ color: "#6D41FF" }} strokeWidth={1.5} />
            <h3 className="text-xl font-black mb-2" style={{ color: "#0a0a0a", fontFamily: "var(--fh)" }}>
              Solo persone reali
            </h3>
            <p className="text-sm leading-relaxed max-w-sm mx-auto mb-6" style={{ color: "#666" }}>
              Profili verificati, nessun bot. Una comunità di qualità dove ogni connessione ha valore.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl text-white transition-all hover:scale-[1.03]"
              style={{ background: "linear-gradient(135deg,#6D41FF,#C84FD0)", boxShadow: "0 4px 16px rgba(109,65,255,0.30)" }}
            >
              <Sparkles className="w-4 h-4" />
              Crea il tuo profilo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 sm:px-8 py-8 text-center border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logoNoText.svg" alt="me&who" className="h-7 w-auto opacity-40" />
        </div>
        <p className="text-xs" style={{ color: "#bbb" }}>
          me&who · {APP_VERSION_LABEL}
        </p>
      </footer>

      <style>{`
        @keyframes slowPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
