import { jsPDF } from "jspdf";
import { DISCLAIMER_LONG, DISCLAIMER_SHORT } from "./constants";
import { formatAddress } from "./letters";
import { FL_COUNTIES, stateName } from "./states";
import type { Evidence, PresenceDay, Profile } from "./types";
import { downloadBlob, formatDate } from "./utils";

function setup() {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  return doc;
}

function wrap(doc: jsPDF, text: string, x: number, y: number, max = 500, size = 10, color = "#1a2330") {
  doc.setFontSize(size);
  doc.setTextColor(color);
  const lines = doc.splitTextToSize(text, max) as string[];
  doc.text(lines, x, y);
  return y + lines.length * (size + 4);
}

function header(doc: jsPDF, title: string, subtitle?: string) {
  doc.setFillColor(7, 9, 12);
  doc.rect(0, 0, 612, 72, "F");
  doc.setTextColor(52, 211, 153);
  doc.setFontSize(11);
  doc.text("NOMADSHIELD", 40, 32);
  doc.setTextColor(243, 246, 250);
  doc.setFontSize(16);
  doc.text(title, 40, 54);
  if (subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(180, 190, 200);
    doc.text(subtitle, 360, 54);
  }
}

function footer(doc: jsPDF, page: number, total: number) {
  doc.setFontSize(8);
  doc.setTextColor(120, 130, 140);
  doc.text(`Page ${page} of ${total}  ·  Workflow tool, not tax advice.`, 40, 760);
}

export async function downloadDefenseReport(opts: {
  profile: Profile;
  year: number;
  presence: PresenceDay[];
  evidence: Evidence[];
  counts: { target: number; former: number; other: number; unlabeled: number };
}) {
  const { profile, year, presence, evidence, counts } = opts;
  const doc = setup();
  header(doc, "Audit Defense Report", `${profile.fullName || profile.email}  ·  TY ${year}`);

  let y = 100;
  y = wrap(doc, `${stateName(profile.fromState)}  →  ${stateName(profile.targetState)}`, 40, y, 520, 13, "#0f172a");
  y = wrap(
    doc,
    `Filing status: ${profile.filingStatus === "married_jointly" ? "Married filing jointly" : "Single"}   ·   Reported income (calc): ${profile.annualIncome.toLocaleString()}`,
    40,
    y + 6,
    520,
    10,
    "#334155",
  );

  y += 16;
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(40, y, 532, 70, 6, 6, "F");
  doc.setTextColor(6, 95, 70);
  doc.setFontSize(9);
  doc.text("DAY COUNTS (self-reported)", 52, y + 18);
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`Target (${profile.targetState}): ${counts.target}`, 52, y + 42);
  doc.text(`Former (${profile.fromState}${profile.watchState ? ` + ${profile.watchState}` : ""}): ${counts.former}`, 220, y + 42);
  doc.text(`Other: ${counts.other}`, 430, y + 42);
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("183 days is a common rule of thumb, not the only domicile test.", 52, y + 60);
  y += 92;

  y = wrap(doc, "Timeline of target-state presence", 40, y, 520, 12, "#0f172a");
  const targetDays = presence
    .filter((p) => p.bucket === "target")
    .sort((a, b) => a.date.localeCompare(b.date));
  if (targetDays.length === 0) {
    y = wrap(doc, "No target-state nights logged this year.", 40, y + 4, 520, 10, "#64748b");
  } else {
    const line = targetDays.map((d) => d.date).join("   ");
    y = wrap(doc, line, 40, y + 8, 520, 9, "#334155");
  }

  y += 16;
  y = wrap(doc, "Exhibit index (filenames — files are not embedded)", 40, y, 520, 12, "#0f172a");
  y += 6;
  if (evidence.length === 0) {
    y = wrap(doc, "No vault files indexed.", 40, y, 520, 10, "#64748b");
  } else {
    evidence.slice(0, 28).forEach((e, i) => {
      if (y > 700) {
        doc.addPage();
        y = 56;
      }
      y = wrap(
        doc,
        `${i + 1}.  ${e.fileName}   ·   ${e.category}   ·   ${formatDate(e.evidenceDate)}   ·   ${e.jurisdiction || "—"}`,
        40,
        y,
        520,
        9,
        "#1e293b",
      );
    });
  }

  doc.addPage();
  header(doc, "Disclaimer", "Read before you send this to anyone");
  wrap(doc, DISCLAIMER_LONG, 40, 100, 532, 10, "#1e293b");

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    footer(doc, i, total);
  }

  downloadBlob(doc.output("blob"), `NomadShield-defense-${year}.pdf`);
}

