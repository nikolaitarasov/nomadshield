import { LegalPage } from "@/components/legal-page";
import { OWNER } from "@/lib/constants";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for NomadShield, a product of SwiftAppLab LLC. How we collect, use, and store account, calculator, vault, and payment data.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "August 31, 2026";

export default function PrivacyPage() {
  return (
    <LegalPage kicker="Legal" title="Privacy Policy" updated={UPDATED}>
      <section>
        <h2>1. Who we are</h2>
        <p>
          NomadShield is operated by {OWNER.legalName} (“we,” “us”). This policy describes how we collect, use, and share
          information when you use NomadShield (the “Service”). It should be read with our{" "}
          <Link href="/terms">Terms of Service</Link>.
        </p>
      </section>

      <section>
        <h2>2. What we collect</h2>
        <p>Depending on how you use the Service, we may process:</p>
        <ul>
          <li>
            <strong className="text-foreground">Account data</strong> — email, password (hashed by our auth provider if
            configured), legal name, former and target states, filing status, income figures you enter, mailbox details
            you paste, and plan flags.
          </li>
          <li>
            <strong className="text-foreground">Calculator inputs</strong> — stored in your browser (and, if you save a
            blueprint, associated with an email).
          </li>
          <li>
            <strong className="text-foreground">Workflow data</strong> — checklist progress, generated letters, presence
            calendar days, notes, and files you upload to the evidence vault (receipts, IDs you choose to store, etc.).
          </li>
          <li>
            <strong className="text-foreground">Payment data</strong> — processed by Stripe. We receive confirmation of
            payment, email, plan, and a Stripe customer/session identifier. We do not receive or store full card numbers.
          </li>
          <li>
            <strong className="text-foreground">Technical data</strong> — pages visited, approximate location derived
            from IP (see analytics), browser type, and diagnostic logs from our host.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. How we use information</h2>
        <ul>
          <li>To provide the calculator, playbooks, vault, PDFs, and paid plan access</li>
          <li>To process payments and prevent fraud</li>
          <li>To understand which pages are used (aggregated traffic via GoatCounter and Ahrefs Web Analytics)</li>
          <li>To secure the Service and comply with law</li>
          <li>To contact you about your account or a transaction if you have given us an email</li>
        </ul>
        <p className="mt-3">We do not sell your personal information.</p>
      </section>

      <section>
        <h2>4. Processors and third parties</h2>
        <ul>
          <li>
            <strong className="text-foreground">Stripe</strong> — checkout and subscriptions. See{" "}
            <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer">
              Stripe’s privacy policy
            </a>
            .
          </li>
          <li>
            <strong className="text-foreground">GoatCounter</strong> — privacy-oriented pageview analytics (no
            advertising cookies). See{" "}
            <a href="https://www.goatcounter.com/help/privacy" target="_blank" rel="noreferrer">
              GoatCounter privacy
            </a>
            .
          </li>
          <li>
            <strong className="text-foreground">Ahrefs Web Analytics</strong> — privacy-oriented pageview and SEO
            analytics (no advertising cookies). See{" "}
            <a href="https://ahrefs.com/web-analytics" target="_blank" rel="noreferrer">
              Ahrefs Web Analytics
            </a>
            .
          </li>
          <li>
            <strong className="text-foreground">Hosting</strong> — the Service may run on Render or a similar cloud host
            in the United States or a region they select.
          </li>
          <li>
            <strong className="text-foreground">Supabase</strong> — if configured, authentication, database, and file
            storage with access limited by account.
          </li>
        </ul>
        <p className="mt-3">
          If you follow links to DMV, election, mailbox-provider, or other third-party sites, their policies apply.
        </p>
      </section>

      <section>
        <h2>5. Cookies, local storage, and analytics</h2>
        <p>
          We use a session cookie so you stay signed in. Calculator drafts, checklist state, and (in demo mode) almost
          all app data may live in your browser’s local storage or IndexedDB until you clear it. GoatCounter and Ahrefs
          Web Analytics count pageviews without a typical advertising cookie; they are designed to avoid identifying you
          across the web. You can block the scripts with a content blocker. Essential cookies for login cannot be
          refused if you want an authenticated session.
        </p>
      </section>

      <section>
        <h2>6. Retention</h2>
        <p>
          We keep account and vault data while your account is open. You may export JSON and delete your account in
          Settings; deletion removes our copy of your rows and stored files where the Service is configured to do so.
          Browser-only demo data is removed when you delete the account in that browser or clear site data. Stripe and
          our host may retain records required for tax, dispute, and security purposes.
        </p>
      </section>

      <section>
        <h2>7. Sharing</h2>
        <p>We share information only:</p>
        <ul>
          <li>With processors listed above, under contracts that limit their use</li>
          <li>If required by law, legal process, or to protect rights and safety</li>
          <li>In a merger, acquisition, or asset sale of {OWNER.legalName}, with notice where required</li>
          <li>With your direction (for example, you download a PDF and send it to your CPA)</li>
        </ul>
      </section>

      <section>
        <h2>8. Security</h2>
        <p>
          We use HTTPS, hashed passwords when auth is enabled, and Stripe for cards. No method of transmission or
          storage is 100% secure. Do not upload documents you are not willing to store with a software vendor. Evidence
          vault files may include sensitive receipts and ID images you choose to add.
        </p>
      </section>

      <section>
        <h2>9. Your rights</h2>
        <p>
          Depending on where you live (including the EEA/UK and certain US states), you may have rights to access,
          correct, delete, or export personal data, or to object to certain processing. Use Settings to export or
          delete your account, or contact us via {OWNER.host}. You may also lodge a complaint with a data protection
          authority.
        </p>
      </section>

      <section>
        <h2>10. Children</h2>
        <p>The Service is for adults (18+). We do not knowingly collect data from children.</p>
      </section>

      <section>
        <h2>11. International</h2>
        <p>
          If you access NomadShield from outside the United States, you understand that we and our processors may
          process information in the US or other countries with different data-protection rules.
        </p>
      </section>

      <section>
        <h2>12. Changes</h2>
        <p>
          We may update this policy. The “Last updated” date will change. Continued use after an update means you
          accept the revised policy.
        </p>
      </section>

      <section>
        <h2>13. Contact</h2>
        <p>
          Privacy questions:{" "}
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
