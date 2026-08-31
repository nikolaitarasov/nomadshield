import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_USER_ID, DISCLAIMER_VERSION } from "./constants";
import { letterBody } from "./letters";
import { getPlaybook } from "./playbooks";
import type {
  AppDB,
  ChecklistItem,
  Evidence,
  Letter,
  PresenceDay,
  Profile,
} from "./types";
import { uid } from "./utils";

const MIGRATION_ID = "22222222-2222-4222-8222-222222222222";

function iso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function range(start: string, end: string, bucket: PresenceDay["bucket"], formerState: string | null = null): PresenceDay[] {
  const out: PresenceDay[] = [];
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    out.push({
      id: uid(),
      userId: DEMO_USER_ID,
      date: iso(d),
      bucket,
      formerState,
      note: bucket === "target" ? "Florida trip" : bucket === "former" ? "Still in CA" : "Travel / other",
      evidenceId: null,
    });
  }
  return out;
}

export function emptyDB(): AppDB {
  return {
    session: null,
    passwordByUser: {},
    profiles: {},
    migrations: [],
    items: [],
    presence: [],
    evidence: [],
    letters: [],
    snapshots: [],
    inbound: [],
  };
}

export function demoProfile(): Profile {
  return {
    id: DEMO_USER_ID,
    email: DEMO_EMAIL,
    fullName: "Alex Rivera",
    fromState: "CA",
    targetState: "FL",
    filingStatus: "single",
    annualIncome: 180000,
    incomeTypes: ["w2"],
    ownsPropertyInFromState: false,
    mailboxProvider: "anytime_mailbox",
    mailboxAddress: {
      path: "connect",
      provider: "anytime_mailbox",
      street: "1001 Brickell Bay Dr",
      unit: "PMB 220",
      city: "Miami",
      state: "FL",
      zip: "33131",
      mailboxId: "AM-88421",
      form1583: "complete",
      webhookUrl: "",
      inboundAlias: `mail+${DEMO_USER_ID.slice(0, 8)}@inbound.nomadshield.app`,
    },
    plan: "shield",
    taxYearStart: "2026-01-01",
    watchState: "NY",
    disclaimerVersion: DISCLAIMER_VERSION,
    conciergeWaitlist: false,
    billingInterval: "month",
    createdAt: "2026-02-18T15:04:00.000Z",
    onboarded: true,
  };
}

function seedItems(): ChecklistItem[] {
  const playbook = getPlaybook("FL");
  const done: Record<string, string[]> = {
    address: ["choose_path", "enter_address", "mailbox_id", "form_1583"],
    presence: ["plan_trip", "lodging"],
    dl: ["read_reqs", "gather_docs"],
    voter_bank: ["cancel_vote"],
  };
  const items: ChecklistItem[] = [];
  for (const step of playbook.steps) {
    for (const item of step.items) {
      const isDone = done[step.key]?.includes(item.key);
      items.push({
        id: uid(),
        migrationId: MIGRATION_ID,
        userId: DEMO_USER_ID,
        stepKey: step.key,
        itemKey: item.key,
        label: item.label,
        status: isDone ? "done" : "todo",
        metadata:
          step.key === "address"
            ? { county: "miami-dade" }
            : step.key === "dl" && item.key === "appointment"
              ? {}
              : {},
      });
    }
  }
  return items;
}

function seedPresence(): PresenceDay[] {
  // 41 CA + 14 FL + 5 other = 60
  return [
    ...range("2026-01-01", "2026-01-20", "former", "CA"), // 20
    ...range("2026-02-01", "2026-02-10", "former", "CA"), // 10
    ...range("2026-03-15", "2026-03-25", "former", "CA"), // 11 = 41
    ...range("2026-04-10", "2026-04-16", "target"), // 7
    ...range("2026-06-01", "2026-06-07", "target"), // 7 = 14
    ...range("2026-05-20", "2026-05-24", "other"), // 5
  ];
}

