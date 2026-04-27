import { ImageResponse } from "@vercel/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  let title = "me&who";
  let author = "";
  let content = "Il posto dove le idee trovano persone";

  if (id) {
    const supabase = await createClient();
    const { data: post } = await supabase
      .from("posts")
      .select("title, content, author:profiles!author_id(display_name)")
      .eq("id", id)
      .single();

    if (post) {
      title = (post.title as string | null) ?? (post.content as string).slice(0, 60);
      author = (post.author as unknown as { display_name: string } | null)?.display_name ?? "";
      content = (post.content as string).slice(0, 120);
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, color: "#0ea5e9" }}>me&who</div>
        <div>
          <div style={{ fontSize: 42, fontWeight: 800, color: "#0c4a6e", lineHeight: 1.2 }}>
            {title.length > 80 ? title.slice(0, 80) + "…" : title}
          </div>
          {author && (
            <div style={{ fontSize: 22, color: "#475569", marginTop: 16 }}>{author}</div>
          )}
          <div style={{ fontSize: 18, color: "#64748b", marginTop: 12, lineHeight: 1.6 }}>
            {content.length > 120 ? content.slice(0, 120) + "…" : content}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
