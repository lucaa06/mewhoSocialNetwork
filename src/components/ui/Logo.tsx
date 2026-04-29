import Link from "next/link";
import Image from "next/image";

const CORAL = "#FF4A24";

export function LogoIcon({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.svg"
      alt="me&who"
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: "28%", display: "block" }}
      priority
    />
  );
}

export function LogoWordmark({
  href = "/",
  iconSize = 32,
  className = "text-lg",
}: {
  href?: string;
  iconSize?: number;
  className?: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-2.5 select-none group">
      <LogoIcon size={iconSize} />
      <span
        className={`font-extrabold tracking-tight ${className}`}
        style={{ color: "var(--fg)", fontFamily: "var(--fh)" }}
      >
        me
        <span style={{ fontFamily: "var(--fa)", fontStyle: "italic", fontWeight: 700, color: CORAL }}>
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
      <span style={{ fontFamily: "var(--fa)", fontStyle: "italic", fontWeight: 700, color: CORAL }}>
        &amp;
      </span>
      who
    </span>
  );
}
