"use client";

import { PlanGate } from "@/components/app-shell";
import { Button, Card, DisclaimerNote } from "@/components/ui";
import { downloadDefenseReport } from "@/lib/pdf";
import { stateName } from "@/lib/states";
import { useApp } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { useMemo, useState } from "react";

export default function ReportPage() {
  const { profile, presence, evidence } = useApp();
  const defaultYear = profile?.taxYearStart ? Number(profile.taxYearStart.slice(0, 4)) : new Date().getFullYear();
  const [year, setYear] = useState(defaultYear);

  const yearPresence = presence.filter((p) => p.date.startsWith(String(year)));
  const counts = useMemo(
    () => ({
      target: yearPresence.filter((p) => p.bucket === "target").length,
      former: yearPresence.filter((p) => p.bucket === "former").length,
      other: yearPresence.filter((p) => p.bucket === "other").length,
      unlabeled: (year % 4 === 0 ? 366 : 365) - yearPresence.length,
    }),
    [yearPresence, year],
  );

  const targetDays = yearPresence.filter((p) => p.bucket === "target").sort((a, b) => a.date.localeCompare(b.date));

  if (!profile) return null;

  return (
    <PlanGate need="shield">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold">Audit defense report</h1>
        <p className="mt-1 text-sm text-muted">
          Client-side PDF. Exhibit index lists filenames — we do not embed raw scans unless you attach them separately.
        </p>

        <Card className="mt-6">
          <p className="text-xs uppercase tracking-wider text-muted">Cover</p>
          <h2 className="mt-1 text-lg font-semibold">{profile.fullName || profile.email}</h2>
          <p className="text-sm text-muted">
            Tax year {year} · {stateName(profile.fromState)} → {stateName(profile.targetState)}
          </p>
          <label className="mt-4 block text-xs text-muted">
            Year
            <select
              className="mt-1 h-10 w-full rounded-lg border border-border bg-muted-bg px-3 text-sm"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[defaultYear - 1, defaultYear, defaultYear + 1].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </label>
        </Card>

        <Card className="mt-4">
          <h3 className="font-medium">Day counts</h3>
          <table className="mt-3 w-full text-sm">
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-2">Target ({profile.targetState})</td>
                <td className="py-2 text-right font-mono text-accent">{counts.target}</td>
              </tr>
              <tr>
                <td className="py-2">Former ({profile.fromState}{profile.watchState ? ` + ${profile.watchState}` : ""})</td>
                <td className="py-2 text-right font-mono text-danger">{counts.former}</td>
              </tr>
              <tr>
                <td className="py-2">Everywhere else</td>
                <td className="py-2 text-right font-mono">{counts.other}</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted">183 days is a common rule of thumb, not the only domicile test.</p>
        </Card>

        <Card className="mt-4">
          <h3 className="font-medium">Target-state timeline</h3>
          {targetDays.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No target-state nights logged in {year}.</p>
          ) : (
            <p className="mt-2 font-mono text-xs text-muted">{targetDays.map((d) => d.date).join(" · ")}</p>
          )}
        </Card>

        <Card className="mt-4">
          <h3 className="font-medium">Exhibit index</h3>
          <ul className="mt-3 space-y-1 text-sm">
            {evidence.length === 0 && <li className="text-muted">No vault files.</li>}
            {evidence.map((e, i) => (
              <li key={e.id} className="text-muted">
                {i + 1}. {e.fileName} · {e.category} · {formatDate(e.evidenceDate)} · {e.jurisdiction}
              </li>
            ))}
          </ul>
        </Card>

        <Button
          className="mt-6"
          onClick={() =>
            downloadDefenseReport({
              profile,
              year,
              presence: yearPresence,
              evidence,
              counts,
            })
          }
        >
          Download defense PDF
        </Button>
        <DisclaimerNote className="mt-4" />
      </div>
    </PlanGate>
  );
}
