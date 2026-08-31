import { Calculator, ShieldDemo } from "@/components/calculator";
import { JsonLd } from "@/components/json-ld";
import { MarketingShell } from "@/components/marketing";
import { Card } from "@/components/ui";
import { POSTS } from "@/lib/blog";
import { DEFAULT_DESCRIPTION, siteUrl } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const STEPS = [
  { n: "01", title: "Address & mail", body: "Connect Anytime Mailbox, PostScan, iPostal1, Traveling Mailbox, Escapees, or US Global Mail. Or type the address. We do not make you rent ours." },
  { n: "02", title: "Physical presence", body: "Plan the trip. Log nights. Florida and Texas get a DL window. South Dakota gets an honest 1-night tracker — and a warning that 1 night is not a defense." },
  { n: "03", title: "Driver’s license & vehicle", body: "Official DMV links, an appointment date field, a generated cover sheet. Vehicle is skippable. We never pretend we booked the DMV." },
  { n: "04", title: "Voter & banking", body: "State portals, a former-state cancellation letter, bank-update checklist, and a W-2 HR callout that does not lie about payroll." },
  { n: "05", title: "Severing ties", body: "Gym, library, licenses, insurance, CPA, doctors, utilities, employer. Generate letters. Toggle sent." },
  { n: "06", title: "Declaration / residency file", body: "Florida: county clerk packet. Texas: residency file. South Dakota: affidavit playbook with 2026 risk in the open." },
];