function seedEvidence(): Evidence[] {
  const rows: Omit<Evidence, "id">[] = [
    {
      userId: DEMO_USER_ID,
      fileName: "hotel-miami-april.pdf",
      storagePath: `${DEMO_USER_ID}/hotel-miami-april.pdf`,
      category: "lodging",
      evidenceDate: "2026-04-10",
      jurisdiction: "FL",
      amount: 1284,
      note: "7 nights, Brickell — DL appointment trip",
      size: 184320,
      mimeType: "application/pdf",
      createdAt: "2026-04-17T18:00:00.000Z",
    },
    {
      userId: DEMO_USER_ID,
      fileName: "boarding-pass-lax-mia.pdf",
      storagePath: `${DEMO_USER_ID}/boarding-pass-lax-mia.pdf`,
      category: "travel",
      evidenceDate: "2026-04-10",
      jurisdiction: "CA",
      amount: 312,
      note: "LAX → MIA",
      size: 90210,
      mimeType: "application/pdf",
      createdAt: "2026-04-10T09:00:00.000Z",
    },
    {
      userId: DEMO_USER_ID,
      fileName: "flhsmv-appointment.txt",
      storagePath: `${DEMO_USER_ID}/flhsmv-appointment.txt`,
      category: "dl",
      evidenceDate: "2026-04-14",
      jurisdiction: "FL",
      amount: null,
      note: "Miami-Dade office window (link + date, not a booking API)",
      size: 1024,
      mimeType: "text/plain",
      createdAt: "2026-03-22T12:00:00.000Z",
    },
    {
      userId: DEMO_USER_ID,
      fileName: "anytime-mailbox-1583.pdf",
      storagePath: `${DEMO_USER_ID}/anytime-mailbox-1583.pdf`,
      category: "mail",
      evidenceDate: "2026-02-20",
      jurisdiction: "FL",
      amount: 0,
      note: "Form 1583 complete",
      size: 220144,
      mimeType: "application/pdf",
      createdAt: "2026-02-20T16:12:00.000Z",
    },
    {
      userId: DEMO_USER_ID,
      fileName: "equinox-cancel-receipt.pdf",
      storagePath: `${DEMO_USER_ID}/equinox-cancel-receipt.pdf`,
      category: "gym",
      evidenceDate: "2026-03-01",
      jurisdiction: "CA",
      amount: 0,
      note: "SF Equinox cancellation",
      size: 44120,
      mimeType: "application/pdf",
      createdAt: "2026-03-01T19:00:00.000Z",
    },
    {
      userId: DEMO_USER_ID,
      fileName: "declaration-draft.pdf",
      storagePath: `${DEMO_USER_ID}/declaration-draft.pdf`,
      category: "declarations",
      evidenceDate: "2026-04-16",
      jurisdiction: "FL",
      amount: null,
      note: "Ready-to-sign packet draft — not yet filed with clerk",
      size: 33100,
      mimeType: "application/pdf",
      createdAt: "2026-04-16T11:40:00.000Z",
    },
  ];
  return rows.map((r) => ({ ...r, id: uid() }));
}

export function seedDemoUser(db: AppDB): AppDB {
  const profile = demoProfile();
  const { subject, body, recipient } = letterBody(
    "voter_cancel",
    profile,
    undefined,
    new Date("2026-03-04T14:22:00.000Z"),
  );
  const letter: Letter = {
    id: uid(),
    userId: DEMO_USER_ID,
    templateKey: "voter_cancel",
    recipient,
    subject,
    body,
    status: "sent",
    createdAt: "2026-03-04T14:22:00.000Z",
  };

  return {
    ...db,
    passwordByUser: { ...db.passwordByUser, [DEMO_USER_ID]: DEMO_PASSWORD },
    profiles: { ...db.profiles, [DEMO_USER_ID]: profile },
    migrations: [
      ...db.migrations.filter((m) => m.userId !== DEMO_USER_ID),
      {
        id: MIGRATION_ID,
        userId: DEMO_USER_ID,
        targetState: "FL",
        status: "active",
        startedAt: "2026-02-18T15:04:00.000Z",
        completedAt: null,
      },
    ],
    items: [...db.items.filter((i) => i.userId !== DEMO_USER_ID), ...seedItems()],
    presence: [...db.presence.filter((p) => p.userId !== DEMO_USER_ID), ...seedPresence()],
    evidence: [...db.evidence.filter((e) => e.userId !== DEMO_USER_ID), ...seedEvidence()],
    letters: [...db.letters.filter((l) => l.userId !== DEMO_USER_ID), letter],
  };
}

export { MIGRATION_ID };
