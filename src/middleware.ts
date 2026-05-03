import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES      = ["/login", "/register", "/forgot-password", "/verify-email"];
const PROTECTED_ROUTES = ["/create", "/notifications", "/saved", "/settings", "/match", "/messages", "/onboarding"];
const ADMIN_ROUTES     = ["/admin"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  let user: { id: string } | null = null;

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, {
                ...options,
                maxAge: (options?.maxAge as number | undefined) ?? 60 * 24 * 60 * 60,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                // NOT httpOnly — browser client must be able to read session cookies
              })
            );
          },
        },
      }
    );
    const { data } = await supabase.auth.getUser();
    user = data.user;

    // Redirect logged-in users away from auth pages
    if (user && AUTH_ROUTES.some(r => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Redirect unauthenticated to login for protected routes
    if (!user && PROTECTED_ROUTES.some(r => pathname.startsWith(r))) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Admin route guard
    if (ADMIN_ROUTES.some(r => pathname.startsWith(r))) {
      if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  } catch {
    // If Supabase is unreachable, allow the request through — pages handle errors themselves
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)",
  ],
};
