export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; text: string };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  body: BlogBlock[];
};

export const POSTS: BlogPost[] = [
  {
    slug: "california-to-florida-domicile-2026",
    title: "How to change tax domicile from California to Florida in 2026",
    description:
      "A practical 2026 checklist for leaving California tax residency for Florida: address, 183-day log, driver license, voter registration, and what FTB actually looks at. Not tax advice.",
    date: "2026-08-31",
    tags: ["California", "Florida", "domicile", "FTB"],
    body: [
      {
        type: "callout",
        text: "NomadShield is a compliance workflow tool, not a CPA or law firm. Domicile is facts-and-circumstances. Completing a checklist does not guarantee FTB will accept the change. You or your CPA file government forms.",
      },
      {
        type: "p",
        text: "If you work remotely and live out of a suitcase, “I got a Florida mailbox” is not a California exit. The Franchise Tax Board treats former residents as a facts file: where you sleep, vote, license, keep a home, see doctors, and where your employer withholds. Florida has no wage income tax. California’s top rate is 13.3%. The spread is why this search exists — and why FTB audits leavers.",
      },
      {
        type: "p",
        text: "This is the order of operations we use in NomadShield’s Florida playbook. Use it as a map, then have a professional look at your facts if you still own a California home, have equity compensation, or are a W-2 employee on a California payroll.",
      },
      { type: "h2", text: "1. Get a real Florida address you control" },
      {
        type: "p",
        text: "You need a Florida mailing address that banks and FLHSMV will print. A commercial mail-receiving agency (CMRA) is common for nomads. Paste it exactly as the provider prints it. PMB vs suite vs apartment is not cosmetic — banks reject obvious CMRA wording, and some DMV offices are picky.",
      },
      {
        type: "p",
        text: "You already pay $10–20/mo at Anytime Mailbox, PostScan Mail, iPostal1, Traveling Mailbox, Escapees, or US Global Mail. NomadShield is built around bring-your-own mail, so you can keep that provider. Form 1583 (USPS CMRA authorization) still has to be notarized with them.",
      },
      { type: "h2", text: "2. Log physical presence — a Florida PMB is not a day count" },
      {
        type: "p",
        text: "California does not use a single 183-day on/off switch for domicile. Presence still matters. If you spend most nights in California, keep a California home, and visit Florida twice a year, FTB will not be impressed by a Brickell PMB. Plan a Florida trip around a driver-license appointment. Keep lodging, boarding passes, and fuel receipts.",
      },
      {
        type: "p",
        text: "New Yorkers: 183 days plus a permanent place of abode is a separate statutory-residency test. Californians: think “facts,” not a magic number. NomadShield’s Audit Shield still logs three buckets (Florida / former state / everywhere else) because auditors count days even when the legal test is broader.",
      },
      { type: "h2", text: "3. Florida driver license within about 30 days" },
      {
        type: "p",
        text: "Florida generally expects new residents to get a Florida driver license within 30 days of becoming residents. That means showing up. FLHSMV publishes new-resident requirements and office locations. We store the appointment date you pick; we do not book the DMV and we do not e-file.",
      },
      {
        type: "ul",
        items: [
          "Read FLHSMV new-resident instructions before you fly.",
          "Bring identity, SSN, and two proofs of Florida address.",
          "Skip vehicle title/registration if you do not keep a US-plated car — common for nomads.",
          "Upload the new license image to your evidence vault after the visit.",
        ],
      },
      { type: "h2", text: "4. Voter registration, banks, IRS 8822, and W-2 payroll" },
      {
        type: "p",
        text: "Register to vote in Florida. Generate a cancellation letter to your former California county. Update your primary bank and at least two other institutions. File IRS Form 8822 so federal mail follows you — that form does not, by itself, change domicile.",
      },
      {
        type: "p",
        text: "W-2 remote employees: talk to HR and payroll about work location and multi-state withholding. A mailbox does not take you off California wage tax by itself. Do not assume you can stay on a CA payroll and owe $0.",
      },
      { type: "h2", text: "5. Sever ties FTB actually finds" },
      {
        type: "p",
        text: "Gyms, clubs, library cards, professional licenses, insurance, your CPA, doctors, and utilities. Generate letters, send them, keep the stubs. This is the boring work that makes a domicile file look like you meant it.",
      },
      { type: "h2", text: "6. Declaration of Domicile — you file it, not us" },
      {
        type: "p",
        text: "Florida’s Declaration of Domicile is filed with the clerk of the circuit court in the county of your Florida address. NomadShield generates a ready-to-sign cover sheet, field summary, and filing checklist, plus clerk links for common counties (Miami-Dade, Broward, Palm Beach, Orange, Hillsborough, and others). We do not e-file. Upload the stamped copy to the vault.",
      },
      { type: "h2", text: "What California still has after you leave" },
      {
        type: "ul",
        items: [
          "A home you still own or rent in California is a classic domicile hook.",
          "A spouse or minor children remaining in California is a loud fact.",
          "California-source income (a business with a California office, California real estate) can still be taxed even if you are a nonresident.",
          "Part-year returns exist. The year you leave is rarely a clean January 1 story.",
        ],
      },
      {
        type: "p",
        text: "Run the NomadShield calculator before you talk to anyone. Then use the Florida 6-step engine and keep the 183-day log all year. If your facts are messy — house, RSUs, a California S-corp — book a CPA partner instead of trusting a blog post.",
      },
    ],
  },
  {
    slug: "183-day-rule-digital-nomads",
    title: "The 183-day rule for digital nomads (it is not a safe harbor)",
    description:
      "What the 183-day rule actually means for US digital nomads: New York statutory residency, California domicile, how to log days, and why a mailbox is not a defense file.",
    date: "2026-08-31",
    tags: ["183 days", "New York", "California", "audit"],
    body: [
      {
        type: "callout",
        text: "183 days is a common rule of thumb, not the only domicile test, and not a safe harbor. NomadShield logs days because auditors do — and we say so on every results view.",
      },
      {
        type: "p",
        text: "Search “183-day rule digital nomad” and you will find two different ideas glued together. One is New York’s statutory residency test. The other is a folk version of domicile: stay out of California (or New Jersey, Minnesota, Illinois) for 183 days and you are free. Only the first is a statute. The second is a heuristic that will not save you if the rest of your life still lives in the high-tax state.",
      },
      { type: "h2", text: "New York: 183 days plus a place to live" },
      {
        type: "p",
        text: "New York statutory residency is generally: you spent 183 days or more in New York and you maintained a permanent place of abode there. Both prongs matter. A day in New York is usually any part of a day, with narrow exceptions (some people count transit carefully; do not improvise). NYC local tax is extra and is not in our calculator.",
      },
      {
        type: "p",
        text: "You can fail the 183-day test and still be a New York domiciliary if your home, family, and intent never left. You can also spend fewer than 183 days in New York, keep an apartment, and still get a notice. Day counts are necessary. They are not sufficient.",
      },
      { type: "h2", text: "California: domicile is a web of facts" },
      {
        type: "p",
        text: "California FTB does not hand you a 183-day hall pass. Domicile is where you intend your permanent home to be, evidenced by voter registration, driver license, home, spouse, doctors, clubs, business, and where you actually are. Former-resident units are aggressive. A Florida or Texas address with 200 California nights is a weak file.",
      },
      {
        type: "p",
        text: "Illinois is a flat-tax state that still audits leavers. New Jersey and Minnesota sit in the same high-audit bucket we highlight in the calculator. If your from-state is one of those, log the year as if someone will ask.",
      },
      { type: "h2", text: "How to log days without lying to yourself" },
      {
        type: "ol",
        items: [
          "Pick a tax year (usually calendar).",
          "Every night gets one bucket: target domicile state, former high-tax state(s), or everywhere else (other US + foreign).",
          "If you lived in two high-tax states, use a second watch state (for example CA plus NY).",
          "Attach a note and a receipt when you can: hotel folio, boarding pass, coworking day pass.",
          "Watch the running total. Approaching 183 in the former state is a warning, not a cliff you can tiptoe past on day 182.",
        ],
      },
      {
        type: "p",
        text: "NomadShield Audit Shield is that calendar plus a 5 GB vault and a 1-click defense PDF (cover, day counts, timeline, exhibit index, disclaimer). It does not replace a CPA. It means you are not reconstructing January from memory next April.",
      },
      { type: "h2", text: "What 183 days does not fix" },
      {
        type: "ul",
        items: [
          "A house you still own in the former state.",
          "W-2 payroll that never changed work location.",
          "A spouse and kids who never left.",
          "Voting, licensing, and doctors that still say California or New York.",
          "Foreign earned income exclusion (FEIE) — that is federal Form 2555, not a state domicile switch.",
        ],
      },
      {
        type: "p",
        text: "If you are leaving NY or CA this year, run the calculator, start the day log on day one, and keep the receipts. The mailbox can wait. The calendar cannot.",
      },
    ],
  },
  {
    slug: "south-dakota-vs-florida-domicile-2026",
    title: "South Dakota vs Florida domicile in 2026",
    description:
      "Payroll, banking, and DMV practice around virtual South Dakota addresses has tightened. Why NomadShield treats Florida as the primary playbook, with Texas second and SD documented in the open.",
    date: "2026-08-31",
    tags: ["South Dakota", "Florida", "SavvyNomad", "2026"],
    body: [
      {
        type: "callout",
        text: "NomadShield still ships a South Dakota playbook so you can see the steps. We do not recommend SD as the default, especially for W-2 employees. Florida is primary. Texas is secondary.",
      },
      {
        type: "p",
        text: "For years a common pitch was: spend one night in South Dakota, open a virtual mailbox, and stop paying California. Legislation, DMV practice, banks, and payroll providers have all gotten stricter about that pattern. Several Florida concierge services, including SavvyNomad, no longer offer South Dakota. If you are weighing SD vs Florida in 2026, this is the practical version.",
      },
      { type: "h2", text: "What broke with the South Dakota mailbox play" },
      {
        type: "ul",
        items: [
          "Payroll companies started flagging SD CMRA addresses for remote W-2 employees.",
          "Banks rejected obvious virtual-mailbox wording more often.",
          "DMV physical-presence expectations tightened. Do not assume a CMRA letter gets you a license by mail.",
          "The “one hotel night” story was never audit-proof against CA or NY facts tests. It is less persuasive now.",
        ],
      },
      {
        type: "p",
        text: "South Dakota still has no wage income tax. That part did not change. What changed is the cost of using an SD PMB as your only story. A cheap state on paper is expensive if ADP will not withhold correctly or Chase will not open the account.",
      },
      { type: "h2", text: "Florida as the default playbook" },
      {
        type: "p",
        text: "Florida also has no wage income tax. It has a Declaration of Domicile you file with a county clerk, a 30-day driver-license expectation, and generally smoother banking with residential-style CMRAs. That is why NomadShield treats Florida as primary, and why Florida concierge services focus there too. NomadShield’s difference is software: keep Anytime Mailbox, PostScan, iPostal1, Traveling Mailbox, Escapees, or US Global Mail, and use the playbook plus a 183-day vault for the year after you move.",
      },
      { type: "h2", text: "When Texas is the better second choice" },
      {
        type: "p",
        text: "Texas has no statewide declaration of domicile. Your file is the DL, voter registration, and address. Escapees in Livingston is a known nomad address — it is still a facts test, not a loophole. Texas is a strong secondary playbook for RV travelers and some business owners. New residents generally need a Texas license within 30 days.",
      },
      { type: "h2", text: "If you still choose South Dakota" },
      {
        type: "ol",
        items: [
          "Read the 2026 risk memo in the SD playbook (payroll, DL, banking, legislation).",
          "Log a real stay. Upload the lodging receipt. One night ≠ a defense file.",
          "Do not treat a Pierre or Sioux Falls PMB as something ADP and your bank must accept.",
          "W-2 employees: consider switching the playbook to Florida before you spend a notary fee.",
          "Keep an Audit Shield calendar anyway. CA and NY will not care that SD only asked for one night.",
        ],
      },
      {
        type: "p",
        text: "The useful question is not who has a clever South Dakota path. It is whether you want a bundled Florida mailbox and concierge, or a self-serve playbook and 183-day vault on top of a mailbox you already pay for. Both are legitimate. They solve different parts of the move.",
      },
    ],
  },
];

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}

export function allSlugs() {
  return POSTS.map((p) => p.slug);
}
