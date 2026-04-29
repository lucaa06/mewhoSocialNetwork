"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema, type PostInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { celebrate } from "@/lib/celebrate";

export function CreatePostForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: { visibility: "public", tags: [] },
  });
  const content = watch("content", "");

  async function onSubmit(data: PostInput) {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { error } = await supabase.from("posts").insert({ author_id: user.id, ...data, tags: data.tags ?? [] });
    setLoading(false);
    if (error) { toast.error("Errore durante la pubblicazione"); return; }
    toast.success("Post pubblicato!"); celebrate();
    router.back();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border p-4 sm:p-6 space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div>
        <input {...register("title")} placeholder="Titolo (opzionale)" className="input-base" />
      </div>
      <div>
        <textarea
          {...register("content")}
          placeholder="Condividi un'idea, un progetto, una domanda..."
          rows={6}
          className="input-base resize-none"
        />
        <div className="flex justify-between mt-1">
          {errors.content && <span className="text-xs" style={{ color: "var(--muted)" }}>{errors.content.message}</span>}
          <span className="text-xs ml-auto" style={{ color: "var(--subtle)" }}>{content.length}/5000</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <select
          {...register("visibility")}
          className="px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors flex-1 sm:flex-none"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}
        >
          <option value="public">Pubblico</option>
          <option value="followers">Solo follower</option>
        </select>
        <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5 flex-1 sm:flex-none">
          {loading ? "Pubblicando..." : "Pubblica"}
        </button>
      </div>
    </form>
  );
}
