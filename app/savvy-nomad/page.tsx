import { JsonLd } from "@/components/json-ld";
import { MarketingShell } from "@/components/marketing";
import { DisclaimerNote } from "@/components/ui";
import { SAVVY_FAQS, siteUrl } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

const canonical = `${siteUrl()}/savvy-nomad`;

export const metadata: Metadata = {
  title: {
    absolute: "SavvyNomad Alternative (2026) — NomadShield vs Savvy Nomad",
  },
  description:
    "Looking up SavvyNomad (Savvy Nomad) for a Florida domicile and mailbox? NomadShield is the software alternative: keep your mailbox, $49 setup + $19/mo audit vault, FL/TX/SD playbooks. Honest comparison — not a smear.",
  keywords: [
    "SavvyNomad alternative",
    "Savvy Nomad alternative",
    "SavvyNomad vs NomadShield",
    "Savvy Nomad Florida domicile",
    "SavvyNomad review",
    "Savvy Nomad pricing",
    "SavvyNomad South Dakota discontinued",
    "Savvy Nomad mailbox",
    "Florida domicile digital nomad",
    "US tax domicile software",
  ],
  alternates: { canonical },
  openGraph: {
    url: canonical,
    title: "SavvyNomad Alternative — NomadShield",
    description:
      "SavvyNomad bundles a Florida mailbox. NomadShield is the playbook + 183-day audit file. Keep the mailbox you already pay for.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "SavvyNomad Alternative — NomadShield",
    description:
      "Searched Savvy Nomad? Compare the warehouse concierge with self-serve domicile software and an audit vault.",
  },
};

const TABLE: [string, string, string][] = [
  ["Model", "Bundled Florida address + mail + concierge", "Software playbook + audit vault; mail optional"],
  ["Best if", "You want one vendor to hand you a Florida PMB and walk notary", "You already pay $10–20/mo for a mailbox and want the file"],
  ["States", "Florida-first (South Dakota discontinued)", "Florida primary, Texas secondary, South Dakota with 2026 warnings"],
  ["Mail", "Proprietary warehouse; basic plan is often essential mail only", "BYO: Anytime Mailbox, PostScan, iPostal1, Traveling Mailbox, Escapees, US Global Mail"],
  ["Pricing", "$55–$90/mo basic/mid, ~$265/mo premium + notary / vehicle / scans", "Free calculator · $49 Migration Kit · $19/mo or $190/yr Audit Shield"],
  ["After the move", "Compliance alerts + limited CPA minutes", "183-day calendar, evidence vault, 1-click defense PDF"],
  ["Speed", "Signup + notary + wait on humans", "Instant checklist + generated letters the same session"],
];

