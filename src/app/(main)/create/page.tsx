import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreatePostForm } from "@/components/feed/CreatePostForm";

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
      <h1 className="text-xl font-bold text-black mb-4">Crea un post</h1>
      <CreatePostForm />
    </div>
  );
}
