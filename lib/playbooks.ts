import { LINKS } from "./constants";
import { stateName } from "./states";
import type { ChecklistItem, Owner, StepKey, TargetState } from "./types";

export type PlaybookLink = { label: string; href: string };

export type PlaybookItemDef = {
  key: string;
  label: string;
  help?: string;
  owner: Owner;
  required: boolean;
  skippable?: boolean;
  skipLabel?: string;
  links?: PlaybookLink[];
  evidence?: boolean;
  widget?:
    | "mailbox"
    | "presence-cal"
    | "appointment"
    | "vehicle"
    | "w2-hr"
    | "letter-gen"
    | "county"
    | "packet"
    | "webhook";
};

export type PlaybookStepDef = {
  key: StepKey;
  number: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  summary: string;
  items: PlaybookItemDef[];
  warnings?: string[];
};

export type Playbook = {
  state: TargetState;
  name: string;
  tagline: string;
  warnings: string[];
  steps: PlaybookStepDef[];
};

export const STEP_META: { key: StepKey; number: number; title: string }[] = [
  { key: "address", number: 1, title: "Address & mail" },
  { key: "presence", number: 2, title: "Physical presence" },
  { key: "dl", number: 3, title: "Driver’s license & vehicle" },
  { key: "voter_bank", number: 4, title: "Voter registration & banking" },
  { key: "letters", number: 5, title: "Severing ties" },
  { key: "declaration", number: 6, title: "Declaration / residency file" },
];

function addressStep(state: TargetState): PlaybookStepDef {
  const name = stateName(state);
  const pmb =
    state === "TX"
      ? "Escapees in Livingston is a common nomad address. Other Texas CMRAs work. Paste it exactly as printed."
      : state === "SD"
        ? "Many banks and payroll providers now flag SD virtual addresses. If you still use one, paste it exactly — and read the 2026 warnings."
        : "Paste your CMRA address exactly as the provider prints it. PMB vs suite vs apartment matters for banks and the DMV.";

  return {
    key: "address",
    number: 1,
    title: "Address & mail",
    summary: `Lock a ${name} address you actually control. Bring your own mailbox if you already have one.`,
    warnings:
      state === "SD"
        ? [
            "Payroll, banking, and DMV practice around virtual South Dakota addresses has tightened in 2026. A PMB alone is not an audit file.",
          ]
        : undefined,
    items: [
      {
        key: "choose_path",
        label: "Choose a mailbox path: connect existing, enter manually, or join the partner waitlist",
        help: "You already pay $10–20/mo for a mailbox. Don’t rent another one unless you want to.",
        owner: "user",
        required: true,
        widget: "mailbox",
      },
      {
        key: "enter_address",
        label: `Enter the ${name} street, unit/PMB, city, and ZIP exactly as printed`,
        help: pmb,
        owner: "user",
        required: true,
      },
      {
        key: "mailbox_id",
        label: "Record mailbox ID / PMB number",
        owner: "user",
        required: true,
      },
      {
        key: "form_1583",
        label: "USPS Form 1583 (CMRA authorization) — not started, pending notary, or complete",
        help: "Your mailbox provider requires 1583. We track status. We do not notarize it for you in this MVP.",
        owner: "user",
        required: true,
        links: [{ label: "USPS Form 1583 (PDF)", href: LINKS.usps1583 }],
      },
      {
        key: "webhook",
        label: "Optional: inbound webhook / email alias for scanned mail (Connect preview)",
        help: "Not live OAuth. Paste a webhook URL if your provider supports it, or use the alias. Status stays “waiting for first webhook” until you simulate or a real POST arrives.",
        owner: "system",
        required: false,
        widget: "webhook",
      },
    ],
  };
}

