"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  deleteEvidenceRow,
  deleteOwnAccount,
  deletePresence as cloudDeletePresence,
  fetchWorkspace,
  insertEvidence,
  insertLetter,
  insertSnapshot,
  mergeWorkspace,
  pushWorkspaceSlice,
  updateLetterStatus,
  upsertItemStatus,
  upsertPresence as cloudUpsertPresence,
  upsertProfile,
} from "./cloud";
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_USER_ID, DISCLAIMER_VERSION, SESSION_COOKIE, STORAGE_KEY } from "./constants";
import { emptyDB, seedDemoUser } from "./demo-seed";
import { getPlaybook } from "./playbooks";
import { getSupabaseBrowser, isSupabaseConfigured } from "./supabase/client";
import type {
  AppDB,
  CalculatorInputs,
  CalculatorOutputs,
  ChecklistItem,
  Evidence,
  EvidenceCategory,
  ItemStatus,
  LetterStatus,
  MailboxAddress,
  Plan,
  PresenceBucket,
  PresenceDay,
  Profile,
  Snapshot,
  StepKey,
  TargetState,
} from "./types";
import { uid } from "./utils";
import { letterBody } from "./letters";
import { loadEntitlement } from "./billing";

function defaultDB(): AppDB {
  return emptyDB();
}

let memory: AppDB = defaultDB();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist(next: AppDB) {
  memory = next;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* quota */
    }
  }
  emit();
}

function patch(fn: (db: AppDB) => AppDB) {
  persist(fn(memory));
}

function loadFromStorage(): AppDB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDB();
    return { ...defaultDB(), ...JSON.parse(raw) } as AppDB;
  } catch {
    return defaultDB();
  }
}

