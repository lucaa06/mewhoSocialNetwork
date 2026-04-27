"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema, type PostInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

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
    const { data: post, error } = await supabase.from("posts").insert({ author_id: user.id, ...data, tags: data.tags ?? [] }).select("id").single();
    setLoading(false);
    if (error) { toast.error("Errore durante la pubblicazione"); return; }
    toast.success("Post pubblicato!");
    router.push(`/post/${post.id}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-black/6 p-6 space-y-4">
      <div>
        <input {...register("title")} placeholder="Titolo (opzionale)" className="input-base" />
      </div>
      <div>
        <textarea {...register("content")} placeholder="Condividi un'idea, un progetto, una domanda..." rows={6}
          className="input-base resize-none"
        />
        <div className="flex justify-between mt-1">
          {errors.content && <span className="text-xs text-black/40">{errors.content.message}</span>}
          <span className="text-xs text-black/25 ml-auto">{content.length}/5000</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <select {...register("visibility")} className="px-3 py-2 bg-black/4 border border-black/8 rounded-xl text-sm text-black/60 focus:outline-none focus:border-black/25 transition-colors">
          <option value="public">Pubblico</option>
          <option value="followers">Solo follower</option>
        </select>
        <button type="submit" disabled={loading}
          className="btn-primary px-6 py-2"
        >
          {loading ? "Pubblicando..." : "Pubblica"}
        </button>
      </div>
    </form>
  );
}
