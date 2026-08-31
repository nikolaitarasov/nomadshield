import { JsonLd } from "@/components/json-ld";
import { MarketingShell } from "@/components/marketing";
import { DisclaimerNote } from "@/components/ui";
import { SAVVY_FAQS, siteUrl } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

const canonical = `${siteUrl()}/savvy-nomad`;

export const metadata: Metadata = {
  title: {
    absolute: "NomadShield and SavvyNomad — two ways to set up a US domicile",
  },
  description:
    "SavvyNomad is a Florida mailbox and concierge. NomadShield is domicile software: a 6-step playbook, generated packets, and a 183-day audit vault. Keep the mailbox you already have. $49 kit + $19/mo Shield.",
  keywords: [
    "SavvyNomad alternative",
    "Savvy Nomad alternative",
    "SavvyNomad vs NomadShield",
    "Florida domicile digital nomad",
    "US tax domicile software",
  ],
  alternates: { canonical },
  openGraph: {
    url: canonical,
    title: "NomadShield and SavvyNomad compared",
    description:
      "Concierge mailbox vs self-serve playbook and 183-day audit file. Different products; pick the one that matches how you already get mail.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "NomadShield and SavvyNomad compared",
    description:
      "SavvyNomad handles Florida mail and concierge. NomadShield is the checklist, packets, and year-after log — on top of the mailbox you already pay for.",
  },
};

const TABLE: [string, string, string][] = [
  ["Model", "Florida address + mail forwarding + concierge", "Software playbook + audit vault; you bring the mailbox"],
  ["Best if", "You want one team to issue an address, forward paper, and walk you through notary and DMV", "You already have a virtual mailbox and want a self-serve checklist plus a day log"],
  ["States", "Florida-first (South Dakota no longer offered)", "Florida primary, Texas secondary, South Dakota playbook with 2026 context"],
  ["Mail", "Included with the subscription", "Bring-your-own: Anytime Mailbox, PostScan, iPostal1, Traveling Mailbox, Escapees, US Global Mail"],
  ["Pricing", "Monthly subscription for mail + concierge (plans vary)", "Free calculator · $49 one-time Migration Kit · $19/mo or $190/yr Audit Shield"],
  ["After the move", "Ongoing mail + compliance alerts + CPA chat minutes", "183-day calendar, evidence vault, 1-click defense PDF"],
  ["How you work", "Signup, then humans (notary, mail, guidance)", "Checklist and letters generate in the same session; humans optional"],
];

export default function SavvyNomadPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "NomadShield and SavvyNomad compared",
      url: canonical,
      description:
        "How NomadShield (domicile software) relates to SavvyNomad (Florida mailbox concierge) for US digital nomads changing tax domicile.",
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
        { "@type": "ListItem", position: 2, name: "Compared with SavvyNomad", item: canonical },
      ],
    },
  ];

  return (
    <MarketingShell>
      <JsonLd data={jsonLd} />
      <article className="mx-auto max-w-3xl px-4 py-14">
        <p className="text-[11px] font-medium uppercase tracking-wider text-accent">Compared with SavvyNomad</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Same problem. Different product.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          If you searched <strong className="text-foreground">SavvyNomad</strong> (Savvy Nomad) you are looking for a
          clean way to leave a high-tax state. They are a respected Florida mailbox and concierge. NomadShield is
          software: a self-serve domicile playbook, generated packets, and a 183-day audit vault you can run on top of
          the mailbox you already have.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/checkout/start?plan=kit"
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

        <h2 className="mt-14 text-2xl font-semibold">What SavvyNomad does well</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          SavvyNomad is a Florida domicile and mailbox concierge. You get a Florida residential-style address, mail
          handled for you, help with a Declaration of Domicile, driver-license and vehicle guidance, and CPA chat. If
          you want one vendor for paper plus people, that bundle is built for you. Their service is a monthly
          subscription because they operate mail and concierge. They are Florida-first; South Dakota is no longer part
          of that offering, which matches where a lot of the industry has landed in 2026.
        </p>

        <h2 className="mt-12 text-2xl font-semibold">What NomadShield adds</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
          <li>
            <strong className="text-foreground">Bring-your-own mailbox.</strong> Keep Anytime Mailbox, PostScan Mail,
            iPostal1, Traveling Mailbox, Escapees, or US Global Mail. We organize the domicile file; we do not replace
            your mail service.
          </li>
          <li>
            <strong className="text-foreground">A savings number before you talk to anyone.</strong> The public
            calculator estimates former-state tax and an audit-risk score from your facts.
          </li>
          <li>
            <strong className="text-foreground">Same-session playbook.</strong> Six state-specific steps, generated
            letters, and a ready-to-sign packet. You or your CPA file — we do not e-file.
          </li>
          <li>
            <strong className="text-foreground">The year after the move.</strong> Audit Shield is a 183-day log, evidence
            vault, and defense PDF. A Florida address is one fact. The calendar is the rest.
          </li>
          <li>
            <strong className="text-foreground">Florida, Texas, and a cautious South Dakota playbook.</strong> SD is
            documented with 2026 payroll / banking / DMV context. Florida is our usual recommendation for W-2 employees.
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

        <h2 className="mt-12 text-2xl font-semibold">How NomadShield is priced</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Their monthly fee covers mail and concierge. Ours covers software only, which is why it is a one-time kit plus
          an optional Shield subscription — useful if you already pay a mailbox provider.
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

        <h2 className="mt-12 text-2xl font-semibold">South Dakota in 2026</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Payroll providers, banks, and DMV practice have tightened around virtual South Dakota addresses. Several
          Florida concierge services, SavvyNomad among them, no longer offer SD. NomadShield still includes the playbook
          so you can see the steps, with risk callouts in the open. For most W-2 remote employees,{" "}
          <strong className="text-foreground">Florida is the more practical default</strong> for banking and payroll.
          One hotel night is not an audit file — that is true in any state.
        </p>

        <h2 className="mt-12 text-2xl font-semibold">If you already have a Florida address</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">
          <li>Keep the CMRA you actually want. Paste it exactly as printed — PMB vs suite matters for banks.</li>
          <li>Run the NomadShield calculator so you see a savings estimate before you talk to anyone.</li>
          <li>Work the 6-step engine: presence, DL, voter, banks, severing-ties letters, Declaration of Domicile packet.</li>
          <li>Turn on Audit Shield and log nights. CA and NY look at the year, not only the address.</li>
        </ol>
        <p className="mt-3 text-sm text-muted">
          We do not e-file government forms. You or your CPA file. If you want a human, join the CPA-partner waitlist.
        </p>

        <h2 className="mt-12 text-2xl font-semibold">FAQ</h2>
        <div className="mt-4 space-y-3">
          {SAVVY_FAQS.map((f) => (
            <details key={f.q} className="surface p-5">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="surface mt-12 p-6">
          <h2 className="text-xl font-semibold">Keep the mailbox. Add the playbook.</h2>
          <p className="mt-2 text-sm text-muted">
            NomadShield is a compliance workflow tool — not a CPA, law firm, or tax-advice product. Domicile is
            facts-and-circumstances. A checklist does not guarantee a state will accept the change.
          </p>
          <Link
            href="/checkout/start?plan=kit"
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
  "Self-serve US tax-domicile playbooks and 183-day audit vault for digital nomads leaving high-tax states.";