export function downloadPacket(profile: Profile, countyId?: string) {
  const doc = setup();
  const county = FL_COUNTIES.find((c) => c.id === countyId);
  const title =
    profile.targetState === "FL"
      ? "Declaration of Domicile — ready-to-sign packet"
      : profile.targetState === "TX"
        ? "Texas residency file — summary packet"
        : "South Dakota residency affidavit — playbook packet";

  header(doc, title, "Not an e-file  ·  You or your CPA file");
  let y = 100;
  y = wrap(doc, "COVER SHEET", 40, y, 520, 11, "#047857");
  y = wrap(doc, `Name: ${profile.fullName || "—"}`, 40, y + 8, 520, 11);
  y = wrap(doc, `Former domicile: ${stateName(profile.fromState)}`, 40, y, 520, 11);
  y = wrap(doc, `Claimed domicile: ${stateName(profile.targetState)}`, 40, y, 520, 11);
  y = wrap(doc, `Mailing address:\n${formatAddress(profile.mailboxAddress) || "—"}`, 40, y, 520, 11);
  if (profile.targetState === "FL") {
    y = wrap(
      doc,
      `County clerk: ${county ? `${county.name} — ${county.clerk}` : "Select a county in the app"}`,
      40,
      y + 6,
      520,
      11,
    );
    if (county) y = wrap(doc, `Clerk site: ${county.clerkUrl}`, 40, y, 520, 10, "#334155");
  }

  y += 18;
  y = wrap(doc, "FIELD-MAPPED SUMMARY (for you to copy onto the official form)", 40, y, 520, 11, "#047857");
  y = wrap(
    doc,
    [
      `Legal name: ${profile.fullName || "________________"}`,
      `Florida / target address: ${formatAddress(profile.mailboxAddress).replace(/\n/g, ", ") || "________________"}`,
      `Last driver-license state: ${stateName(profile.fromState)}`,
      `Date became resident of ${stateName(profile.targetState)}: ______________`,
      `I am a citizen of the United States: Yes / No`,
      `I reside at the address above and it is my permanent home: Yes / No`,
    ].join("\n"),
    40,
    y + 8,
    520,
    11,
  );

  y += 16;
  y = wrap(doc, "FILING CHECKLIST", 40, y, 520, 11, "#047857");
  const checks =
    profile.targetState === "FL"
      ? [
          "Complete the county’s official Declaration of Domicile form (do not file this cover sheet alone).",
          "Sign in front of a notary if the county requires it.",
          "File with the clerk of the circuit court; pay their fee.",
          "Upload the stamped copy to the NomadShield vault.",
          "NomadShield did not submit this to any government.",
        ]
      : profile.targetState === "TX"
        ? [
            "Texas has no statewide declaration of domicile.",
            "Keep copies of your Texas DL, voter registration, and CMRA/lease.",
            "If you own a Texas home, look up homestead with the local appraisal district.",
            "NomadShield did not submit this to DPS or any county.",
          ]
        : [
            "Read the 2026 SD risk memo in the app before spending a notary fee.",
            "If a county or DMV requests an affidavit, complete their form — not this summary.",
            "One hotel night is not a defense file.",
            "NomadShield did not submit this to SD DPS.",
          ];
  y = wrap(doc, checks.map((c, i) => `${i + 1}. ${c}`).join("\n"), 40, y + 8, 520, 11);

  y += 20;
  wrap(doc, DISCLAIMER_SHORT, 40, Math.min(y, 680), 520, 8, "#64748b");
  footer(doc, 1, 1);
  downloadBlob(doc.output("blob"), `NomadShield-packet-${profile.targetState}.pdf`);
}

export function downloadLetterPdf(subject: string, body: string) {
  const doc = setup();
  header(doc, "Severing-ties letter", subject);
  wrap(doc, body, 40, 100, 532, 11);
  wrap(doc, DISCLAIMER_SHORT, 40, 720, 532, 8, "#64748b");
  footer(doc, 1, 1);
  downloadBlob(doc.output("blob"), `${subject.replace(/[^\w]+/g, "-").slice(0, 40)}.pdf`);
}
