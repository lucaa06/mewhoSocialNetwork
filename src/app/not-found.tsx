import Link from "next/link";
import { Home } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

export default function NotFound() {
  return (
    <div className="not-found-root">

      {/* ── Floating particles ─────────────────────────────────── */}
      <div className="particles" aria-hidden>
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`} />
        ))}
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="content">
        {/* Logo */}
        <div className="logo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logoNoText.svg" alt="me&who" width={180} height={180} style={{ objectFit: "contain", width: 180, height: 180 }} />
        </div>

        {/* OPS! */}
        <h1 className="ops-text">OPS!</h1>

        {/* 404 badge */}
        <div className="badge-404">404</div>

        {/* Message */}
        <p className="message">
          La pagina che cerchi è volata via…<br />
          Forse era un&apos;idea in fase di test.
        </p>

        {/* CTAs */}
        <div className="ctas">
          <Link href="/" className="btn-home">
            <Home strokeWidth={2} style={{ width: 18, height: 18 }} />
            Torna alla home
          </Link>
          <BackButton className="btn-back" />
        </div>
      </div>

      {/* ── Wave layers ────────────────────────────────────────── */}
      <div className="waves" aria-hidden>
        <svg className="wave wave-3" viewBox="0 0 1440 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,120 C180,60 360,180 540,120 C720,60 900,180 1080,120 C1260,60 1380,160 1440,130 L1440,200 L0,200 Z" />
        </svg>
        <svg className="wave wave-2" viewBox="0 0 1440 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,100 C200,40 400,160 600,100 C800,40 1000,160 1200,90 C1320,50 1400,130 1440,110 L1440,200 L0,200 Z" />
        </svg>
        <svg className="wave wave-1" viewBox="0 0 1440 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,80 C240,20 480,140 720,80 C960,20 1200,140 1440,80 L1440,200 L0,200 Z" />
        </svg>
      </div>

      <style>{`
        .not-found-root {
          min-height: 100dvh;
          background: #FFFCFA;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: var(--fh, "Outfit", system-ui, sans-serif);
          padding-bottom: 180px;
        }

        /* ── Particles ───────────────────────────────────────── */
        .particles { position: absolute; inset: 0; pointer-events: none; }

        .particle {
          position: absolute;
          border-radius: 50%;
          animation: floatUp linear infinite;
          opacity: 0;
        }

        .particle-1  { width:10px; height:10px; left:8%;   background:#FF4A24; animation-duration:7s;  animation-delay:0s;    }
        .particle-2  { width:6px;  height:6px;  left:15%;  background:#6D41FF; animation-duration:9s;  animation-delay:1.2s;  }
        .particle-3  { width:14px; height:14px; left:25%;  background:#C84FD0; animation-duration:8s;  animation-delay:0.5s;  }
        .particle-4  { width:8px;  height:8px;  left:38%;  background:#FF7252; animation-duration:11s; animation-delay:2s;    }
        .particle-5  { width:12px; height:12px; left:50%;  background:#FF4A24; animation-duration:6s;  animation-delay:0.8s;  }
        .particle-6  { width:7px;  height:7px;  left:62%;  background:#6D41FF; animation-duration:10s; animation-delay:3s;    }
        .particle-7  { width:16px; height:16px; left:72%;  background:#C84FD0; animation-duration:8.5s;animation-delay:1.5s;  }
        .particle-8  { width:9px;  height:9px;  left:83%;  background:#FF4A24; animation-duration:7.5s;animation-delay:0.3s;  }
        .particle-9  { width:5px;  height:5px;  left:91%;  background:#6D41FF; animation-duration:9.5s;animation-delay:2.5s;  }
        .particle-10 { width:11px; height:11px; left:20%;  background:#FF4A24; animation-duration:12s; animation-delay:4s;    }
        .particle-11 { width:8px;  height:8px;  left:55%;  background:#C84FD0; animation-duration:7.2s;animation-delay:1.8s;  }
        .particle-12 { width:13px; height:13px; left:78%;  background:#6D41FF; animation-duration:10.5s;animation-delay:0.9s; }

        @keyframes floatUp {
          0%   { transform: translateY(100vh) scale(0.5); opacity: 0;   }
          10%  { opacity: 0.6; }
          90%  { opacity: 0.3; }
          100% { transform: translateY(-20vh) scale(1.1); opacity: 0; }
        }

        /* ── Content ─────────────────────────────────────────── */
        .content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0;
          padding: 0 20px;
        }

        .logo-wrap {
          animation: floatBob 3s ease-in-out infinite;
          margin-bottom: 28px;
          filter: drop-shadow(0 8px 24px rgba(255,74,36,0.25));
        }

        @keyframes floatBob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }

        .ops-text {
          font-size: clamp(80px, 18vw, 160px);
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1;
          margin: 0 0 8px;
          background: linear-gradient(135deg, #FF4A24 0%, #C84FD0 50%, #6D41FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: opsGlow 2.5s ease-in-out infinite;
          font-family: var(--fh, "Outfit", system-ui, sans-serif);
        }

        @keyframes opsGlow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(255,74,36,0.30)); }
          50%       { filter: drop-shadow(0 0 40px rgba(109,65,255,0.40)); }
        }

        .badge-404 {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: white;
          background: linear-gradient(135deg, #FF4A24, #6D41FF);
          padding: 4px 14px;
          border-radius: 99px;
          margin-bottom: 24px;
          box-shadow: 0 4px 16px rgba(255,74,36,0.30);
          animation: pulseBadge 2s ease-in-out infinite;
        }

        @keyframes pulseBadge {
          0%, 100% { transform: scale(1);    box-shadow: 0 4px 16px rgba(255,74,36,0.30); }
          50%       { transform: scale(1.06); box-shadow: 0 6px 24px rgba(109,65,255,0.40); }
        }

        .message {
          font-size: clamp(15px, 2.5vw, 18px);
          color: #8A6E65;
          line-height: 1.7;
          max-width: 380px;
          margin: 0 0 36px;
        }

        .ctas {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn-home {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 22px;
          font-size: 15px;
          font-weight: 700;
          color: white;
          background: linear-gradient(135deg, #FF4A24 0%, #C84FD0 60%, #6D41FF 100%);
          text-decoration: none;
          box-shadow: 0 6px 24px rgba(255,74,36,0.35);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          font-family: var(--fh, "Outfit", system-ui, sans-serif);
        }
        .btn-home:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(255,74,36,0.45);
        }
        .btn-home:active { transform: scale(0.97); }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 14px 24px;
          border-radius: 22px;
          font-size: 14px;
          font-weight: 600;
          color: #8A6E65;
          background: transparent;
          border: 1.5px solid #EDE0D9;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
          font-family: var(--fh, "Outfit", system-ui, sans-serif);
        }
        .btn-back:hover {
          background: #FFF1ED;
          border-color: #FF4A24;
          color: #FF4A24;
        }

        /* ── Waves ───────────────────────────────────────────── */
        .waves {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 200px;
          pointer-events: none;
        }

        .wave {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 200%;
          height: 100%;
        }

        .wave-3 {
          fill: rgba(109, 65, 255, 0.12);
          animation: waveDrift 12s linear infinite;
        }
        .wave-2 {
          fill: rgba(200, 79, 208, 0.14);
          animation: waveDrift 9s linear infinite reverse;
        }
        .wave-1 {
          fill: rgba(255, 74, 36, 0.10);
          animation: waveDrift 7s linear infinite;
        }

        @keyframes waveDrift {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* dark mode */
        @media (prefers-color-scheme: dark) {
          .not-found-root { background: #0f0c0a; }
          .message { color: rgba(242,234,229,0.50); }
          .btn-back { border-color: rgba(255,255,255,0.10); color: rgba(242,234,229,0.50); }
          .btn-back:hover { background: rgba(255,74,36,0.12); border-color: #FF4A24; color: #FF4A24; }
        }
      `}</style>
    </div>
  );
}
