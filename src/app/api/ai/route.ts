import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { createAdminClient } from "@/lib/supabase/admin";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { messages, userId } = await req.json();

  const supabase = createAdminClient();

  const [{ data: posts }, { data: users }] = await Promise.all([
    supabase
      .from("posts")
      .select("id, title, content, tags, created_at, author:profiles!author_id(username, display_name, role)")
      .is("deleted_at", null)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(150),
    supabase
      .from("profiles")
      .select("username, display_name, role, bio, city")
      .is("deleted_at", null)
      .limit(80),
  ]);

  let userProfile = null;
  if (userId) {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, role, bio, city")
      .eq("id", userId)
      .single();
    userProfile = data;
  }

  const systemPrompt = `Sei "who?", l'assistente AI di me&who — social network italiano per startupper, ricercatori e innovatori.
Parli in italiano, tono diretto e utile. Risposte concise (max 3-4 paragrafi).

${userProfile ? `Utente: ${userProfile.display_name} (${userProfile.role})${userProfile.city ? `, ${userProfile.city}` : ""}.${userProfile.bio ? ` Bio: ${userProfile.bio}` : ""}` : ""}

UTENTI (${users?.length ?? 0}):
${(users ?? []).map(u => `@${u.username} ${u.display_name} [${u.role}]${u.city ? ` ${u.city}` : ""}${u.bio ? ` — ${u.bio}` : ""}`).join("\n")}

POST (${posts?.length ?? 0}):
${(posts ?? []).map(p => {
  const a = p.author as unknown as { username: string; role: string } | null;
  const preview = (p.title ?? p.content).slice(0, 80);
  return `ID:${p.id.slice(0, 8)} @${a?.username}[${a?.role}] "${preview}"${p.tags?.length ? ` #${p.tags.join("#")}` : ""}`;
}).join("\n")}

Link post: [testo](/post/ID_COMPLETO). Link utente: [@username](/u/username). Usa l'ID completo dell'utente nei link.`;

  const stream = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
    max_tokens: 800,
    temperature: 0.5,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
