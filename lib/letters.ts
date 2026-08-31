import { LETTER_TEMPLATES } from "./constants";
import { stateName } from "./states";
import type { MailboxAddress, Profile } from "./types";

export function formatAddress(a: MailboxAddress) {
  const line1 = [a.street, a.unit].filter(Boolean).join(", ");
  const line2 = [a.city, [a.state, a.zip].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return [line1, line2].filter(Boolean).join("\n");
}

function block(profile: Profile) {
  const addr = formatAddress(profile.mailboxAddress);
  return {
    name: profile.fullName || "Resident",
    from: stateName(profile.fromState),
    to: stateName(profile.targetState),
    addr: addr || "(address not yet entered)",
    email: profile.email,
  };
}

export function letterBody(templateKey: string, profile: Profile, extraRecipient?: string, asOf?: Date) {
  const t = LETTER_TEMPLATES.find((x) => x.key === templateKey);
  const b = block(profile);
  const date = (asOf ?? new Date()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const recipient = extraRecipient || t?.recipient || "To whom it may concern";

  const intro = `${b.name}\n${b.addr}\n${b.email}\n\n${date}\n\n${recipient}\n`;

  const bodies: Record<string, string> = {
    voter_cancel: `${intro}
Re: Cancellation of voter registration — ${b.from}

I, ${b.name}, request that you cancel my voter registration in ${b.from}. I have changed my domicile to ${b.to} and will register to vote there.

This letter is a records notice. It is not a legal opinion.

Please confirm cancellation in writing to the address above.

Sincerely,
${b.name}
`,
    gym: `${intro}
Re: Membership address / cancellation — change of domicile

Please update your records to reflect that I no longer reside in ${b.from}. My domicile is now ${b.to}:

${b.addr}

If the membership is tied to an in-state club, treat this as notice to cancel at the end of the current billing period and send a final statement to the address above.

Sincerely,
${b.name}
`,
    library: `${intro}
Re: Library card — nonresident / address change

I have changed my domicile from ${b.from} to ${b.to}. Please cancel or convert my resident library card and update any address on file to:

${b.addr}

Sincerely,
${b.name}
`,
    professional_license: `${intro}
Re: Address of record for professional license

Please change my address of record from ${b.from} to my ${b.to} domicile:

${b.addr}

This is an address update. It is not a request for you to determine my tax domicile.

Sincerely,
${b.name}
`,
    insurance: `${intro}
Re: Policyholder mailing address and rating address

Please update mailing address (and, if different, the rating/garaging address you have on file) to:

${b.addr}

I have changed my domicile from ${b.from} to ${b.to}. If a policy must be rewritten because of the state change, contact me at ${b.email} before cancelling coverage.

Sincerely,
${b.name}
`,
    cpa: `${intro}
Re: Change of domicile — ${b.from} to ${b.to}

I am assembling a domicile-change file for tax year ${new Date().getFullYear()}. Please update your records to the address below and use it for organizer mailings. I still need you (or a successor) to advise on part-year / nonresident filings — NomadShield is a workflow tool, not a substitute for that advice.

${b.addr}

I can provide a day-count log and exhibit index from my Audit Shield vault.

Sincerely,
${b.name}
`,
    employer_hr: `${intro}
Re: Work location, state withholding, and mailing address

I have changed my domicile from ${b.from} to ${b.to}. Please update my mailing address to:

${b.addr}

Please have payroll review state income-tax withholding. I understand that remote W-2 work can create multi-state withholding issues and that a mailbox address does not, by itself, end ${b.from} wage tax. I am not asking you to stop withholding based on this letter alone — I am asking you to open the work-location / nexus review with your payroll provider.

Sincerely,
${b.name}
`,
    utility: `${intro}
Re: Account address / final bill — change of residence

Please stop treating any ${b.from} service address as my residence. My domicile mailing address is now:

${b.addr}

If an account remains open, send the final bill to the address above and close the residential account if I am no longer the occupant.

Sincerely,
${b.name}
`,
    doctors: `${intro}
Re: Patient mailing address — I am no longer a ${b.from} resident

Please update my mailing address to:

${b.addr}

I have changed my domicile to ${b.to}. Please do not use a former ${b.from} residential address for records, billing, or prescription mail.

Sincerely,
${b.name}
`,
  };

  const body = bodies[templateKey] ?? `${intro}\nPlease update your records.\n\nSincerely,\n${b.name}\n`;
  const subject = t ? t.label : "Address / domicile update";
  return { subject, body, recipient };
}
