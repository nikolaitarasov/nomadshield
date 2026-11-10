import { getSupabaseBrowser } from "./supabase/client";
import type {
  AppDB,
  CalculatorInputs,
  CalculatorOutputs,
  ChecklistItem,
  Evidence,
  ItemStatus,
  Letter,
  LetterStatus,
  Migration,
  PresenceBucket,
  PresenceDay,
  Profile,
  Snapshot,
  StepKey,
} from "./types";

function sb() {
  return getSupabaseBrowser();
}

function asIsoDate(value: string | null | undefined) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function profileFromRow(row: Record<string, unknown>, email: string): Profile {
  const mailbox = (row.mailbox_address as Profile["mailboxAddress"]) || {
    path: "",
    provider: "",
    street: "",
    unit: "",
    city: "",
    state: "FL",
    zip: "",
    mailboxId: "",
    form1583: "not_started",
    webhookUrl: "",
    inboundAlias: "",
  };
  return {
    id: String(row.id),
    email,
    fullName: String(row.full_name ?? ""),
    fromState: String(row.from_state ?? "CA"),
    targetState: (row.target_state as Profile["targetState"]) || "FL",
    filingStatus: (row.filing_status as Profile["filingStatus"]) || "single",
    annualIncome: Number(row.annual_income ?? 0),
    incomeTypes: Array.isArray(row.income_types) ? (row.income_types as Profile["incomeTypes"]) : [],
    ownsPropertyInFromState: Boolean(row.owns_property_in_from_state),
    mailboxProvider: (row.mailbox_provider as Profile["mailboxProvider"]) || "",
    mailboxAddress: mailbox,
    plan: (row.plan as Profile["plan"]) || "free",
    taxYearStart: asIsoDate(row.tax_year_start as string) || `${new Date().getFullYear()}-01-01`,
    watchState: String(row.watch_state ?? ""),
    disclaimerVersion: (row.disclaimer_version as string) || null,
    conciergeWaitlist: Boolean(row.concierge_waitlist),
    billingInterval: row.billing_interval === "year" ? "year" : "month",
    createdAt: String(row.created_at ?? new Date().toISOString()),
    onboarded: Boolean(row.onboarded),
  };
}

/** Browser-writable profile columns. plan / billing_interval are server-owned (see 002_billing.sql). */
export function profileToRow(profile: Profile) {
  return {
    id: profile.id,
    full_name: profile.fullName,
    from_state: profile.fromState,
    target_state: profile.targetState,
    filing_status: profile.filingStatus,
    annual_income: profile.annualIncome,
    income_types: profile.incomeTypes,
    owns_property_in_from_state: profile.ownsPropertyInFromState,
    mailbox_provider: profile.mailboxProvider || null,
    mailbox_address: profile.mailboxAddress,
    tax_year_start: profile.taxYearStart || null,
    watch_state: profile.watchState || null,
    disclaimer_version: profile.disclaimerVersion,
    concierge_waitlist: profile.conciergeWaitlist,
    onboarded: profile.onboarded,
    created_at: profile.createdAt,
  };
}

function ignore() {
  /* network optional */
}

export async function upsertProfile(profile: Profile) {
  const client = sb();
  if (!client) return;
  const { error } = await client.from("profiles").upsert(profileToRow(profile));
  if (error) console.warn("supabase profiles", error.message);
}

export async function upsertMigration(row: Migration) {
  const client = sb();
  if (!client) return;
  const { error } = await client.from("migrations").upsert({
    id: row.id,
    user_id: row.userId,
    target_state: row.targetState,
    status: row.status,
    started_at: row.startedAt,
    completed_at: row.completedAt,
  });
  if (error) console.warn("supabase migrations", error.message);
}

export async function upsertItems(items: ChecklistItem[]) {
  const client = sb();
  if (!client || items.length === 0) return;
  const { error } = await client.from("checklist_items").upsert(
    items.map((i) => ({
      id: i.id,
      migration_id: i.migrationId,
      user_id: i.userId,
      step_key: i.stepKey,
      item_key: i.itemKey,
      label: i.label,
      status: i.status,
      metadata: i.metadata ?? {},
    })),
  );
  if (error) console.warn("supabase checklist", error.message);
}

