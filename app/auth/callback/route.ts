import { SESSION_COOKIE } from "@/lib/constants";
import { getSupabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/app";
  const supabase = await getSupabaseServer();
  if (code && supabase) {
    await supabase.auth.exchangeCodeForSession(code);
  }
  const res = NextResponse.redirect(new URL(next, url.origin));
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      res.cookies.set(SESSION_COOKIE, user.id, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    }
  }
  return res;
}
