import { SESSION_COOKIE } from "@/lib/constants";
import { updateSupabaseSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { user, response } = await updateSupabaseSession(request);

  if (pathname.startsWith("/app")) {
    const demo = request.cookies.get(SESSION_COOKIE)?.value;
    if (!demo && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  return response;
}

export const config = {
  matcher: ["/app/:path*", "/login", "/signup"],
};
