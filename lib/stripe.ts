import Stripe from "stripe";

let client: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (client !== undefined) return client;
  client = new Stripe(key);
  return client;
}

export function originFromRequest(request: Request) {
  const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (env) return env;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;
  return "http://localhost:3000";
}
