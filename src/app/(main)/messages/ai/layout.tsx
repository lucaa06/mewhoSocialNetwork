export default function AiChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 overflow-hidden" style={{ top: 56, bottom: 0, display: "flex", flexDirection: "column" }}>
      {children}
    </div>
  );
}