function presenceStep(state: TargetState): PlaybookStepDef {
  if (state === "SD") {
    return {
      key: "presence",
      number: 2,
      title: "Physical presence",
      summary: "South Dakota’s old “one night in a hotel” folklore is not audit-proof. Log the stay, upload the receipt, and do not treat it as a safe harbor.",
      warnings: [
        "1 night ≠ a domicile file. CA and NY look at the whole year, family, home, doctors, and work — not a Sioux Falls Marriott folio.",
      ],
      items: [
        {
          key: "plan_trip",
          label: "Plan (or record) a physical stay in South Dakota",
          owner: "user",
          required: true,
        },
        {
          key: "one_night",
          label: "Log the overnight on the presence calendar",
          owner: "user",
          required: true,
          widget: "presence-cal",
        },
        {
          key: "receipt",
          label: "Upload lodging receipt to the evidence vault",
          owner: "user",
          required: true,
          evidence: true,
        },
        {
          key: "read_warning",
          label: "Confirm you read: one night is a heuristic, not a defense",
          owner: "user",
          required: true,
        },
        {
          key: "consider_fl",
          label: "W-2 employees: consider switching the playbook to Florida (safer banking + payroll)",
          owner: "user",
          required: false,
        },
      ],
    };
  }

  if (state === "TX") {
    return {
      key: "presence",
      number: 2,
      title: "Physical presence",
      summary: "Texas new residents generally must get a DL within 30 days of becoming residents. Plan the trip around DPS, not just the mailbox.",
      items: [
        {
          key: "plan_trip",
          label: "Plan a Texas trip (DPS appointment window + lodging)",
          owner: "user",
          required: true,
        },
        {
          key: "lodging",
          label: "Book hotel / RV park / rental and keep the confirmation",
          owner: "user",
          required: true,
          evidence: true,
        },
        {
          key: "mark_nights",
          label: "Mark Texas nights on the presence calendar",
          owner: "user",
          required: true,
          widget: "presence-cal",
        },
        {
          key: "escapees_note",
          label: "If using Escapees / Livingston: note it. An RV-mail address is still a facts test, not a loophole.",
          owner: "user",
          required: false,
        },
        {
          key: "travel_docs",
          label: "Save boarding passes, fuel, or toll receipts from the trip",
          owner: "user",
          required: false,
          evidence: true,
        },
      ],
    };
  }

  return {
    key: "presence",
    number: 2,
    title: "Physical presence",
    summary: "Florida wants a real resident, not a PDF. Plan a trip, sleep there, and sit for the DL appointment.",
    items: [
      {
        key: "plan_trip",
        label: "Plan a Florida trip (dates + city near a driver-license office)",
        owner: "user",
        required: true,
      },
      {
        key: "lodging",
        label: "Book hotel / short-term rental nights and keep the confirmation",
        owner: "user",
        required: true,
        evidence: true,
      },
      {
        key: "mark_nights",
        label: "Mark Florida nights on the presence calendar",
        help: "Audit Shield uses these nights. A Florida address with zero Florida days is a weak file.",
        owner: "user",
        required: true,
        widget: "presence-cal",
      },
      {
        key: "dl_window",
        label: "Pick a DL appointment window while you are in-state",
        owner: "user",
        required: true,
        widget: "appointment",
        links: [{ label: "FLHSMV office locator", href: LINKS.flhsmvOffices }],
      },
      {
        key: "travel_docs",
        label: "Save boarding passes, fuel, or rental-car receipts",
        owner: "user",
        required: false,
        evidence: true,
      },
    ],
  };
}

