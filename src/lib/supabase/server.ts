import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 60 days in seconds — matches Instagram-like "stay logged in"
const SESSION_MAX_AGE = 60 * 24 * 60 * 60;

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                maxAge: SESSION_MAX_AGE,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                // NOT httpOnly — browser client needs to read session cookies
              })
            );
          } catch {
            // Called from Server Component — cookies set in middleware instead
          }
        },
      },
    }
  );
}