export async function upsertItemStatus(
  userId: string,
  stepKey: StepKey,
  itemKey: string,
  status: ItemStatus,
  metadata?: Record<string, unknown>,
) {
  const client = sb();
  if (!client) return;
  const { data } = await client
    .from("checklist_items")
    .select("id, metadata")
    .eq("user_id", userId)
    .eq("step_key", stepKey)
    .eq("item_key", itemKey)
    .maybeSingle();
  if (!data?.id) return;
  const { error } = await client
    .from("checklist_items")
    .update({
      status,
      metadata: { ...((data.metadata as Record<string, unknown>) ?? {}), ...metadata },
    })
    .eq("id", data.id);
  if (error) console.warn("supabase item", error.message);
}

export async function upsertPresence(day: PresenceDay) {
  const client = sb();
  if (!client) return;
  const { error } = await client.from("presence_days").upsert(
    {
      id: day.id,
      user_id: day.userId,
      date: day.date,
      bucket: day.bucket,
      former_state: day.formerState,
      note: day.note,
      evidence_id: day.evidenceId,
    },
    { onConflict: "user_id,date" },
  );
  if (error) console.warn("supabase presence", error.message);
}

export async function deletePresence(userId: string, date: string) {
  const client = sb();
  if (!client) return;
  await client.from("presence_days").delete().eq("user_id", userId).eq("date", date);
}

export async function insertEvidence(row: Evidence) {
  const client = sb();
  if (!client) return;
  const { error } = await client.from("evidence").upsert({
    id: row.id,
    user_id: row.userId,
    storage_path: row.storagePath,
    file_name: row.fileName,
    category: row.category,
    evidence_date: row.evidenceDate,
    jurisdiction: row.jurisdiction,
    amount: row.amount,
    note: row.note,
    size: row.size,
    mime_type: row.mimeType,
    created_at: row.createdAt,
  });
  if (error) console.warn("supabase evidence", error.message);
}

export async function deleteEvidenceRow(id: string, userId: string, storagePath?: string) {
  const client = sb();
  if (!client) return;
  await client.from("evidence").delete().eq("id", id).eq("user_id", userId);
  if (storagePath) {
    await client.storage.from("evidence").remove([storagePath]).catch(ignore);
  }
}

export async function insertLetter(row: Letter) {
  const client = sb();
  if (!client) return;
  const { error } = await client.from("letters").upsert({
    id: row.id,
    user_id: row.userId,
    template_key: row.templateKey,
    recipient: row.recipient,
    subject: row.subject,
    body: row.body,
    status: row.status,
    created_at: row.createdAt,
  });
  if (error) console.warn("supabase letters", error.message);
}

export async function updateLetterStatus(id: string, status: LetterStatus) {
  const client = sb();
  if (!client) return;
  await client.from("letters").update({ status }).eq("id", id);
}

export async function insertSnapshot(row: Snapshot) {
  const client = sb();
  if (!client) return;
  await client.from("calculator_snapshots").upsert({
    id: row.id,
    user_id: row.userId,
    email: row.email,
    inputs: row.inputs,
    outputs: row.outputs,
    created_at: row.createdAt,
  });
}

export async function deleteOwnAccount() {
  const client = sb();
  if (!client) return;
  await client.rpc("delete_own_account");
}

export async function downloadEvidenceBlob(storagePath: string) {
  const client = sb();
  if (!client) return null;
  const { data, error } = await client.storage.from("evidence").download(storagePath);
  if (error) return null;
  return data;
}

export async function uploadEvidenceFile(storagePath: string, file: Blob) {
  const client = sb();
  if (!client) return false;
  const { error } = await client.storage.from("evidence").upload(storagePath, file, { upsert: true });
  return !error;
}

export type CloudWorkspace = {
  profile: Profile;
  migrations: Migration[];
  items: ChecklistItem[];
  presence: PresenceDay[];
  evidence: Evidence[];
  letters: Letter[];
  snapshots: Snapshot[];
};

