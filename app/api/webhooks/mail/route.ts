import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      status: "accepted",
      demo: true,
      message:
        "Connect (preview) — inbound mail webhooks are not persisted server-side in this MVP. Use “Simulate inbound mail” on the Address step.",
    },
    { status: 202 },
  );
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    waiting: true,
    message: "Inbound webhook endpoint. POST a provider payload to simulate production.",
  });
}
