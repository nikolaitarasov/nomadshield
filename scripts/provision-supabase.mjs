/**
 * Apply schema, Auth URLs, storage, and the demo user to the linked Supabase project.
 * Usage: node scripts/provision-supabase.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REF = "rmngqyzwcmfeptyfigjp";
const DEMO_ID = "11111111-1111-4111-8111-111111111111";
const MIGRATION_ID = "22222222-2222-4222-8222-222222222222";

function loadEnv() {
  const path = join(ROOT, ".env.local");
  if (!existsSync(path)) throw new Error("Missing .env.local");
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    out[t.slice(0, i)] = t.slice(i + 1);
  }
  return out;
}

function managementToken() {
  const raw = execFileSync(
    "security",
    ["find-generic-password", "-s", "Supabase CLI", "-a", "access-token", "-w"],
    { encoding: "utf8" },
  ).trim();
  const marker = "go-keyring-base64:";
  if (!raw.startsWith(marker)) return raw;
  return Buffer.from(raw.slice(marker.length), "base64").toString("utf8");
}

async function sql(token, query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`SQL ${res.status}: ${text.slice(0, 800)}`);
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function patchAuth(token, body) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Auth config ${res.status}: ${text.slice(0, 800)}`);
  return JSON.parse(text);
}

async function admin(env, path, { method = "GET", body } = {}) {
  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) throw new Error(`${method} ${path} ${res.status}: ${text.slice(0, 800)}`);
  return data;
}

const FL_ITEMS = [
  ["address", "choose_path", "Choose a mailbox path: connect existing, enter manually, or join the partner waitlist", "done"],
  ["address", "enter_address", "Enter the Florida street, unit/PMB, city, and ZIP exactly as printed", "done"],
  ["address", "mailbox_id", "Record mailbox ID / PMB number", "done"],
  ["address", "form_1583", "USPS Form 1583 (CMRA authorization) — not started, pending notary, or complete", "done"],
  ["address", "webhook", "Optional: inbound webhook / email alias for scanned mail (Connect preview)", "todo"],
  ["presence", "plan_trip", "Plan a Florida trip (dates + city near a driver-license office)", "done"],
  ["presence", "lodging", "Book hotel / short-term rental nights and keep the confirmation", "done"],
  ["presence", "mark_nights", "Mark Florida nights on the presence calendar", "todo"],
  ["presence", "dl_window", "Pick a DL appointment window while you are in-state", "todo"],
  ["presence", "travel_docs", "Save boarding passes, fuel, or rental-car receipts", "todo"],
  ["dl", "read_reqs", "Read official new-resident driver-license requirements", "done"],
  ["dl", "gather_docs", "Gather identity documents (passport or birth certificate, SSN, proof of address)", "done"],
  ["dl", "appointment", "Set an appointment date (we store the date — we do not book the DMV)", "todo"],
  ["dl", "upload_dl", "After the visit: upload the new license image to the vault", "todo"],
  ["dl", "vehicle", "Vehicle title / registration in the new state", "todo"],
  ["dl", "insurance", "Update auto insurance address (if you have a vehicle)", "todo"],
  ["voter_bank", "register_vote", "Register to vote in Florida", "todo"],
  ["voter_bank", "cancel_vote", "Generate and send a voter-registration cancellation to the former state", "done"],
  ["voter_bank", "primary_bank", "Update your primary bank’s address of record", "todo"],
  ["voter_bank", "other_banks", "Update at least two more institutions (brokerage, credit cards, credit union)", "todo"],
  ["voter_bank", "irs8822", "File IRS Form 8822 change of address (federal — does not change domicile by itself)", "todo"],
  ["voter_bank", "usps_ncoa", "Optional: USPS change of address / NCOA", "todo"],
  ["voter_bank", "w2_hr", "W-2: talk to HR / payroll about state withholding and a work-location change", "todo"],
  ["letters", "select_ties", "Select the ties you still have in the former state", "todo"],
  ["letters", "generate", "Generate downloadable letters with your name, address, and dates", "todo"],
  ["letters", "send", "Send the letters and toggle each to sent", "todo"],
  ["letters", "proof", "Optional: upload send receipts (email PDF, certified-mail stub) to the vault", "todo"],
  ["declaration", "pick_county", "Choose the Florida county of your mailing address", "todo"],
  ["declaration", "packet", "Download the ready-to-sign packet (cover sheet + field summary + filing checklist)", "todo"],
  ["declaration", "file_clerk", "File with the county clerk (you or your CPA — not NomadShield)", "todo"],
  ["declaration", "upload_stamped", "Upload the stamped copy to the evidence vault", "todo"],
];

const env = loadEnv();
const token = managementToken();
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

console.log("1. Applying schema…");
// Every migration is idempotent; apply all of them in filename order.
for (const file of readdirSync(join(ROOT, "supabase/migrations")).filter((f) => f.endsWith(".sql")).sort()) {
  console.log(`   ${file}`);
  await sql(token, readFileSync(join(ROOT, "supabase/migrations", file), "utf8"));
}
const tables = await sql(
  token,
  "select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by 1",
);
console.log(
  "   tables:",
  tables.map((t) => t.table_name).join(", "),
);

console.log("2. Configuring Auth URLs…");
const auth = await patchAuth(token, {
  site_url: "https://nomadshield.io",
  uri_allow_list:
    "https://nomadshield.io,https://nomadshield.io/**,http://localhost:3000,http://localhost:3000/**,https://*.onrender.com,https://*.onrender.com/**",
  mailer_autoconfirm: true,
  disable_signup: false,
  external_email_enabled: true,
  password_min_length: 8,
  mailer_secure_email_change_enabled: true,
});
console.log("   site_url=", auth.site_url, "autoconfirm=", auth.mailer_autoconfirm);

console.log("3. Ensuring evidence bucket…");
const buckets = await admin(env, "/storage/v1/bucket");
const names = (Array.isArray(buckets) ? buckets : []).map((b) => b.id || b.name);
if (!names.includes("evidence")) {
  await admin(env, "/storage/v1/bucket", {
    method: "POST",
    body: { id: "evidence", name: "evidence", public: false, file_size_limit: 52428800 },
  });
  console.log("   created evidence bucket");
} else {
  console.log("   evidence bucket exists");
}

console.log("4. Creating demo user…");
let userId = DEMO_ID;
try {
  const created = await admin(env, "/auth/v1/admin/users", {
    method: "POST",
    body: {
      id: DEMO_ID,
      email: "demo@nomadshield.app",
      password: "Demo1234!",
      email_confirm: true,
      user_metadata: { full_name: "Alex Rivera" },
    },
  });
  userId = created.id || created.user?.id || DEMO_ID;
  console.log("   created", userId);
} catch (err) {
  const msg = String(err.message || err);
  if (/already|registered|exists/i.test(msg)) {
    const list = await admin(env, "/auth/v1/admin/users?page=1&per_page=50");
    const found = (list.users || []).find((u) => u.email === "demo@nomadshield.app");
    if (!found) throw err;
    userId = found.id;
    await admin(env, `/auth/v1/admin/users/${userId}`, {
      method: "PUT",
      body: { password: "Demo1234!", email_confirm: true },
    });
    console.log("   existed, password reset", userId);
  } else {
    throw err;
  }
}

console.log("5. Seeding demo workspace…");
const seedSql = `
insert into public.profiles (
  id, full_name, from_state, target_state, filing_status, annual_income, income_types,
  owns_property_in_from_state, mailbox_provider, mailbox_address, plan, tax_year_start,
  watch_state, disclaimer_version, concierge_waitlist, billing_interval, onboarded
) values (
  '${userId}',
  'Alex Rivera',
  'CA',
  'FL',
  'single',
  180000,
  array['w2']::text[],
  false,
  'anytime_mailbox',
  '{"path":"connect","provider":"anytime_mailbox","street":"1001 Brickell Bay Dr","unit":"PMB 220","city":"Miami","state":"FL","zip":"33131","mailboxId":"AM-88421","form1583":"complete","webhookUrl":"","inboundAlias":"mail+11111111@inbound.nomadshield.app"}'::jsonb,
  'shield',
  '2026-01-01',
  'NY',
  '2026-03-01',
  false,
  'month',
  true
)
on conflict (id) do update set
  full_name = excluded.full_name,
  from_state = excluded.from_state,
  target_state = excluded.target_state,
  annual_income = excluded.annual_income,
  plan = excluded.plan,
  mailbox_address = excluded.mailbox_address,
  onboarded = true;

insert into public.migrations (id, user_id, target_state, status, started_at)
values ('${MIGRATION_ID}', '${userId}', 'FL', 'active', '2026-02-18T15:04:00Z')
on conflict (id) do nothing;

insert into public.presence_days (user_id, date, bucket, former_state, note)
select '${userId}', d::date, 'former', 'CA', 'Still in CA'
from generate_series('2026-01-01'::date, '2026-01-20'::date, '1 day') d
on conflict (user_id, date) do nothing;

insert into public.presence_days (user_id, date, bucket, former_state, note)
select '${userId}', d::date, 'former', 'CA', 'Still in CA'
from generate_series('2026-02-01'::date, '2026-02-10'::date, '1 day') d
on conflict (user_id, date) do nothing;

insert into public.presence_days (user_id, date, bucket, former_state, note)
select '${userId}', d::date, 'former', 'CA', 'Still in CA'
from generate_series('2026-03-15'::date, '2026-03-25'::date, '1 day') d
on conflict (user_id, date) do nothing;

insert into public.presence_days (user_id, date, bucket, former_state, note)
select '${userId}', d::date, 'target', null, 'Florida trip'
from generate_series('2026-04-10'::date, '2026-04-16'::date, '1 day') d
on conflict (user_id, date) do nothing;

insert into public.presence_days (user_id, date, bucket, former_state, note)
select '${userId}', d::date, 'target', null, 'Florida trip'
from generate_series('2026-06-01'::date, '2026-06-07'::date, '1 day') d
on conflict (user_id, date) do nothing;

insert into public.presence_days (user_id, date, bucket, former_state, note)
select '${userId}', d::date, 'other', null, 'Travel / other'
from generate_series('2026-05-20'::date, '2026-05-24'::date, '1 day') d
on conflict (user_id, date) do nothing;
`;
await sql(token, seedSql);

const itemRows = FL_ITEMS.map(
  ([step, key, label, status], i) =>
    `('${crypto.randomUUID()}','${MIGRATION_ID}','${userId}','${step}','${key}',$$${label}$$,'${status}','{}'::jsonb)`,
).join(",\n");
await sql(
  token,
  `insert into public.checklist_items (id, migration_id, user_id, step_key, item_key, label, status, metadata)
   values ${itemRows}
   on conflict (migration_id, step_key, item_key) do update set status = excluded.status, label = excluded.label;`,
);

await sql(
  token,
  `insert into public.letters (user_id, template_key, recipient, subject, body, status, created_at)
   select '${userId}', 'voter_cancel', 'County board of elections / registrar', 'Voter cancellation', $letter$Alex Rivera
1001 Brickell Bay Dr, PMB 220
Miami, FL 33131
demo@nomadshield.app

March 4, 2026

County board of elections / registrar

Re: Cancellation of voter registration — California

I, Alex Rivera, request that you cancel my voter registration in California. I have changed my domicile to Florida and will register to vote there.

This letter is a records notice. It is not a legal opinion.

Sincerely,
Alex Rivera
$letter$, 'sent', '2026-03-04T14:22:00Z'
   where not exists (
     select 1 from public.letters where user_id = '${userId}' and template_key = 'voter_cancel'
   );`,
);

const counts = await sql(
  token,
  `select
     (select count(*) from public.profiles) as profiles,
     (select count(*) from public.migrations) as migrations,
     (select count(*) from public.checklist_items) as items,
     (select count(*) from public.presence_days) as nights,
     (select count(*) from public.letters) as letters,
     (select count(*) from storage.buckets where id='evidence') as buckets;`,
);
console.log("6. Counts", counts[0]);
console.log("Done. Demo login: demo@nomadshield.app / Demo1234!");
