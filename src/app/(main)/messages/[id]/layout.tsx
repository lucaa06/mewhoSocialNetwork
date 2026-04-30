// Chat view needs to fill the entire viewport below the navbar —
// override the main layout padding/max-width for this route only.
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 overflow-hidden" style={{ top: 56, bottom: 0, display: "flex", flexDirection: "column" }}>
      {children}
    </div>
  );
}