function dlStep(state: TargetState): PlaybookStepDef {
  const links =
    state === "FL"
      ? [
          { label: "FLHSMV — new Florida resident", href: LINKS.flhsmvNew },
          { label: "FLHSMV office / appointments", href: LINKS.flhsmvOffices },
        ]
      : state === "TX"
        ? [
            { label: "TX DPS — how to apply", href: LINKS.txDpsNew },
            { label: "TX DPS — make an appointment", href: LINKS.txDpsAppt },
          ]
        : [
            { label: "SD DPS — driver licensing", href: LINKS.sdDps },
            { label: "SD DPS — new residents", href: LINKS.sdDpsNew },
          ];

  const extra =
    state === "SD"
      ? "South Dakota has tightened physical-presence expectations at the DMV. Do not assume a CMRA letter gets you a license by mail."
      : state === "TX"
        ? "Texas generally expects a DL within 30 days of becoming a resident. Bring identity + SSN + proof of Texas address (PMB rules vary by office — call ahead)."
        : "Florida generally expects a DL within 30 days of becoming a resident. Bring identity, SSN, and two proofs of Florida address. Some offices are picky about PMB wording.";

  return {
    key: "dl",
    number: 3,
    title: "Driver’s license & vehicle",
    summary: extra,
    items: [
      {
        key: "read_reqs",
        label: "Read official new-resident driver-license requirements",
        owner: "user",
        required: true,
        links,
      },
      {
        key: "gather_docs",
        label: "Gather identity documents (passport or birth certificate, SSN, proof of address)",
        owner: "user",
        required: true,
      },
      {
        key: "appointment",
        label: "Set an appointment date (we store the date — we do not book the DMV)",
        help: "Appointment scheduler is a link + a date field. No fake booking API.",
        owner: "user",
        required: true,
        widget: "appointment",
        links,
      },
      {
        key: "upload_dl",
        label: "After the visit: upload the new license image to the vault",
        owner: "user",
        required: false,
        evidence: true,
      },
      {
        key: "vehicle",
        label: "Vehicle title / registration in the new state",
        help: "Skip if you do not keep a US-plated vehicle. Common for nomads.",
        owner: "user",
        required: false,
        skippable: true,
        skipLabel: "Skip — no vehicle (common for nomads)",
        widget: "vehicle",
      },
      {
        key: "insurance",
        label: "Update auto insurance address (if you have a vehicle)",
        owner: "user",
        required: false,
        skippable: true,
        skipLabel: "Skip — no vehicle",
      },
    ],
  };
}

function voterBankStep(state: TargetState): PlaybookStepDef {
  const voteLink =
    state === "FL"
      ? [{ label: "Register to vote in Florida", href: LINKS.flVote }, { label: "Florida DOS — elections", href: LINKS.flDosElections }]
      : state === "TX"
        ? [{ label: "VoteTexas.gov — register", href: LINKS.txVote }]
        : [{ label: "South Dakota voter registration", href: LINKS.sdVote }];

  return {
    key: "voter_bank",
    number: 4,
    title: "Voter registration & banking",
    summary: "Voting and banking are classic domicile facts. Update them — and tell W-2 payroll the truth.",
    items: [
      {
        key: "register_vote",
        label: `Register to vote in ${stateName(state)}`,
        owner: "user",
        required: true,
        links: [...voteLink, { label: "vote.gov", href: LINKS.voteGov }],
      },
      {
        key: "cancel_vote",
        label: "Generate and send a voter-registration cancellation to the former state",
        owner: "user",
        required: true,
        widget: "letter-gen",
      },
      {
        key: "primary_bank",
        label: "Update your primary bank’s address of record",
        help: "Use the CMRA exactly as printed. Avoid inventing “Suite” when the provider prints “PMB”. Some banks reject obvious CMRA wording — that is a provider/bank issue, not something we fake.",
        owner: "user",
        required: true,
      },
      {
        key: "other_banks",
        label: "Update at least two more institutions (brokerage, credit cards, credit union)",
        owner: "user",
        required: true,
      },
      {
        key: "irs8822",
        label: "File IRS Form 8822 change of address (federal — does not change domicile by itself)",
        owner: "user",
        required: true,
        links: [{ label: "IRS Form 8822", href: LINKS.irs8822 }],
      },
      {
        key: "usps_ncoa",
        label: "Optional: USPS change of address / NCOA",
        owner: "user",
        required: false,
        links: [{ label: "USPS MoversGuide", href: LINKS.uspsMove }],
      },
      {
        key: "w2_hr",
        label: "W-2: talk to HR / payroll about state withholding and a work-location change",
        help: "We do not promise you can stay on California (or New York) payroll and magically owe $0. Multi-state withholding is an employer + facts problem.",
        owner: "user",
        required: false,
        widget: "w2-hr",
      },
    ],
  };
}

