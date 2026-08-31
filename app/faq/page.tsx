import { JsonLd } from "@/components/json-ld";
import { MarketingShell } from "@/components/marketing";
import { DisclaimerNote } from "@/components/ui";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ — domicile, 183 days, SavvyNomad, W-2 payroll",
  description:
    "Is NomadShield legal? Do you need to visit Florida? What is 183 days? How does it relate to a mailbox concierge? W-2 payroll, FEIE, and mailbox FAQs for US digital nomads.",
  alternates: { canonical: "/faq" },
};

const FAQS = [
  {
    q: "Is this legal?",
    a: "Changing domicile is legal when the facts support it. Manufacturing a story around a mailbox is not a strategy we sell. NomadShield is a workflow tool: checklists, packets, a calendar, and a vault. It is not a CPA, law firm, or tax-advice product, and completing steps does not guarantee California, New York, or any other state will accept the change.",
  },
  {
    q: "Do I need to visit the new state?",
    a: "Usually yes, if you want a driver license and a file that survives an interview. Florida and Texas generally expect new residents to obtain a local DL within about 30 days of becoming residents. South Dakota’s old one-night folklore is not audit-proof — we make you log the stay and we still warn you.",
  },
  {
    q: "What is 183 days?",
    a: "A common physical-presence rule of thumb, and in New York a piece of the statutory-residency test (generally 183 days plus a permanent place of abode). It is not the only domicile test. Family, home, business, voter registration, licenses, and where you actually live can outweigh a day count. Audit Shield uses 183 as a heuristic and says so on every results view.",
  },
  {
    q: "I’m a W-2 remote employee. Can I keep a California (or New York) employer and owe $0?",
    a: "Do not count on it. Payroll, withholding, and your employer’s location are facts in the file. Some states tax residents on worldwide income; some look at workdays. We surface an HR / multi-state withholding callout. We do not promise you can stay on CA payroll and magically owe $0.",
  },
  {
    q: "Is the Foreign Earned Income Exclusion (FEIE) the same as changing domicile?",
    a: "No. FEIE is federal (IRS). State domicile is a separate facts-and-circumstances test. Living abroad can help a domicile story or it can be irrelevant if you kept a California home, spouse, and voter registration. NomadShield does not prepare Form 2555.",
  },
  {
    q: "Will you file my Declaration of Domicile / DMV / voter forms?",
    a: "No. We generate packets, instructions, county/DMV links, and a ready-to-sign summary. You or your CPA file. There is no government e-file in this product.",
  },
  {
    q: "Can I keep my current virtual mailbox?",
    a: "Yes. That is the point. Connect (preview) or paste the CMRA address exactly as printed — PMB vs suite matters for banks. NomadShield does not operate a mail facility.",
  },
  {
    q: "How is NomadShield different from a mailbox concierge like SavvyNomad?",
    a: "SavvyNomad is a Florida mailbox and concierge — a strong fit if you want one team for address, paper, and walkthroughs. NomadShield is software: a 6-step playbook, generated packets, and a 183-day audit vault. If you already have a virtual mailbox, you can keep it. Read the comparison page for the split.",
  },
  {
    q: "Why isn’t South Dakota the default?",
    a: "Payroll, banking, and DMV practice around virtual South Dakota addresses has tightened. Several Florida concierge services no longer offer SD. We still ship an SD playbook, with 2026 risk callouts. Florida is the usual recommendation for W-2 employees.",
  },
  {
    q: "Do I need a CPA?",
    a: "If you have equity compensation, a house in the former state, a business with employees there, or a notice already in the mail — yes, talk to a professional. Our concierge is a waitlist to book a CPA partner, not a fake chat widget.",
  },
];

export default function FaqPage() {
  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-[11px] font-medium uppercase tracking-wider text-accent">FAQ</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Straight answers. No domicile folklore.</h1>
        <div className="mt-10 space-y-4">
          {FAQS.map((f) => (
            <details key={f.q} className="surface p-5">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted">
          Comparing a mailbox concierge with software?{" "}
          <Link href="/savvy-nomad" className="text-accent hover:underline">
            NomadShield and SavvyNomad
          </Link>
          .
        </p>
        <DisclaimerNote className="mt-10" />
      </div>
    </MarketingShell>
  );
}
