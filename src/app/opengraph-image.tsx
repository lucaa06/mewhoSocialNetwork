import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "me&who — Connetti. Collabora. Innova.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f5f3",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {/* Red square icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 160,
            height: 160,
            background: "linear-gradient(135deg,#FB7141,#1E386C)",
            borderRadius: 36,
            marginBottom: 44,
            boxShadow: "0 24px 64px rgba(221,65,50,0.35)",
          }}
        >
          <span
            style={{
              fontSize: 112,
              fontWeight: 900,
              color: "white",
              lineHeight: 1,
              marginTop: 10,
            }}
          >
            &amp;
          </span>
        </div>

        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: 88,
            fontWeight: 900,
            letterSpacing: "-3px",
          }}
        >
          <span style={{ color: "#0a0a0a" }}>me</span>
          <span style={{ color: "#FB7141", fontSize: 96 }}>&amp;</span>
          <span style={{ color: "#0a0a0a" }}>who</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginTop: 28,
            fontSize: 26,
            color: "#9ca3af",
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          <span>Connetti</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#FB7141" }} />
          <span>Collabora</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#FB7141" }} />
          <span>Innova</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