function lettersStep(): PlaybookStepDef {
  return {
    key: "letters",
    number: 5,
    title: "Severing ties",
    summary: "Domicile is a web of facts. Cancel or re-address the old-state ties so an auditor does not find them for you.",
    items: [
      {
        key: "select_ties",
        label: "Select the ties you still have in the former state",
        owner: "user",
        required: true,
        widget: "letter-gen",
      },
      {
        key: "generate",
        label: "Generate downloadable letters with your name, address, and dates",
        owner: "system",
        required: true,
      },
      {
        key: "send",
        label: "Send the letters and toggle each to sent",
        owner: "user",
        required: true,
      },
      {
        key: "proof",
        label: "Optional: upload send receipts (email PDF, certified-mail stub) to the vault",
        owner: "user",
        required: false,
        evidence: true,
      },
    ],
  };
}

function declarationStep(state: TargetState): PlaybookStepDef {
  if (state === "FL") {
    return {
      key: "declaration",
      number: 6,
      title: "Declaration of Domicile",
      summary: "Florida’s Declaration of Domicile is filed with the clerk of the circuit court in the county of your Florida address. We generate a ready-to-sign packet. We do not e-file.",
      items: [
        {
          key: "pick_county",
          label: "Choose the Florida county of your mailing address",
          owner: "user",
          required: true,
          widget: "county",
        },
        {
          key: "packet",
          label: "Download the ready-to-sign packet (cover sheet + field summary + filing checklist)",
          owner: "system",
          required: true,
          widget: "packet",
        },
        {
          key: "file_clerk",
          label: "File with the county clerk (you or your CPA — not NomadShield)",
          owner: "user",
          required: true,
        },
        {
          key: "upload_stamped",
          label: "Upload the stamped copy to the evidence vault",
          owner: "user",
          required: false,
          evidence: true,
        },
      ],
    };
  }

  if (state === "TX") {
    return {
      key: "declaration",
      number: 6,
      title: "Texas residency file",
      summary: "Texas has no statewide “declaration of domicile.” Your file is the DL, voter registration, address, and (if you own a home) homestead. We generate a summary packet, not an e-file.",
      items: [
        {
          key: "assemble",
          label: "Assemble DL + voter + address proof into one residency file",
          owner: "user",
          required: true,
        },
        {
          key: "packet",
          label: "Download the ready-to-sign residency summary packet",
          owner: "system",
          required: true,
          widget: "packet",
        },
        {
          key: "homestead",
          label: "If you buy/own a Texas home: homestead exemption (skip if you don’t)",
          owner: "user",
          required: false,
          skippable: true,
          skipLabel: "Skip — I don’t own a Texas home",
        },
        {
          key: "upload",
          label: "Upload the signed summary and supporting copies to the vault",
          owner: "user",
          required: false,
          evidence: true,
        },
      ],
    };
  }

  return {
    key: "declaration",
    number: 6,
    title: "South Dakota residency affidavit",
    summary: "SD practice is in flux. Treat this as a documentation playbook, not a promise the DMV, a bank, or a payroll provider will accept a CMRA.",
    warnings: [
      "2026 risk: legislative, DL, banking, and payroll friction. Florida is usually the safer W-2 default.",
    ],
    items: [
      {
        key: "read_risk",
        label: "Read the 2026 SD risk memo (payroll / DL / banking / legislation)",
        owner: "user",
        required: true,
      },
      {
        key: "packet",
        label: "Download the residency-affidavit playbook packet (not an e-file)",
        owner: "system",
        required: true,
        widget: "packet",
      },
      {
        key: "file_local",
        label: "If a county or DMV requests an affidavit, you or your CPA file it locally",
        owner: "user",
        required: true,
      },
      {
        key: "upload",
        label: "Upload any stamped affidavit to the vault",
        owner: "user",
        required: false,
        evidence: true,
      },
    ],
  };
}

