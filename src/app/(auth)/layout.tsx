export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-4 sm:p-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-7 sm:mb-10">
          <a href="/" className="inline-block">
            <span className="text-[28px] sm:text-[34px] font-bold text-black tracking-tight select-none">
              me<span style={{ color: "var(--accent)", fontStyle: "italic" }}>&amp;</span>who
            </span>
          </a>
          <div className="mt-1.5 flex items-center justify-center gap-2">
            <span className="w-10 h-px bg-black/10" />
            <span className="text-[11px] font-medium text-black/25 uppercase tracking-[0.15em]">social network</span>
            <span className="w-10 h-px bg-black/10" />
          </div>
        </div>
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-black/6 shadow-[0_2px_24px_rgba(0,0,0,0.06)] p-6 sm:p-10">
          {children}
        </div>
        <p className="text-center text-xs text-black/25 mt-6">
          &copy; {new Date().getFullYear()} me<span style={{ color: "var(--accent)", fontStyle: "italic" }}>&amp;</span>who
        </p>
      </div>
    </div>
  );
}
