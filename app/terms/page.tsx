import { LegalPage } from "@/components/legal-page";
import { OWNER } from "@/lib/constants";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for NomadShield, a product of SwiftAppLab LLC. Software workflow tool — not a CPA, law firm, or tax-advice product.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "August 31, 2026";

export default function TermsPage() {
  return (
    <LegalPage kicker="Legal" title="Terms of Service" updated={UPDATED}>
      <section>
        <h2>1. Agreement</h2>
        <p>
          These Terms of Service (“Terms”) govern your access to and use of NomadShield (the “Service”), including the
          website, calculator, accounts, playbooks, Audit Shield, and related content. The Service is operated by{" "}
          {OWNER.legalName} (“we,” “us”), {OWNER.host}. By using NomadShield you agree to these Terms and to our{" "}
          <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do not use the Service.
        </p>
      </section>

      <section>
        <h2>2. Who we are — and who we are not</h2>
        <p>
          NomadShield is a <strong className="text-foreground">compliance workflow tool</strong>. It is not a certified
          public accountant, enrolled agent, law firm, tax preparer, or tax-advice product. Nothing in the Service is
          legal, tax, or accounting advice. Domicile and statutory residency are facts-and-circumstances determinations.
          Completing a checklist, generating a letter, holding a mailbox address, or logging nights does not guarantee
          that any state will accept a change of domicile. We do not file government forms. Packets, cover sheets, and
          “ready to sign” summaries are for you or your professional to complete and submit.
        </p>
        <p className="mt-3">
          Tax savings figures are estimates from simplified rate tables, not advice. The 183-day figure used in Audit
          Shield is a common rule of thumb, not a safe harbor and not the only domicile test.
        </p>
      </section>

      <section>
        <h2>3. Eligibility and accounts</h2>
        <p>
          You must be at least 18 years old and able to form a contract. You are responsible for the accuracy of
          information you provide (including legal name, states, income, and addresses) and for keeping login
          credentials confidential. You may use a local demo store or, if configured, an account through our
          authentication provider. You must not impersonate another person or access another user’s account.
        </p>
      </section>

      <section>
        <h2>4. The Service</h2>
        <p>NomadShield may include, among other things:</p>
        <ul>
          <li>A public domicile savings and audit-risk calculator</li>
          <li>State-specific checklists, generated letters, and ready-to-sign packet summaries</li>
          <li>A presence calendar, evidence vault, and audit-defense PDF</li>
          <li>Optional links to third-party mailbox providers, DMV sites, and election portals</li>
        </ul>
        <p className="mt-3">
          Features labeled “preview,” “demo,” or “waitlist” are not live integrations. We do not operate a mail-receiving
          agency, book DMV appointments, or e-file with any government.
        </p>
      </section>

      <section>
        <h2>5. Plans, payments, and refunds</h2>
        <p>
          Paid plans (including the Migration Kit and Audit Shield) are billed through Stripe. Prices are shown in US
          dollars before you pay. By purchasing you authorize Stripe to charge the selected amount (one-time or
          recurring). Subscriptions renew until you cancel through Stripe’s customer portal or by contacting us via{" "}
          <a href={OWNER.url} target="_blank" rel="noreferrer">
            {OWNER.host}
          </a>
          .
        </p>
        <p className="mt-3">
          Because the Migration Kit is digital and delivered immediately, <strong className="text-foreground">all sales
          are generally final</strong> once the playbook is unlocked, except where required by law. If a charge fails, is
          duplicated, or Stripe reports an error, contact us and we will work with Stripe to correct it. Chargebacks
          filed in bad faith after you have used the Service are a breach of these Terms.
        </p>
      </section>

      <section>
        <h2>6. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service to prepare false statements to a tax authority, bank, or government agency</li>
          <li>Upload malware, or content you do not have the right to store</li>
          <li>Scrape, reverse engineer, or overload the Service except as allowed by law</li>
          <li>Resell access or present NomadShield as your own professional advice product without our written consent</li>
        </ul>
      </section>

      <section>
        <h2>7. Your content</h2>
        <p>
          You retain rights to documents, notes, and files you upload (the “User Content”). You grant us a limited
          license to store and process User Content solely to provide the Service to you (including generating PDFs and
          backups). You represent that User Content does not violate law or third-party rights. We may delete accounts
          or files that appear abusive or illegal.
        </p>
      </section>

      <section>
        <h2>8. Intellectual property</h2>
        <p>
          The Service, playbooks, copy, design, and software are owned by {OWNER.legalName} or its licensors. You may
          not copy, modify, or distribute our materials except for your personal use of generated packets and letters
          for your own domicile file.
        </p>
      </section>

      <section>
        <h2>9. Third-party services</h2>
        <p>
          Payments run on Stripe. Hosting may run on Render or similar providers. Optional analytics use GoatCounter and
          Ahrefs Web Analytics.
          Optional auth and storage may use Supabase. Government and mailbox sites we link to are not under our control.
          Their terms apply when you leave NomadShield.
        </p>
      </section>

      <section>
        <h2>10. Disclaimer of warranties</h2>
        <p>
          THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL
          WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
          NON-INFRINGEMENT. WE DO NOT WARRANT THAT USING NOMADSHIELD WILL CHANGE YOUR TAX DOMICILE, REDUCE YOUR TAX, OR
          PREVAIL IN AN AUDIT.
        </p>
      </section>

      <section>
        <h2>11. Limitation of liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, {OWNER.legalName.toUpperCase()} AND ITS OFFICERS, CONTRACTORS, AND
          AFFILIATES WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR
          LOST PROFITS, LOST TAX SAVINGS, OR AUDIT ASSESSMENTS, EVEN IF ADVISED OF THE POSSIBILITY. OUR TOTAL LIABILITY
          FOR ANY CLAIM RELATING TO THE SERVICE WILL NOT EXCEED THE AMOUNTS YOU PAID US FOR THE SERVICE IN THE TWELVE
          MONTHS BEFORE THE CLAIM (OR USD $49 IF YOU HAVE PAID NOTHING).
        </p>
      </section>

      <section>
        <h2>12. Indemnity</h2>
        <p>
          You will indemnify and hold us harmless from claims arising out of your User Content, your filings with any
          government, or your misuse of the Service, except to the extent caused by our willful misconduct.
        </p>
      </section>

      <section>
        <h2>13. Termination</h2>
        <p>
          You may stop using the Service at any time and may request account deletion in Settings. We may suspend or
          terminate access if you breach these Terms or if we discontinue the product, with reasonable notice where
          practical. Sections that by nature should survive (including 2, 7–12, and 14) will survive termination.
        </p>
      </section>

      <section>
        <h2>14. Changes</h2>
        <p>
          We may update these Terms. The “Last updated” date will change. Continued use after an update constitutes
          acceptance. Material changes to paid plans will be described at the time of purchase or renewal where required.
        </p>
      </section>

      <section>
        <h2>15. Governing law</h2>
        <p>
          These Terms are governed by the laws of the United States and the state in which {OWNER.legalName} is
          organized, without regard to conflict-of-law rules. Courts in that state will have exclusive jurisdiction,
          except that we may seek injunctive relief anywhere.
        </p>
      </section>

      <section>
        <h2>16. Contact</h2>
        <p>
          Questions about these Terms:{" "}
          <a href={OWNER.url} target="_blank" rel="noreferrer">
            {OWNER.legalName}
          </a>{" "}
          ·{" "}
          <a href={OWNER.url} target="_blank" rel="noreferrer">
            {OWNER.host}
          </a>
        </p>
      </section>
    </LegalPage>
  );
}
