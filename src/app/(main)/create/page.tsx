import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreatePostForm } from "@/components/feed/CreatePostForm";
import { BackButton } from "@/components/layout/BackButton";

export const metadata: Metadata = {
  title: "Nuovo post",
  robots: { index: false, follow: false },
};

export default async function CreatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/create");

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <BackButton href="/" />
        <h1 className="text-xl font-bold" style={{ color: "var(--fg)" }}>Crea un post</h1>
      </div>
      <CreatePostForm />
    </div>
  );
}
