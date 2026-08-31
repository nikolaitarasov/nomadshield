import { NextResponse } from "next/server";

/** Email job stub — in-app banners are the live reminder surface. */
export async function POST() {
  return NextResponse.json({
    ok: true,
    sent: 0,
    demo: true,
    message: "Reminder worker is a no-op in this MVP. The dashboard banner is the live surface.",
  });
}
