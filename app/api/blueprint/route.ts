import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email ?? null;
  const admin = getSupabaseAdmin();
  if (admin && body) {
    const { error } = await admin.from("calculator_snapshots").insert({
      user_id: body.userId ?? null,
      email,
      inputs: body.inputs ?? {},
      outputs: body.outputs ?? {},
    });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message, email }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      demo: false,
      message: "Blueprint saved.",
      email,
    });
  }
  return NextResponse.json({
    ok: true,
    demo: true,
    message: "Blueprint stored on this device. Add Supabase to persist it in the cloud.",
    email,
  });
}
