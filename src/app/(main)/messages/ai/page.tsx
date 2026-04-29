import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AiChat } from "@/components/ai/AiChat";
import { BackButton } from "@/components/layout/BackButton";

export default async function AiMessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return (
    <div className="space-y-4">
      <BackButton href="/messages" label="Messaggi" />
      <AiChat userId={user.id} embedded />
    </div>
  );
}