export async function fetchWorkspace(userId: string, email: string): Promise<CloudWorkspace | null> {
  const client = sb();
  if (!client) return null;
  const [profileRes, migrationsRes, itemsRes, presenceRes, evidenceRes, lettersRes, snapsRes] = await Promise.all([
    client.from("profiles").select("*").eq("id", userId).maybeSingle(),
    client.from("migrations").select("*").eq("user_id", userId),
    client.from("checklist_items").select("*").eq("user_id", userId),
    client.from("presence_days").select("*").eq("user_id", userId),
    client.from("evidence").select("*").eq("user_id", userId),
    client.from("letters").select("*").eq("user_id", userId),
    client.from("calculator_snapshots").select("*").eq("user_id", userId),
  ]);

  if (!profileRes.data) return null;

  const migrations: Migration[] = (migrationsRes.data ?? []).map((m) => ({
    id: m.id,
    userId: m.user_id,
    targetState: m.target_state,
    status: m.status,
    startedAt: m.started_at,
    completedAt: m.completed_at,
  }));

  const items: ChecklistItem[] = (itemsRes.data ?? []).map((i) => ({
    id: i.id,
    migrationId: i.migration_id,
    userId: i.user_id,
    stepKey: i.step_key as StepKey,
    itemKey: i.item_key,
    label: i.label,
    status: i.status as ItemStatus,
    metadata: (i.metadata as Record<string, unknown>) ?? {},
  }));

  const presence: PresenceDay[] = (presenceRes.data ?? []).map((p) => ({
    id: p.id,
    userId: p.user_id,
    date: asIsoDate(p.date),
    bucket: p.bucket as PresenceBucket,
    formerState: p.former_state,
    note: p.note ?? "",
    evidenceId: p.evidence_id,
  }));

  const evidence: Evidence[] = (evidenceRes.data ?? []).map((e) => ({
    id: e.id,
    userId: e.user_id,
    fileName: e.file_name ?? "",
    storagePath: e.storage_path,
    category: e.category,
    evidenceDate: asIsoDate(e.evidence_date),
    jurisdiction: e.jurisdiction ?? "",
    amount: e.amount == null ? null : Number(e.amount),
    note: e.note ?? "",
    size: e.size == null ? 0 : Number(e.size),
    mimeType: e.mime_type ?? "",
    createdAt: e.created_at,
  }));

  const letters: Letter[] = (lettersRes.data ?? []).map((l) => ({
    id: l.id,
    userId: l.user_id,
    templateKey: l.template_key,
    recipient: l.recipient ?? "",
    subject: l.subject ?? "",
    body: l.body ?? "",
    status: l.status as LetterStatus,
    createdAt: l.created_at,
  }));

  const snapshots: Snapshot[] = (snapsRes.data ?? []).map((s) => ({
    id: s.id,
    userId: s.user_id,
    email: s.email ?? email,
    inputs: s.inputs as CalculatorInputs,
    outputs: s.outputs as CalculatorOutputs,
    createdAt: s.created_at,
  }));

  return {
    profile: profileFromRow(profileRes.data as Record<string, unknown>, email),
    migrations,
    items,
    presence,
    evidence,
    letters,
    snapshots,
  };
}

export function mergeWorkspace(db: AppDB, userId: string, email: string, ws: CloudWorkspace): AppDB {
  return {
    ...db,
    session: { userId, email },
    profiles: { ...db.profiles, [userId]: { ...ws.profile, email } },
    migrations: [...db.migrations.filter((m) => m.userId !== userId), ...ws.migrations],
    items: [...db.items.filter((i) => i.userId !== userId), ...ws.items],
    presence: [...db.presence.filter((p) => p.userId !== userId), ...ws.presence],
    evidence: [...db.evidence.filter((e) => e.userId !== userId), ...ws.evidence],
    letters: [...db.letters.filter((l) => l.userId !== userId), ...ws.letters],
    snapshots: [...db.snapshots.filter((s) => s.userId !== userId), ...ws.snapshots],
  };
}

export async function pushWorkspaceSlice(db: AppDB, userId: string) {
  const profile = db.profiles[userId];
  if (profile) await upsertProfile(profile);
  const migrations = db.migrations.filter((m) => m.userId === userId);
  for (const m of migrations) await upsertMigration(m);
  await upsertItems(db.items.filter((i) => i.userId === userId));
  for (const p of db.presence.filter((d) => d.userId === userId)) await upsertPresence(p);
  for (const e of db.evidence.filter((d) => d.userId === userId)) await insertEvidence(e);
  for (const l of db.letters.filter((d) => d.userId === userId)) await insertLetter(l);
}
