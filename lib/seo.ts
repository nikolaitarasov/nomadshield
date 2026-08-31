export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export const DEFAULT_TITLE =
  "NomadShield — domicile playbooks and audit protection for US nomads";
export const DEFAULT_DESCRIPTION =
  "Self-serve US tax-domicile playbooks and a 183-day audit vault for digital nomads leaving CA, NY, and other high-tax states. Keep the mailbox you already have. $49 Migration Kit + $19/mo Audit Shield. Florida, Texas, and South Dakota — not a CPA.";

export const SAVVY_FAQS: { q: string; a: string }[] = [
  {
    q: "What is SavvyNomad?",
    a: "SavvyNomad is a Florida domicile and mailbox concierge. They provide a Florida residential-style address, mail forwarding, help with a Declaration of Domicile, driver-license and vehicle guidance, and access to CPA chat. That is a full-service bundle: address plus humans plus paper. Public plans are typically a monthly subscription.",
  },
  {
    q: "Is NomadShield the same as SavvyNomad?",
    a: "No — complementary, not a clone. SavvyNomad is a concierge mailbox service. NomadShield is software: a 6-step domicile playbook, generated packets and letters, and an Audit Shield 183-day evidence vault. If you already have Anytime Mailbox, PostScan Mail, iPostal1, Traveling Mailbox, Escapees, or US Global Mail, you can keep it and use NomadShield for the checklist and the year-after file.",
  },
  {
    q: "SavvyNomad vs NomadShield — which should I use?",
    a: "SavvyNomad is a strong fit if you want one team to issue a Florida address, forward mail, and walk you through notary and DMV. NomadShield is a strong fit if you already have a mailbox, you want to work through a state-specific checklist yourself, and you want a calendar and exhibit log after you move. Some people use a mailbox service for paper and NomadShield for the playbook. That is a reasonable split.",
  },
  {
    q: "How does pricing compare?",
    a: "SavvyNomad charges a monthly subscription because they operate mail and concierge. NomadShield charges for software: $0 for the calculator, $49 one-time for the Migration Kit, and $19/mo or $190/yr for Audit Shield. We do not forward your mail, so there is no scan or postage line item.",
  },
  {
    q: "What about South Dakota?",
    a: "Several Florida concierge services, including SavvyNomad, have stepped back from South Dakota after payroll, banking, and DMV friction. NomadShield still includes an SD playbook so you can see the steps, with explicit 2026 risk warnings. Florida is our primary recommendation, especially for W-2 employees. Texas is the secondary playbook.",
  },
  {
    q: "Can I use NomadShield if I already have a Florida address?",
    a: "Yes. Paste the CMRA address exactly as printed (PMB vs suite matters), generate remaining packets and letters, and log nights in Audit Shield. An address is one fact in a domicile file. Presence, DL, voter registration, and severed ties are the rest.",
  },
];
