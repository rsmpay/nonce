import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/chat";
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user profile exists
      const { data: profile } = await supabase
        .from("users")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!profile) {
        // Redirect to profile setup
        return NextResponse.redirect(`${origin}/profile/setup`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error, redirect to login
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
