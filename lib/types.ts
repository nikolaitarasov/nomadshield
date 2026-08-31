export type Plan = "free" | "kit" | "shield";
export type FilingStatus = "single" | "married_jointly";
export type TargetState = "FL" | "TX" | "SD";
export type IncomeType = "w2" | "1099" | "business" | "investments";
export type PresenceBucket = "target" | "former" | "other";
export type ItemStatus = "todo" | "in_progress" | "blocked" | "done";
export type Owner = "user" | "system";
export type LetterStatus = "draft" | "sent" | "not_sent";
export type Form1583Status = "not_started" | "pending_notary" | "complete";
export type MailboxPath = "connect" | "manual" | "waitlist";
export type StepKey =
  | "address"
  | "presence"
  | "dl"
  | "voter_bank"
  | "letters"
  | "declaration";

export type MailboxProviderId =
  | "anytime_mailbox"
  | "postscan_mail"
  | "ipostal1"
  | "traveling_mailbox"
  | "escapees"
  | "us_global_mail"
  | "other"
  | "none";

export type EvidenceCategory =
  | "lodging"
  | "travel"
  | "medical"
  | "gym"
  | "fuel"
  | "mail"
  | "dl"
  | "declarations"
  | "other";

export type CalculatorInputs = {
  fromState: string;
  filingStatus: FilingStatus;
  income: number;
  incomeTypes: IncomeType[];
  targetState: TargetState;
  daysInFormer: number;
  hasMailbox: boolean;
  mailboxProvider: MailboxProviderId | "";
  ownsProperty: boolean;
};

export type RiskLevel = "Low" | "Medium" | "High";

export type CalculatorOutputs = {
  rateUsed: number;
  topRate: number;
  rateLabel: string;
  annualSavings: number;
  fiveYear: number;
  riskScore: number;
  riskLevel: RiskLevel;
  riskReasons: string[];
  preview: string[];
  sdWarning: boolean;
  w2Warning: boolean;
};

export type MailboxAddress = {
  path: MailboxPath | "";
  provider: MailboxProviderId | "";
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  mailboxId: string;
  form1583: Form1583Status;
  webhookUrl: string;
  inboundAlias: string;
};

export type Profile = {
  id: string;
  email: string;
  fullName: string;
  fromState: string;
  targetState: TargetState;
  filingStatus: FilingStatus;
  annualIncome: number;
  incomeTypes: IncomeType[];
  ownsPropertyInFromState: boolean;
  mailboxProvider: MailboxProviderId | "";
  mailboxAddress: MailboxAddress;
  plan: Plan;
  taxYearStart: string;
  watchState: string;
  disclaimerVersion: string | null;
  conciergeWaitlist: boolean;
  billingInterval: "month" | "year";
  createdAt: string;
  onboarded: boolean;
};

export type Session = {
  userId: string;
  email: string;
};

export type Migration = {
  id: string;
  userId: string;
  targetState: TargetState;
  status: "active" | "completed" | "archived";
  startedAt: string;
  completedAt: string | null;
};

export type ChecklistItem = {
  id: string;
  migrationId: string;
  userId: string;
  stepKey: StepKey;
  itemKey: string;
  label: string;
  status: ItemStatus;
  metadata: Record<string, unknown>;
};

export type PresenceDay = {
  id: string;
  userId: string;
  date: string;
  bucket: PresenceBucket;
  formerState: string | null;
  note: string;
  evidenceId: string | null;
};

export type Evidence = {
  id: string;
  userId: string;
  fileName: string;
  storagePath: string;
  category: EvidenceCategory;
  evidenceDate: string;
  jurisdiction: string;
  amount: number | null;
  note: string;
  size: number;
  mimeType: string;
  createdAt: string;
};

export type Letter = {
  id: string;
  userId: string;
  templateKey: string;
  recipient: string;
  subject: string;
  body: string;
  status: LetterStatus;
  createdAt: string;
};

export type Snapshot = {
  id: string;
  userId: string | null;
  email: string;
  inputs: CalculatorInputs;
  outputs: CalculatorOutputs;
  createdAt: string;
};

export type InboundEvent = {
  id: string;
  userId: string;
  at: string;
  subject: string;
  from: string;
  preview: string;
};

export type AppDB = {
  session: Session | null;
  passwordByUser: Record<string, string>;
  profiles: Record<string, Profile>;
  migrations: Migration[];
  items: ChecklistItem[];
  presence: PresenceDay[];
  evidence: Evidence[];
  letters: Letter[];
  snapshots: Snapshot[];
  inbound: InboundEvent[];
};