export default function SavvyNomadPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "SavvyNomad Alternative — NomadShield vs Savvy Nomad",
      url: canonical,
      description:
        "Honest 2026 comparison of SavvyNomad (Savvy Nomad) and NomadShield for US digital nomads changing tax domicile.",
      about: [
        { "@type": "Thing", name: "SavvyNomad" },
        { "@type": "Thing", name: "Savvy Nomad" },
        { "@type": "SoftwareApplication", name: "NomadShield" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "NomadShield",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: [
        { "@type": "Offer", name: "Migration Kit", price: "49", priceCurrency: "USD" },
        { "@type": "Offer", name: "Audit Shield", price: "19", priceCurrency: "USD", unitText: "MONTH" },
      ],
      description: DEFAULT_SOFTWARE_DESC,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: SAVVY_FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl() },
        { "@type": "ListItem", position: 2, name: "SavvyNomad alternative", item: canonical },
      ],
    },
  ];

  return (
    <MarketingShell>
      <JsonLd data={jsonLd} />
      <article className="mx-auto max-w-3xl px-4 py-14">
        <p className="text-[11px] font-medium uppercase tracking-wider text-accent">SavvyNomad · Savvy Nomad</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          SavvyNomad alternative for US digital nomads
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          If you searched <strong className="text-foreground">Savvy Nomad</strong> or{" "}
          <strong className="text-foreground">SavvyNomad</strong> for a Florida domicile, a virtual mailbox, or an
          escape from California / New York tax — you are in the right neighborhood. NomadShield is not a clone of
          their warehouse. It is the software they barely productized: a self-serve playbook and a 183-day audit file.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/signup?plan=kit"
            className="inline-flex h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg"
          >
            Start migration — $49
          </Link>
          <Link
            href="/#calculator"
            className="inline-flex h-11 items-center rounded-lg border border-border px-4 text-sm hover:bg-muted-bg"
          >
            See the savings number first
          </Link>
        </div>

        <h2 className="mt-14 text-2xl font-semibold">What SavvyNomad is (honestly)</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          SavvyNomad is a <em>Florida domicile + mailbox concierge</em>. The bundle is a proprietary Florida
          residential-style address, essential-mail forwarding on cheaper plans, help with a Declaration of Domicile,
          driver-license and vehicle guidance, and limited CPA chat. Public pricing is typically about{" "}
          <strong className="text-foreground">$55–$90/mo</strong> on basic/mid and about{" "}
          <strong className="text-foreground">$265/mo</strong> on premium, with extras for notary, vehicle, renewal, and
          scans. They{" "}
          <strong className="text-foreground">discontinued South Dakota</strong> after legislative, payroll, and DMV
          friction. That is a real product. It is not the only way to leave a high-tax state.
        </p>

        <h2 className="mt-12 text-2xl font-semibold">Why people searching “Savvy Nomad” land here</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
          <li>
            You already pay $10–20/mo for Anytime Mailbox, PostScan Mail, iPostal1, Traveling Mailbox, Escapees, or US
            Global Mail. Renting SavvyNomad’s warehouse on top of that is a second mailbox bill.
          </li>
          <li>
            You want the savings number and a checklist <em>tonight</em>, not a notary queue.
          </li>
          <li>
            You left (or are leaving) CA, NY, NJ, IL, MN, or MA and you know a Florida address is not a defense file
            when those states audit former residents.
          </li>
          <li>
            You heard South Dakota was the trick. SavvyNomad stopped offering it. We will still tell you when Florida
            or Texas is safer.
          </li>
        </ul>

        <h2 className="mt-12 text-2xl font-semibold">SavvyNomad vs NomadShield</h2>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-card-2 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium"> </th>
                <th className="px-4 py-3 font-medium">SavvyNomad</th>
                <th className="px-4 py-3 font-medium text-accent">NomadShield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {TABLE.map((row) => (
                <tr key={row[0]} className="align-top">
                  <td className="px-4 py-3 font-medium">{row[0]}</td>
                  <td className="px-4 py-3 text-muted">{row[1]}</td>
                  <td className="px-4 py-3">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted">
          Full four-way table (including Escapees and DIY) lives on the{" "}
          <Link href="/compare" className="text-accent hover:underline">
            compare page
          </Link>
          .
        </p>

        <h2 className="mt-12 text-2xl font-semibold">SavvyNomad pricing vs NomadShield pricing</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          We publish three numbers. SavvyNomad’s public range is a monthly mailbox-plus-concierge subscription with
          add-ons. If you keep your own CMRA, you are paying twice for mail if you also subscribe to theirs.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="surface p-4">
            <p className="text-xs text-muted">Free</p>
            <p className="text-2xl font-semibold">$0</p>
            <p className="mt-1 text-xs text-muted">Calculator + audit-risk score + Tax Blueprint</p>
          </div>
          <div className="surface border-accent/40 p-4 ring-1 ring-accent/20">
            <p className="text-xs text-accent">Migration Kit</p>
            <p className="text-2xl font-semibold">$49</p>
            <p className="mt-1 text-xs text-muted">One-time. 6-step engine, packets, letters, one target state.</p>
          </div>
          <div className="surface p-4">
            <p className="text-xs text-muted">Audit Shield</p>
            <p className="text-2xl font-semibold">
              $19<span className="text-sm font-normal text-muted">/mo</span>
            </p>
            <p className="mt-1 text-xs text-muted">or $190/yr · 183-day log, vault, defense PDF</p>
          </div>
        </div>

        <h2 className="mt-12 text-2xl font-semibold">South Dakota, SavvyNomad, and 2026</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          For years, “get a South Dakota mailbox and spend one night in a hotel” was the folklore. SavvyNomad
          discontinued SD. Payroll providers, banks, and DMV practice tightened around virtual/CMRA addresses. NomadShield
          still includes an SD playbook so you can see the steps — with warnings, not a wink. W-2 remote employees:{" "}
          <strong className="text-foreground">Florida is usually the safer default</strong> for banking and payroll
          acceptance. One hotel night is not an audit file.
        </p>

        <h2 className="mt-12 text-2xl font-semibold">Switching off SavvyNomad without blowing up the story</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">
          <li>Keep (or reconnect) the Florida CMRA you actually want. Paste it exactly as printed — PMB vs suite matters.</li>
          <li>Run the NomadShield calculator so you see a savings estimate before you talk to anyone.</li>
          <li>Finish the 6-step engine: presence, DL, voter, banks, severing-ties letters, Declaration of Domicile packet.</li>
          <li>Turn on Audit Shield and log nights. CA and NY audit leavers. The mailbox will not testify for you.</li>
        </ol>
        <p className="mt-3 text-sm text-muted">
          We do not e-file government forms. You or your CPA file. Concierge is a CPA-partner waitlist, not a fake live
          chat.
        </p>

        <h2 className="mt-12 text-2xl font-semibold">Savvy Nomad FAQ</h2>
        <div className="mt-4 space-y-3">
          {SAVVY_FAQS.map((f) => (
            <details key={f.q} className="surface p-5">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="surface mt-12 p-6">
          <h2 className="text-xl font-semibold">Searched SavvyNomad. Keep the mailbox. Buy the file.</h2>
          <p className="mt-2 text-sm text-muted">
            NomadShield is a compliance workflow tool — not a CPA, law firm, or tax-advice product. Domicile is
            facts-and-circumstances. A checklist does not guarantee a state will accept the change.
          </p>
          <Link
            href="/signup?plan=kit"
            className="mt-5 inline-flex h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg"
          >
            Start migration — $49
          </Link>
        </div>
        <DisclaimerNote className="mt-8" />
      </article>
    </MarketingShell>
  );
}

const DEFAULT_SOFTWARE_DESC =
  "Self-serve US tax-domicile playbooks and 183-day audit vault. SavvyNomad alternative for digital nomads leaving high-tax states.";