export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  memory = loadFromStorage();
  hydrated = true;
  emit();
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function setSessionCookie(userId: string | null) {
  if (typeof document === "undefined") return;
  if (!userId) {
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
    return;
  }
  document.cookie = `${SESSION_COOKIE}=${userId}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

function initMigration(userId: string, target: TargetState, db: AppDB): AppDB {
  const playbook = getPlaybook(target);
  const migrationId = uid();
  const items: ChecklistItem[] = playbook.steps.flatMap((step) =>
    step.items.map((item) => ({
      id: uid(),
      migrationId,
      userId,
      stepKey: step.key,
      itemKey: item.key,
      label: item.label,
      status: "todo" as ItemStatus,
      metadata: {},
    })),
  );
  return {
    ...db,
    migrations: [
      ...db.migrations.map((m) => (m.userId === userId && m.status === "active" ? { ...m, status: "archived" as const } : m)),
      {
        id: migrationId,
        userId,
        targetState: target,
        status: "active",
        startedAt: new Date().toISOString(),
        completedAt: null,
      },
    ],
    items: [...db.items.filter((i) => i.userId !== userId), ...items],
  };
}

async function applyCloudSession(userId: string, email: string) {
  const ws = await fetchWorkspace(userId, email);
  if (!ws) return false;
  setSessionCookie(userId);
  patch((d) => {
    let next = mergeWorkspace(d, userId, email, ws);
    if (!next.migrations.some((m) => m.userId === userId && m.status === "active")) {
      next = initMigration(userId, next.profiles[userId]?.targetState ?? "FL", next);
      void pushWorkspaceSlice(next, userId);
    }
    return applyEntitlement(next, userId);
  });
  return true;
}

function useDB(): AppDB {
  return useSyncExternalStore(subscribe, () => memory, () => memory);
}

type AppContextValue = {
  hydrated: boolean;
  demoMode: boolean;
  db: AppDB;
  session: AppDB["session"];
  profile: Profile | null;
  migration: AppDB["migrations"][number] | null;
  items: ChecklistItem[];
  presence: PresenceDay[];
  evidence: Evidence[];
  letters: AppDB["letters"];
  inbound: AppDB["inbound"];
  snapshots: Snapshot[];
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<{ ok: boolean; error?: string; userId?: string; needsEmail?: boolean }>;
  magicLink: (email: string) => Promise<{ ok: boolean; error?: string; demoToken?: boolean }>;
  consumeMagic: (email: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (partial: Partial<Profile>) => void;
  completeOnboarding: (partial: Partial<Profile>) => void;
  setPlan: (plan: Plan, interval?: "month" | "year") => void;
  setItemStatus: (stepKey: StepKey, itemKey: string, status: ItemStatus, metadata?: Record<string, unknown>) => void;
  saveMailbox: (addr: MailboxAddress) => void;
  upsertPresence: (date: string, bucket: PresenceBucket | null, extra?: { formerState?: string; note?: string }) => void;
  addEvidence: (row: Omit<Evidence, "id" | "userId" | "createdAt" | "storagePath"> & { storagePath?: string }) => Evidence | null;
  deleteEvidence: (id: string) => void;
  addLetter: (templateKey: string, recipient?: string) => void;
  setLetterStatus: (id: string, status: LetterStatus) => void;
  saveSnapshot: (email: string, inputs: CalculatorInputs, outputs: CalculatorOutputs) => void;
  exportJson: () => string;
  deleteAccount: () => Promise<void>;
  acceptDisclaimer: () => void;
  switchTargetState: (state: TargetState) => void;
  simulateWebhook: () => void;
  joinConcierge: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const db = useDB();

  useEffect(() => {
    hydrateStore();
    const client = getSupabaseBrowser();
    if (!client) return;
    const { data } = client.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setSessionCookie(null);
        patch((d) => ({ ...d, session: null }));
        return;
      }
      if (!session?.user) return;
      if (event !== "INITIAL_SESSION" && event !== "SIGNED_IN") return;
      await applyCloudSession(session.user.id, session.user.email ?? "");
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const profile = db.session ? db.profiles[db.session.userId] ?? null : null;
  const migration =
    db.session ? db.migrations.find((m) => m.userId === db.session!.userId && m.status === "active") ?? null : null;
  const uidOf = db.session?.userId;
  const items = db.items.filter((i) => i.userId === uidOf);
  const presence = db.presence.filter((p) => p.userId === uidOf);
  const evidence = db.evidence.filter((e) => e.userId === uidOf);
  const letters = db.letters.filter((l) => l.userId === uidOf);
  const inbound = db.inbound.filter((i) => i.userId === uidOf);
  const snapshots = db.snapshots.filter((s) => s.userId === uidOf || (profile && s.email === profile.email));

  const login = useCallback(async (email: string, password: string) => {
    const sb = getSupabaseBrowser();
    if (sb) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error || !data.user) return { ok: false, error: error?.message ?? "Sign-in failed" };
      const userId = data.user.id;
      const mail = data.user.email ?? email.trim().toLowerCase();
      const loaded = await applyCloudSession(userId, mail);
      if (loaded) return { ok: true };
      setSessionCookie(userId);
      patch((d) => {
        const profile = blankProfile(userId, mail);
        let next: AppDB = {
          ...d,
          session: { userId, email: mail },
          profiles: { ...d.profiles, [userId]: profile },
        };
        next = initMigration(userId, profile.targetState, next);
        next = applyEntitlement(next, userId);
        void pushWorkspaceSlice(next, userId);
        return next;
      });
      return { ok: true };
    }

    const normalized = email.trim().toLowerCase();
    if (normalized === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setSessionCookie(DEMO_USER_ID);
      patch((d) => {
        const seeded = d.profiles[DEMO_USER_ID] ? d : seedDemoUser(d);
        return applyEntitlement(
          { ...seeded, session: { userId: DEMO_USER_ID, email: DEMO_EMAIL } },
          DEMO_USER_ID,
        );
      });
      return { ok: true };
    }

    const match = Object.entries(memory.profiles).find(([, p]) => p.email.toLowerCase() === normalized);
    if (!match) return { ok: false, error: "No account for that email. Try the demo login or sign up." };
    const [userId] = match;
    if (memory.passwordByUser[userId] !== password) return { ok: false, error: "Wrong password." };
    setSessionCookie(userId);
    patch((d) => applyEntitlement({ ...d, session: { userId, email: match[1].email } }, userId));
    return { ok: true };
  }, []);

  const signup = useCallback(async (email: string, password: string, fullName?: string) => {
    const normalized = email.trim().toLowerCase();
    if (password.length < 8) return { ok: false, error: "Use at least 8 characters." };

    const sb = getSupabaseBrowser();
    if (sb) {
      const { data, error } = await sb.auth.signUp({
        email: normalized,
        password,
        options: {
          data: { full_name: fullName ?? "" },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error || !data.user) return { ok: false, error: error?.message ?? "Sign-up failed" };
      if (!data.session) return { ok: true, userId: data.user.id, needsEmail: true };
      const userId = data.user.id;
      setSessionCookie(userId);
      patch((d) => {
        const profile = { ...blankProfile(userId, normalized), fullName: fullName ?? "" };
        let next: AppDB = {
          ...d,
          session: { userId, email: normalized },
          profiles: { ...d.profiles, [userId]: profile },
        };
        next = initMigration(userId, profile.targetState, next);
        next = applyEntitlement(next, userId);
        void pushWorkspaceSlice(next, userId);
        return next;
      });
      return { ok: true, userId };
    }

    if (Object.values(memory.profiles).some((p) => p.email.toLowerCase() === normalized)) {
      return { ok: false, error: "That email already has an account. Log in instead." };
    }
    const userId = uid();
    setSessionCookie(userId);
    patch((d) => {
      const profile = { ...blankProfile(userId, normalized), fullName: fullName ?? "" };
      let next: AppDB = {
        ...d,
        session: { userId, email: normalized },
        passwordByUser: { ...d.passwordByUser, [userId]: password },
        profiles: { ...d.profiles, [userId]: profile },
      };
      next = initMigration(userId, profile.targetState, next);
      next = applyEntitlement(next, userId);
      return next;
    });
    return { ok: true, userId };
  }, []);

  const magicLink = useCallback(async (email: string) => {
    const sb = getSupabaseBrowser();
    if (sb) {
      const { error } = await sb.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    }
    return { ok: true, demoToken: true };
  }, []);

  const consumeMagic = useCallback(async (email: string) => {
    const normalized = email.trim().toLowerCase();
    if (normalized === DEMO_EMAIL) return login(DEMO_EMAIL, DEMO_PASSWORD);
    const existing = Object.values(memory.profiles).find((p) => p.email.toLowerCase() === normalized);
    if (existing) return login(existing.email, memory.passwordByUser[existing.id] ?? "");
    return signup(normalized, `magic-${uid().slice(0, 10)}`, "");
  }, [login, signup]);

  const logout = useCallback(async () => {
    const sb = getSupabaseBrowser();
    if (sb) await sb.auth.signOut();
    setSessionCookie(null);
    patch((d) => ({ ...d, session: null }));
  }, []);

  const updateProfile = useCallback((partial: Partial<Profile>) => {
    const userId = memory.session?.userId;
    if (!userId) return;
    patch((d) => {
      const current = d.profiles[userId];
      if (!current) return d;
      const nextP = { ...current, ...partial };
      void upsertProfile(nextP);
      return { ...d, profiles: { ...d.profiles, [userId]: nextP } };
    });
  }, []);

  const completeOnboarding = useCallback((partial: Partial<Profile>) => {
    const userId = memory.session?.userId;
    if (!userId) return;
    patch((d) => {
      const current = d.profiles[userId];
      if (!current) return d;
      const nextP: Profile = { ...current, ...partial, onboarded: true };
      let next = { ...d, profiles: { ...d.profiles, [userId]: nextP } };
      if (partial.targetState && partial.targetState !== current.targetState) {
        next = initMigration(userId, partial.targetState, next);
      }
      void pushWorkspaceSlice(next, userId);
      return next;
    });
  }, []);

  const setPlan = useCallback((plan: Plan, interval: "month" | "year" = "month") => {
    updateProfile({ plan, billingInterval: interval });
  }, [updateProfile]);

  const setItemStatus = useCallback(
    (stepKey: StepKey, itemKey: string, status: ItemStatus, metadata?: Record<string, unknown>) => {
      const userId = memory.session?.userId;
      if (!userId) return;
      patch((d) => ({
        ...d,
        items: d.items.map((i) =>
          i.userId === userId && i.stepKey === stepKey && i.itemKey === itemKey
            ? { ...i, status, metadata: { ...i.metadata, ...metadata } }
            : i,
        ),
      }));
      void upsertItemStatus(userId, stepKey, itemKey, status, metadata);
    },
    [],
  );

  const saveMailbox = useCallback((addr: MailboxAddress) => {
    updateProfile({
      mailboxAddress: addr,
      mailboxProvider: addr.provider,
    });
    setItemStatus("address", "choose_path", addr.path ? "done" : "todo");
    setItemStatus("address", "enter_address", addr.street && addr.city && addr.zip ? "done" : "todo");
    setItemStatus("address", "mailbox_id", addr.mailboxId ? "done" : "todo");
    setItemStatus("address", "form_1583", addr.form1583 === "complete" ? "done" : addr.form1583 === "pending_notary" ? "in_progress" : "todo");
  }, [setItemStatus, updateProfile]);

  const upsertPresence = useCallback(
    (date: string, bucket: PresenceBucket | null, extra?: { formerState?: string; note?: string }) => {
      const userId = memory.session?.userId;
      if (!userId) return;
      patch((d) => {
        const without = d.presence.filter((p) => !(p.userId === userId && p.date === date));
        if (!bucket) {
          void cloudDeletePresence(userId, date);
          return { ...d, presence: without };
        }
        const day = {
          id: uid(),
          userId,
          date,
          bucket,
          formerState: extra?.formerState ?? d.profiles[userId]?.fromState ?? null,
          note: extra?.note ?? "",
          evidenceId: null,
        };
        void cloudUpsertPresence(day);
        const next = {
          ...d,
          presence: [...without, day],
        };
        if (bucket === "target") {
          next.items = next.items.map((i) =>
            i.userId === userId && i.stepKey === "presence" && (i.itemKey === "mark_nights" || i.itemKey === "one_night")
              ? { ...i, status: "done" as ItemStatus }
              : i,
          );
          void upsertItemStatus(userId, "presence", "mark_nights", "done");
        }
        return next;
      });
    },
    [],
  );

  const addEvidence = useCallback(
    (row: Omit<Evidence, "id" | "userId" | "createdAt" | "storagePath"> & { storagePath?: string }) => {
      const userId = memory.session?.userId;
      if (!userId) return null;
      const rec: Evidence = {
        ...row,
        id: uid(),
        userId,
        storagePath: row.storagePath ?? `${userId}/${row.fileName}`,
        createdAt: new Date().toISOString(),
      };
      patch((d) => ({ ...d, evidence: [rec, ...d.evidence] }));
      void insertEvidence(rec);
      return rec;
    },
    [],
  );

  const deleteEvidence = useCallback((id: string) => {
    const userId = memory.session?.userId;
    if (!userId) return;
    const row = memory.evidence.find((e) => e.id === id && e.userId === userId);
    patch((d) => ({ ...d, evidence: d.evidence.filter((e) => !(e.id === id && e.userId === userId)) }));
    void deleteEvidenceRow(id, userId, row?.storagePath);
  }, []);

  const addLetter = useCallback((templateKey: string, recipient?: string) => {
    const userId = memory.session?.userId;
    const p = userId ? memory.profiles[userId] : null;
    if (!userId || !p) return;
    const built = letterBody(templateKey, p, recipient);
    const letter = {
      id: uid(),
      userId,
      templateKey,
      recipient: built.recipient,
      subject: built.subject,
      body: built.body,
      status: "not_sent" as LetterStatus,
      createdAt: new Date().toISOString(),
    };
    patch((d) => ({
      ...d,
      letters: [letter, ...d.letters],
    }));
    void insertLetter(letter);
    if (templateKey === "voter_cancel") setItemStatus("voter_bank", "cancel_vote", "done");
    setItemStatus("letters", "generate", "done");
    setItemStatus("letters", "select_ties", "done");
  }, [setItemStatus]);

  const setLetterStatus = useCallback((id: string, status: LetterStatus) => {
    patch((d) => ({
      ...d,
      letters: d.letters.map((l) => (l.id === id ? { ...l, status } : l)),
    }));
    void updateLetterStatus(id, status);
    if (status === "sent") setItemStatus("letters", "send", "done");
  }, [setItemStatus]);

  const saveSnapshot = useCallback((email: string, inputs: CalculatorInputs, outputs: CalculatorOutputs) => {
    const snap: Snapshot = {
      id: uid(),
      userId: memory.session?.userId ?? null,
      email,
      inputs,
      outputs,
      createdAt: new Date().toISOString(),
    };
    patch((d) => ({ ...d, snapshots: [snap, ...d.snapshots] }));
    void insertSnapshot(snap);
  }, []);

  const exportJson = useCallback(() => {
    const userId = memory.session?.userId;
    if (!userId) return "{}";
    const slice = {
      profile: memory.profiles[userId],
      migrations: memory.migrations.filter((m) => m.userId === userId),
      items: memory.items.filter((i) => i.userId === userId),
      presence: memory.presence.filter((p) => p.userId === userId),
      evidence: memory.evidence.filter((e) => e.userId === userId).map(({ ...e }) => e),
      letters: memory.letters.filter((l) => l.userId === userId),
      snapshots: memory.snapshots.filter((s) => s.userId === userId),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(slice, null, 2);
  }, []);

  const deleteAccount = useCallback(async () => {
    const userId = memory.session?.userId;
    if (!userId) return;
    const sb = getSupabaseBrowser();
    if (sb) {
      await deleteOwnAccount();
      await sb.auth.signOut();
    }
    setSessionCookie(null);
    patch((d) => ({
      session: null,
      passwordByUser: Object.fromEntries(Object.entries(d.passwordByUser).filter(([k]) => k !== userId)),
      profiles: Object.fromEntries(Object.entries(d.profiles).filter(([k]) => k !== userId)),
      migrations: d.migrations.filter((m) => m.userId !== userId),
      items: d.items.filter((i) => i.userId !== userId),
      presence: d.presence.filter((p) => p.userId !== userId),
      evidence: d.evidence.filter((e) => e.userId !== userId),
      letters: d.letters.filter((l) => l.userId !== userId),
      snapshots: d.snapshots.filter((s) => s.userId !== userId),
      inbound: d.inbound.filter((i) => i.userId !== userId),
    }));
  }, []);

  const acceptDisclaimer = useCallback(() => {
    updateProfile({ disclaimerVersion: DISCLAIMER_VERSION });
  }, [updateProfile]);

  const switchTargetState = useCallback((state: TargetState) => {
    const userId = memory.session?.userId;
    if (!userId) return;
    patch((d) => {
      const current = d.profiles[userId];
      if (!current) return d;
      const nextP = { ...current, targetState: state };
      let next = { ...d, profiles: { ...d.profiles, [userId]: nextP } };
      next = initMigration(userId, state, next);
      void pushWorkspaceSlice(next, userId);
      return next;
    });
  }, []);

  const simulateWebhook = useCallback(() => {
    const userId = memory.session?.userId;
    if (!userId) return;
    patch((d) => ({
      ...d,
      inbound: [
        {
          id: uid(),
          userId,
          at: new Date().toISOString(),
          subject: "USPS Informed Delivery — preview scan",
          from: "scans@anytimemailbox.com",
          preview: "Connect (preview): simulated inbound scan. No live provider OAuth in this MVP.",
        },
        ...d.inbound,
      ],
    }));
    setItemStatus("address", "webhook", "done", { simulated: true });
  }, [setItemStatus]);

  const joinConcierge = useCallback(() => {
    updateProfile({ conciergeWaitlist: true });
  }, [updateProfile]);

  const value = useMemo<AppContextValue>(
    () => ({
      hydrated,
      demoMode: !isSupabaseConfigured(),
      db,
      session: db.session,
      profile,
      migration,
      items,
      presence,
      evidence,
      letters,
      inbound,
      snapshots,
      login,
      signup,
      magicLink,
      consumeMagic,
      logout,
      updateProfile,
      completeOnboarding,
      setPlan,
      setItemStatus,
      saveMailbox,
      upsertPresence,
      addEvidence,
      deleteEvidence,
      addLetter,
      setLetterStatus,
      saveSnapshot,
      exportJson,
      deleteAccount,
      acceptDisclaimer,
      switchTargetState,
      simulateWebhook,
      joinConcierge,
    }),
    [
      db,
      profile,
      migration,
      items,
      presence,
      evidence,
      letters,
      inbound,
      snapshots,
      login,
      signup,
      magicLink,
      consumeMagic,
      logout,
      updateProfile,
      completeOnboarding,
      setPlan,
      setItemStatus,
      saveMailbox,
      upsertPresence,
      addEvidence,
      deleteEvidence,
      addLetter,
      setLetterStatus,
      saveSnapshot,
      exportJson,
      deleteAccount,
      acceptDisclaimer,
      switchTargetState,
      simulateWebhook,
      joinConcierge,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function hasKit(plan: Plan | undefined) {
  return plan === "kit" || plan === "shield";
}

export function hasShield(plan: Plan | undefined) {
  return plan === "shield";
}

function applyEntitlement(db: AppDB, userId: string): AppDB {
  const e = loadEntitlement();
  if (!e) return db;
  const current = db.profiles[userId];
  if (!current) return db;
  return {
    ...db,
    profiles: {
      ...db.profiles,
      [userId]: { ...current, plan: e.plan, billingInterval: e.interval },
    },
  };
}

function blankProfile(id: string, email: string): Profile {
  return {
    id,
    email,
    fullName: "",
    fromState: "CA",
    targetState: "FL",
    filingStatus: "single",
    annualIncome: 0,
    incomeTypes: [],
    ownsPropertyInFromState: false,
    mailboxProvider: "",
    mailboxAddress: {
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
      inboundAlias: `mail+${id.slice(0, 8)}@inbound.nomadshield.app`,
    },
    plan: "free",
    taxYearStart: `${new Date().getFullYear()}-01-01`,
    watchState: "",
    disclaimerVersion: null,
    conciergeWaitlist: false,
    billingInterval: "month",
    createdAt: new Date().toISOString(),
    onboarded: false,
  };
}

export function applyCalculatorDraft(inputs: CalculatorInputs, profile: Partial<Profile> = {}): Partial<Profile> {
  return {
    fromState: inputs.fromState,
    targetState: inputs.targetState,
    filingStatus: inputs.filingStatus,
    annualIncome: inputs.income,
    incomeTypes: inputs.incomeTypes,
    ownsPropertyInFromState: inputs.ownsProperty,
    mailboxProvider: inputs.hasMailbox ? (inputs.mailboxProvider || "other") : profile.mailboxProvider,
    ...profile,
  };
}

export type { EvidenceCategory };
