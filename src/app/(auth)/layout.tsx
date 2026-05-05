import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-5" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-7 sm:mb-10">
          <a href="/" className="inline-flex flex-col items-center gap-3">
            <Image
              src="/logoNoText.svg"
              alt="me&who"
              width={200}
              height={200}
              priority
              className="w-[140px] h-[140px] sm:w-[180px] sm:h-[180px]"
              style={{ objectFit: "contain" }}
            />
          </a>
          <div className="mt-2.5 flex items-center justify-center gap-2">
            <span className="w-10 h-px" style={{ background: "var(--border)" }} />
            <span className="text-[11px] font-medium uppercase tracking-[0.15em]" style={{ color: "var(--subtle)" }}>social network</span>
            <span className="w-10 h-px" style={{ background: "var(--border)" }} />
          </div>
        </div>
        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-10" style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
          {children}
        </div>
        <p className="text-center text-xs mt-6" style={{ color: "var(--subtle)" }}>
          &copy; {new Date().getFullYear()} me<span style={{ color: "#FB7141", fontStyle: "italic", fontFamily: "var(--fa)" }}>&amp;</span>who
        </p>
      </div>
    </div>
  );
}
