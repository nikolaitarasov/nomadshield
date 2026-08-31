export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export const DEFAULT_TITLE =
  "NomadShield — SavvyNomad alternative for US digital nomads";
export const DEFAULT_DESCRIPTION =
  "SavvyNomad alternative: self-serve US tax-domicile playbooks and a 183-day audit vault. Keep the mailbox you already pay for. Flat $49 Migration Kit + $19/mo Audit Shield. Florida, Texas, and South Dakota — not a CPA.";

export const SAVVY_FAQS: { q: string; a: string }[] = [
  {
    q: "What is SavvyNomad?",
    a: "SavvyNomad is a Florida domicile and mailbox concierge. They bundle a proprietary Florida residential-style address, essential-mail forwarding, Declaration of Domicile help, driver-license / vehicle guidance, and limited CPA chat. Public pricing is typically about $55–$90/mo on basic/mid plans and about $265/mo on premium, plus extras such as notary, vehicle, renewal, and scan overages. They discontinued South Dakota domicile services after legislative, payroll, and DMV friction.",
  },
  {
    q: "Is NomadShield the same as SavvyNomad?",
    a: "No. NomadShield is software, not a warehouse. We do not force you onto a proprietary mailbox. You keep Anytime Mailbox, PostScan Mail, iPostal1, Traveling Mailbox, Escapees, or US Global Mail. We sell a 6-step domicile playbook, generated packets, and an Audit Shield 183-day evidence vault. SavvyNomad sells a bundled Florida address + mail + concierge.",
  },
  {
    q: "SavvyNomad vs NomadShield — which should I use?",
    a: "Choose SavvyNomad if you want one vendor to hand you a Florida address, forward paper, and walk you through notary on a concierge clock — and you do not already have a mailbox. Choose NomadShield if you already pay $10–20/mo for a virtual mailbox, you want published flat pricing, a same-session checklist, and a year-after audit file. Many people searching “Savvy Nomad” already have a mailbox; that is our customer.",
  },
  {
    q: "How much is SavvyNomad compared with NomadShield?",
    a: "SavvyNomad publicly runs about $55–$265/mo plus notary, vehicle, renewal, and scan extras. NomadShield is $0 to run the calculator, $49 one-time for the Migration Kit, and $19/mo or $190/yr for Audit Shield. We do not charge scan overages because we do not host your mail.",
  },
  {
    q: "Did SavvyNomad stop South Dakota?",
    a: "Yes. SavvyNomad discontinued SD services after legislative / payroll / DMV friction. NomadShield still ships a South Dakota playbook, but we do not recommend SD as the lazy default. Florida is primary, Texas is secondary, and the SD path carries explicit 2026 risk warnings — especially for W-2 employees.",
  },
  {
    q: "Can I switch from SavvyNomad and keep my Florida story?",
    a: "If you already have a Florida CMRA address you like, you do not have to rent SavvyNomad’s warehouse to keep using it. Paste the address into NomadShield (PMB vs suite matters), generate the remaining packets and letters, and log nights in Audit Shield. A Florida address is not a defense file — the calendar and exhibits are.",
  },
];
