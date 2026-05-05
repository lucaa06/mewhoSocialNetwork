import Link from "next/link";
import Image from "next/image";

const ORANGE = "#FB7141";
const NAVY   = "#1E386C";

export function LogoIcon({ size = 36, className, animated }: {
  size?: number;
  className?: string;
  animated?: boolean;
}) {
  return (
    <>
      <Image
        src="/logo.svg"
        alt="me&who"
        width={size}
        height={Math.round(size * 441 / 500)}
        className={[className, animated ? "logo-bounce" : ""].filter(Boolean).join(" ")}
        style={{ display: "block" }}
        priority
      />
      {animated && (
        <style>{`
          @keyframes logoBounce {
            0%   { opacity:0; transform: scale(0.7) rotate(-6deg); }
            60%  { opacity:1; transform: scale(1.08) rotate(1.5deg); }
            80%  { transform: scale(0.97) rotate(-0.5deg); }
            100% { opacity:1; transform: scale(1) rotate(0deg); }
          }
          .logo-bounce { animation: logoBounce 0.55s cubic-bezier(.34,1.3,.64,1) both; }
        `}</style>
      )}
    </>
  );
}

export function LogoWordmark({
  href = "/",
  iconSize = 32,
  className = "text-lg",
  animated = false,
}: {
  href?: string;
  iconSize?: number;
  className?: string;
  animated?: boolean;
}) {
  return (
    <Link href={href} className="flex items-center gap-2.5 select-none group">
      <LogoIcon size={iconSize} animated={animated} />
      <span
        className={`font-extrabold tracking-tight ${className}`}
        style={{ color: "var(--fg)", fontFamily: "var(--fh)" }}
      >
        me
        <span style={{ fontFamily: "var(--fa)", fontStyle: "italic", fontWeight: 700, color: ORANGE }}>
          &amp;
        </span>
        who
      </span>
    </Link>
  );
}

export function LogoText({ className }: { className?: string }) {
  return (
    <span
      className={`font-extrabold tracking-tight ${className ?? ""}`}
      style={{ color: "var(--fg)", fontFamily: "var(--fh)" }}
    >
      me
      <span style={{ fontFamily: "var(--fa)", fontStyle: "italic", fontWeight: 700, color: ORANGE }}>
        &amp;
      </span>
      who
    </span>
  );
}

export { ORANGE as BRAND_ORANGE, NAVY as BRAND_NAVY };
