import { DISCLAIMER_SHORT } from "./constants";
import { getState, stateName } from "./states";
import type { CalculatorInputs, CalculatorOutputs, RiskLevel } from "./types";

export const DEFAULT_INPUTS: CalculatorInputs = {
  fromState: "CA",
  filingStatus: "single",
  income: 180000,
  incomeTypes: ["w2"],
  targetState: "FL",
  daysInFormer: 41,
  hasMailbox: false,
  mailboxProvider: "",
  ownsProperty: false,
};

export const DRAFT_KEY = "nomadshield:calculator_draft";

export function loadDraft(): CalculatorInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return { ...DEFAULT_INPUTS, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

export function saveDraft(inputs: CalculatorInputs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(inputs));
}

/**
 * Approximate effective rate from a top/flat table.
 * Flat and no-wage-tax states use the published rate.
 * Graduated states use a simplified curve so a $180k CA filer
 * is not charged the 13.3% millionaire bracket.
 */
export function effectiveRate(abbr: string, income: number): { rate: number; topRate: number; label: string } {
  const s = getState(abbr);
  if (!s) return { rate: 0, topRate: 0, label: "Unknown state" };
  if (s.noWageTax) return { rate: 0, topRate: 0, label: `${s.name} has no wage income tax` };
  if (s.flat) return { rate: s.topRate, topRate: s.topRate, label: `${s.name} flat ${s.topRate}%` };

  let factor = 0.5;
  if (income >= 1_000_000) factor = 1;
  else if (income >= 500_000) factor = 0.9;
  else if (income >= 250_000) factor = 0.78;
  else if (income >= 150_000) factor = 0.68;
  else if (income >= 80_000) factor = 0.58;
  const rate = Math.round(s.topRate * factor * 100) / 100;
  return {
    rate,
    topRate: s.topRate,
    label: `${s.name} ~${rate}% effective (top ${s.topRate}%)`,
  };
}

export function riskFor(inputs: CalculatorInputs): { score: number; level: RiskLevel; reasons: string[] } {
  const s = getState(inputs.fromState);
  const agg = s?.aggressiveness ?? 30;
  const reasons: string[] = [];

  let score = agg * 0.38;
  if (agg >= 90) reasons.push(`${stateName(inputs.fromState)} is highly aggressive toward former residents.`);
  else if (agg >= 70) reasons.push(`${stateName(inputs.fromState)} regularly audits domicile changes.`);
  else reasons.push(`${stateName(inputs.fromState)} is less aggressive, but domicile is still facts-and-circumstances.`);

  const dayPts = Math.min(42, (inputs.daysInFormer / 183) * 42);
  score += dayPts;
  if (inputs.daysInFormer >= 183) {
    reasons.push(`${inputs.daysInFormer} days already in the former state this year — over the common 183-day rule of thumb.`);
  } else if (inputs.daysInFormer >= 120) {
    reasons.push(`${inputs.daysInFormer} days in the former state this year is a lot of presence to unwind.`);
  } else if (inputs.daysInFormer >= 60) {
    reasons.push(`${inputs.daysInFormer} days logged in the former state — keep the rest of the year clean.`);
  } else {
    reasons.push(`${inputs.daysInFormer} days so far in the former state. The calendar still matters more than the mailbox.`);
  }

  if (inputs.ownsProperty) {
    score += 16;
    reasons.push("Owning a home in the former state is a classic domicile hook. Expect extra evidence.");
  }

  const w2 = inputs.incomeTypes.includes("w2");
  const c1099 = inputs.incomeTypes.includes("1099");
  const biz = inputs.incomeTypes.includes("business");
  if (w2) {
    score += 11;
    reasons.push("W-2 remote work: payroll, withholding, and your employer’s location will be in the file.");
  } else if (c1099) {
    score += 3;
    reasons.push("1099 income avoids employer payroll, but the state can still argue you never left.");
  }
  if (biz) {
    score += 5;
    reasons.push("A business still tied to the former state can look like you never moved.");
  }

  if (inputs.targetState === "SD") {
    score += 8;
    reasons.push("South Dakota virtual-address plays are under 2026 payroll / DL / banking pressure.");
  }

  score = Math.round(Math.min(99, Math.max(8, score)));
  const level: RiskLevel = score >= 70 ? "High" : score >= 42 ? "Medium" : "Low";
  return { score, level, reasons };
}

export function previewBullets(inputs: CalculatorInputs): string[] {
  const target = stateName(inputs.targetState);
  const bullets: string[] = [];
  if (!inputs.hasMailbox) {
    bullets.push(`Get or connect a ${target} CMRA address — keep the mailbox you already pay for, or enter one manually.`);
  } else {
    bullets.push(`Connect your existing mailbox and paste the CMRA address exactly as the provider prints it (PMB vs suite matters).`);
  }
  if (inputs.targetState === "SD") {
    bullets.push("If you still choose SD: log a physical stay with receipts. One hotel night is not an audit file.");
  } else if (inputs.targetState === "TX") {
    bullets.push("Plan a Texas trip around a DPS appointment. Escapees/Livingston is common; it is still a facts test.");
  } else {
    bullets.push("Plan a Florida trip: lodging nights, a DL appointment window, and receipts in the vault.");
  }
  bullets.push("Swap the DL and voter registration, then generate severing-ties letters for gyms, doctors, insurers, and HR.");
  if (inputs.targetState === "FL") {
    bullets.push("File a Declaration of Domicile with the county clerk — we generate the packet; you or your CPA file it.");
  } else if (inputs.targetState === "TX") {
    bullets.push("Assemble a Texas residency file (DL, voter, address). Texas has no statewide declaration of domicile form.");
  } else {
    bullets.push("Build an SD residency affidavit packet — and read the 2026 warnings before you spend a notary fee.");
  }
  return bullets.slice(0, 4);
}

export function calculate(inputs: CalculatorInputs): CalculatorOutputs {
  const from = effectiveRate(inputs.fromState, inputs.income);
  const to = getState(inputs.targetState);
  const toRate = to?.noWageTax ? 0 : effectiveRate(inputs.targetState, inputs.income).rate;
  const delta = Math.max(0, from.rate - toRate);
  const annualSavings = Math.round(inputs.income * (delta / 100));
  const risk = riskFor(inputs);
  const w2 = inputs.incomeTypes.includes("w2");

  return {
    rateUsed: from.rate,
    topRate: from.topRate,
    rateLabel: from.label,
    annualSavings,
    fiveYear: annualSavings * 5,
    riskScore: risk.score,
    riskLevel: risk.level,
    riskReasons: risk.reasons,
    preview: previewBullets(inputs),
    sdWarning: inputs.targetState === "SD",
    w2Warning: w2,
  };
}

export { DISCLAIMER_SHORT };
