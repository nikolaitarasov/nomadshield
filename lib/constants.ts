export const APP_NAME = "NomadShield";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const DISCLAIMER_VERSION = "2026-03-01";

export const DISCLAIMER_SHORT =
  "NomadShield is a compliance workflow tool, not a CPA, law firm, or tax-advice product. Domicile is a facts-and-circumstances test. A checklist does not guarantee a state will accept the change. Estimates are illustrative, not advice. You or your CPA file government forms — we do not.";

export const DISCLAIMER_LONG = `NomadShield is software that organizes domicile-change workflows, calendars, and evidence. It is not a certified public accountant, enrolled agent, law firm, or tax-advice product, and nothing in this application constitutes legal, tax, or accounting advice.

Domicile (and statutory residency) is a facts-and-circumstances determination. Completing a checklist, generating a letter, holding a mailbox address, or spending a night in a target state does not guarantee that California, New York, or any other state will accept a change of domicile. States apply their own tests, which may include physical presence, family, real property, business ties, voter registration, driver's licenses, the location of doctors and clubs, and more. The 183-day figure used in Audit Shield is a common rule of thumb, not the only domicile test, and not a safe harbor.

NomadShield does not auto-file government forms. Packets, cover sheets, and “ready to sign” summaries are tools for you or your tax professional. Official forms must be completed and submitted through the relevant county clerk, DMV, election official, IRS, or other agency.

Tax savings figures are estimates based on approximate 2025/2026 published top or flat state rates (and a simplified effective-rate curve for graduated states). They ignore local taxes, credits, part-year apportionment, community property, city taxes (including NYC), Washington capital-gains tax, and federal effects. Do not make a move decision solely on this calculator.

South Dakota playbooks include explicit 2026 risk warnings because payroll providers, banks, and DMV practice have tightened around virtual/CMRA addresses. NomadShield does not recommend South Dakota as a default.

By using NomadShield you agree that you are responsible for your own filings, travel, and records, and that you will consult a qualified professional for advice specific to your facts.`;

export const PLANS = {
  free: {
    id: "free" as const,
    name: "Free",
    price: "$0",
    blurb: "See the number before you talk to anyone.",
    cta: "Run the calculator",
  },
  kit: {
    id: "kit" as const,
    name: "Migration Kit",
    price: "$49",
    period: "one-time",
    blurb: "Full 6-step engine for one target state, form packets, letter generator.",
    cta: "Start migration — $49",
  },
  shield: {
    id: "shield" as const,
    name: "Audit Shield",
    price: "$19",
    period: "/mo",
    yearly: "$190",
    yearlyPeriod: "/yr",
    blurb: "183-day logger, 5 GB evidence vault, 1-click defense PDF, reminders.",
    cta: "Add Audit Shield — $19/mo",
  },
  concierge: {
    id: "concierge" as const,
    name: "Concierge",
    price: "Waitlist",
    blurb: "Book a CPA partner when you want a human. No fake live chat.",
    cta: "Join CPA partner waitlist",
  },
};

export const DEMO_EMAIL = "demo@nomadshield.app";
export const DEMO_PASSWORD = "Demo1234!";
export const DEMO_USER_ID = "11111111-1111-4111-8111-111111111111";

export const HIGHLIGHT_STATES = ["CA", "NY", "NJ", "IL", "MN", "MA"] as const;

export const LINKS = {
  flhsmvNew: "https://www.flhsmv.gov/driver-licenses-id-cards/new-florida-resident/",
  flhsmvOffices: "https://www.flhsmv.gov/offices/",
  flVote: "https://registertovoteflorida.gov/home",
  txDpsNew:
    "https://www.dps.texas.gov/section/driver-license/how-apply-texas-driver-license-or-identification-card",
  txDpsAppt: "https://www.dps.texas.gov/section/driver-license/make-driver-license-appointment",
  txVote: "https://www.votetexas.gov/register/index.html",
  sdDps: "https://dps.sd.gov/driver-licensing",
  sdDpsNew: "https://dps.sd.gov/driver-licensing/new-residents",
  sdVote: "https://sdsos.gov/elections-voting/voting/register-to-vote/default.aspx",
  voteGov: "https://www.vote.gov/",
  irs8822: "https://www.irs.gov/forms-pubs/about-form-8822",
  usps1583: "https://about.usps.com/forms/ps1583.pdf",
  uspsMove: "https://moversguide.usps.com/",
  flDosElections: "https://dos.fl.gov/elections/for-voters/voter-registration/",
};

export const EVIDENCE_CATEGORIES = [
  { id: "lodging", label: "Lodging" },
  { id: "travel", label: "Travel" },
  { id: "medical", label: "Medical" },
  { id: "gym", label: "Gym / coworking" },
  { id: "fuel", label: "Fuel" },
  { id: "mail", label: "Mail" },
  { id: "dl", label: "Driver's license" },
  { id: "declarations", label: "Declarations" },
  { id: "other", label: "Other" },
] as const;

export const MAILBOX_PROVIDERS = [
  { id: "anytime_mailbox", name: "Anytime Mailbox", url: "https://anytimemailbox.com" },
  { id: "postscan_mail", name: "PostScan Mail", url: "https://postscanmail.com" },
  { id: "ipostal1", name: "iPostal1", url: "https://www.ipostal1.com" },
  { id: "traveling_mailbox", name: "Traveling Mailbox", url: "https://travelingmailbox.com" },
  { id: "escapees", name: "Escapees Mail Service", url: "https://www.escapees.com/mail-service" },
  { id: "us_global_mail", name: "US Global Mail", url: "https://www.usglobalmail.com" },
  { id: "other", name: "Other CMRA / private mailbox" },
] as const;

export const INCOME_TYPES = [
  { id: "w2", label: "W-2 remote", hint: "Employer payroll and withholding follow you. Highest audit friction." },
  { id: "1099", label: "1099", hint: "Independent contractor. Still a domicile facts test, cleaner payroll story." },
  { id: "business", label: "Business owner", hint: "Entity, office, and payroll location become part of the file." },
  { id: "investments", label: "Investments", hint: "State sourcing of gains varies; this affects risk copy, not the savings math." },
] as const;

export const LETTER_TEMPLATES = [
  { key: "voter_cancel", label: "Former-state voter cancellation", recipient: "County board of elections / registrar" },
  { key: "gym", label: "Gym or club membership", recipient: "Membership office" },
  { key: "library", label: "Public library card", recipient: "Library circulation desk" },
  { key: "professional_license", label: "Professional license address", recipient: "State licensing board" },
  { key: "insurance", label: "Insurance policies", recipient: "Insurance carrier" },
  { key: "cpa", label: "CPA / tax preparer", recipient: "Your CPA" },
  { key: "employer_hr", label: "Employer HR / payroll", recipient: "Human resources / payroll" },
  { key: "utility", label: "Utility or former residence", recipient: "Utility provider" },
  { key: "doctors", label: "Doctors / dentists", recipient: "Medical practice" },
] as const;

export const STORAGE_KEY = "nomadshield:db:v1";
export const DRAFT_KEY = "nomadshield:calculator_draft";
export const SESSION_COOKIE = "ns_session";
