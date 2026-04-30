import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AiChat } from "@/components/ai/AiChat";

export default async function AiMessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <AiChat userId={user.id} />;
}