const TAGLINE: Record<TargetState, string> = {
  FL: "Florida is the primary playbook: Declaration of Domicile, FLHSMV, and a mailbox you already own.",
  TX: "Texas is the secondary playbook: DPS, voter registration, and a residency file — no statewide declaration form.",
  SD: "Use this playbook only after you read the 2026 warnings. Florida is usually the more practical default for W-2 employees.",
};

const WARNINGS: Record<TargetState, string[]> = {
  FL: [
    "A Florida address is not a defense file. Presence, DL, voter, and severed ties are.",
    "New Florida residents generally must obtain a Florida driver license within 30 days of becoming residents.",
  ],
  TX: [
    "Texas does not publish a single domicile declaration. Your facts are the file.",
    "Escapees / Livingston is widely used by full-time travelers. It is not a substitute for presence and a DL.",
  ],
  SD: [
    "Several Florida concierge services no longer offer South Dakota after payroll, banking, and DMV friction.",
    "W-2 employees: Florida is usually safer for payroll and banking acceptance.",
    "A one-night hotel stay is not audit-proof.",
  ],
};

export function getPlaybook(state: TargetState): Playbook {
  return {
    state,
    name: stateName(state),
    tagline: TAGLINE[state],
    warnings: WARNINGS[state],
    steps: [
      addressStep(state),
      presenceStep(state),
      dlStep(state),
      voterBankStep(state),
      lettersStep(),
      declarationStep(state),
    ],
  };
}

export function itemDef(state: TargetState, stepKey: StepKey, itemKey: string) {
  const step = getPlaybook(state).steps.find((s) => s.key === stepKey);
  return step?.items.find((i) => i.key === itemKey);
}

export function progressFor(playbook: Playbook, items: ChecklistItem[]) {
  const reqKeys = playbook.steps.flatMap((s) =>
    s.items.filter((i) => i.required).map((i) => `${s.key}:${i.key}`),
  );
  const doneKeys = new Set(
    items.filter((i) => i.status === "done").map((i) => `${i.stepKey}:${i.itemKey}`),
  );
  const completed = reqKeys.filter((k) => doneKeys.has(k)).length;
  const pct = reqKeys.length === 0 ? 0 : Math.round((completed / reqKeys.length) * 100);
  return { completed, total: reqKeys.length, pct };
}

export function stepProgress(playbook: Playbook, stepKey: StepKey, items: ChecklistItem[]) {
  const step = playbook.steps.find((s) => s.key === stepKey);
  if (!step) return { completed: 0, total: 0, pct: 0 };
  const req = step.items.filter((i) => i.required);
  const doneKeys = new Set(
    items.filter((i) => i.stepKey === stepKey && i.status === "done").map((i) => i.itemKey),
  );
  const completed = req.filter((i) => doneKeys.has(i.key)).length;
  const pct = req.length === 0 ? 100 : Math.round((completed / req.length) * 100);
  return { completed, total: req.length, pct };
}

export function nextAction(playbook: Playbook, items: ChecklistItem[]) {
  const status = (stepKey: StepKey, itemKey: string) =>
    items.find((i) => i.stepKey === stepKey && i.itemKey === itemKey)?.status ?? "todo";
  for (const step of playbook.steps) {
    for (const item of step.items) {
      if (!item.required) continue;
      const st = status(step.key, item.key);
      if (st !== "done") {
        return {
          step,
          item,
          href: `/app/checklist/${step.number}`,
          label: `Step ${step.number}: ${item.label}`,
        };
      }
    }
  }
  return null;
}