export default function HomePage() {
  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "NomadShield",
          url: siteUrl(),
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description: DEFAULT_DESCRIPTION,
          offers: {
            "@type": "AggregateOffer",
            lowPrice: "0",
            highPrice: "190",
            priceCurrency: "USD",
          },
        }}
      />
      <section className="relative overflow-hidden bg-glow">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-70" />
        <div className="relative mx-auto grid max-w-6xl items-start gap-8 px-4 pb-16 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pt-16">
          <div className="order-2 animate-fade-up lg:order-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
              SavvyNomad alternative · US nomads leaving CA, NY, NJ, IL, MN, MA
            </p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Leave the high-tax state.
              <span className="block text-accent">Keep the proof.</span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
              NomadShield is domicile software: a self-serve playbook, generated packets, and a 183-day audit vault.
              You already pay $10–20/mo for a mailbox. Don’t pay another $90 to rent theirs.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted">
              <li>— Transparent flat pricing. No scan overages, notary surprises, or “essential mail only.”</li>
              <li>— Humans are optional. Checklists and letters generate in the same session.</li>
              <li>— Florida primary, Texas secondary, South Dakota with the warnings SavvyNomad learned the hard way.</li>
            </ul>
            <div className="mt-8 hidden gap-3 lg:flex">
              <a
                href="#calculator"
                className="inline-flex h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg hover:bg-accent-hover"
              >
                Run the calculator
              </a>
              <Link
                href="/compare"
                className="inline-flex h-11 items-center rounded-lg border border-border px-4 text-sm hover:bg-muted-bg"
              >
                vs SavvyNomad
              </Link>
            </div>
          </div>
          <div className="order-1 animate-fade-up lg:order-2 lg:pt-2">
            <Calculator />
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-[11px] font-medium uppercase tracking-wider text-accent">How domicile actually works</p>
        <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight">
          A checklist does not move your domicile. Facts do. We organize the facts.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              t: "Domicile is intent + facts",
              d: "Where you live, vote, bank, license, keep doctors, and spend nights. A Florida PMB without those facts is just mail forwarding.",
            },
            {
              t: "CA and NY audit leavers",
              d: "Former-resident units look at the calendar, the house you still own, W-2 payroll, and the gym you forgot to cancel. An address is not a defense file.",
            },
            {
              t: "183 days is a rule of thumb",
              d: "Useful. Not a safe harbor. Statutory residency (especially NY) and domicile tests can both apply. We log days and still tell you that.",
            },
          ].map((x) => (
            <Card key={x.t}>
              <h3 className="font-medium">{x.t}</h3>
              <p className="mt-2 text-sm text-muted">{x.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-3xl font-semibold tracking-tight">Six steps. State-specific. Same session.</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Signup, notary queues, and “your concierge will email you” are someone else’s product. Ours generates the
          next document before you close the tab.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s) => (
            <Card key={s.n}>
              <p className="font-mono text-xs text-accent">{s.n}</p>
              <h3 className="mt-1 font-medium">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-16 lg:grid-cols-2">
        <ShieldDemo />
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-accent">The wedge</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Post-move protection is the product.</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Bundled mailbox services will help you get a Florida address. They barely productize the year after: the
            nights, the receipts, the exhibit list you wish you had when a notice shows up. Audit Shield is that file —
            $19/mo, or $190/yr.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>— Three buckets: target state, former high-tax state(s), everywhere else.</li>
            <li>— Evidence vault by category: lodging, travel, medical, gym, fuel, mail, DL.</li>
            <li>— 1-click defense PDF: day counts, timeline, exhibit index, disclaimer page.</li>
          </ul>
          <Link href="/pricing" className="mt-6 inline-flex text-sm text-accent hover:underline">
            See Audit Shield pricing →
          </Link>
        </div>
      </section>

      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold">Flat pricing. Published here. Not in a sales call.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card>
              <p className="text-sm text-muted">Free</p>
              <p className="mt-1 text-3xl font-semibold">$0</p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li>Calculator + risk score</li>
                <li>Email capture of your Tax Blueprint</li>
              </ul>
            </Card>
            <Card className="border-accent/40 ring-1 ring-accent/20">
              <p className="text-sm text-accent">Migration Kit</p>
              <p className="mt-1 text-3xl font-semibold">
                $49 <span className="text-sm font-normal text-muted">one-time</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li>Full 6-step engine, one target state</li>
                <li>Form packets + letter generator</li>
                <li>BYO mailbox connect (preview)</li>
              </ul>
              <Link
                href="/checkout/start?plan=kit"
                className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-lg bg-accent text-sm font-medium text-accent-fg"
              >
                Start migration — $49
              </Link>
            </Card>
            <Card>
              <p className="text-sm text-muted">Audit Shield</p>
              <p className="mt-1 text-3xl font-semibold">
                $19 <span className="text-sm font-normal text-muted">/mo</span>
              </p>
              <p className="text-xs text-muted">or $190/yr</p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li>183-day logger + watch state</li>
                <li>5 GB evidence vault</li>
                <li>Defense PDF + in-app reminders</li>
              </ul>
            </Card>
          </div>
          <p className="mt-6 text-sm text-muted">
            Concierge is waitlist only. If you want a human,{" "}
            <Link href="/signup?waitlist=1" className="text-accent hover:underline">
              book a CPA partner
            </Link>{" "}
            — we will not fake a live CPA chat.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-semibold">Honest comparison</h2>
        <p className="mt-2 text-sm text-muted">Not a smear. Different product. Full table on the compare page.</p>
        <div className="mt-6 space-y-3 md:hidden">
          {[
            ["Model", "Bundled FL address + mail + concierge", "Software playbook + audit vault; mail optional"],
            ["States", "Florida-first (SD discontinued)", "FL / TX / SD playbooks"],
            ["Mail", "Proprietary warehouse; basic plan = essential mail only", "BYO mailbox via connect or manual address"],
            ["Pricing", "$55–$265/mo + extras (notary, vehicle, scans)", "Flat: Free calculator / $49 kit / $19/mo Shield"],
            ["After move", "Compliance alerts + limited CPA minutes", "183-day calendar, evidence vault, defense PDF"],
            ["Speed", "Signup + notary + wait on humans", "Instant checklist + generated letters the same session"],
          ].map((row) => (
            <div key={row[0]} className="surface p-4">
              <p className="text-xs font-medium text-muted">{row[0]}</p>
              <p className="mt-2 text-sm text-muted">
                <span className="text-foreground/70">SavvyNomad — </span>
                {row[1]}
              </p>
              <p className="mt-1.5 text-sm">
                <span className="text-accent">NomadShield — </span>
                {row[2]}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-border md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-card-2 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium"> </th>
                <th className="px-4 py-3 font-medium">SavvyNomad</th>
                <th className="px-4 py-3 font-medium text-accent">NomadShield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Model", "Bundled FL address + mail + concierge", "Software playbook + audit vault; mail optional"],
                ["States", "Florida-first (SD discontinued)", "FL / TX / SD playbooks"],
                ["Mail", "Proprietary warehouse; basic plan = essential mail only", "BYO mailbox via connect or manual address"],
                ["Pricing", "$55–$265/mo + extras (notary, vehicle, scans)", "Flat: Free calculator / $49 kit / $19/mo Shield"],
                ["After move", "Compliance alerts + limited CPA minutes", "183-day calendar, evidence vault, defense PDF"],
                ["Speed", "Signup + notary + wait on humans", "Instant checklist + generated letters the same session"],
              ].map((row) => (
                <tr key={row[0]} className="bg-card/40">
                  <td className="px-4 py-3 font-medium">{row[0]}</td>
                  <td className="px-4 py-3 text-muted">{row[1]}</td>
                  <td className="px-4 py-3">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link href="/compare" className="mt-4 inline-flex text-sm text-accent hover:underline">
          Add Escapees and DIY →
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="surface p-6 sm:p-8">
          <p className="text-[11px] font-medium uppercase tracking-wider text-accent">Searched Savvy Nomad?</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">We are the SavvyNomad alternative — not a cheaper warehouse.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            SavvyNomad is a Florida mailbox concierge. NomadShield is domicile software: keep Anytime Mailbox / PostScan /
            iPostal1 / Traveling Mailbox / Escapees, run a 6-step playbook the same session, and keep a 183-day audit
            file after you move. They discontinued South Dakota. We still tell you when Florida or Texas is safer.
          </p>
          <Link href="/savvy-nomad" className="mt-5 inline-flex text-sm text-accent hover:underline">
            SavvyNomad vs NomadShield — full write-up →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-accent">From the playbook</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Guides built to rank — and to be true</h2>
          </div>
          <Link href="/blog" className="hidden text-sm text-accent hover:underline sm:inline">
            All posts →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="surface p-5 hover:border-accent/30">
              <p className="text-xs text-muted">{formatDate(post.date)}</p>
              <h3 className="mt-2 font-medium">{post.title}</h3>
              <p className="mt-2 text-sm text-muted">{post.description}</p>
            </Link>
          ))}
        </div>
        <Link href="/blog" className="mt-4 inline-flex text-sm text-accent hover:underline sm:hidden">
          All posts →
        </Link>
      </section>
    </MarketingShell>
  );
}
