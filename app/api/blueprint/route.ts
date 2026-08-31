import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  return NextResponse.json({
    ok: true,
    demo: true,
    message:
      "Blueprint accepted. In production this would persist to calculator_snapshots and send a magic link. The client already stored a copy locally.",
    email: body?.email ?? null,
  });
}
