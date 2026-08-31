"use client";

import { PlanGate } from "@/components/app-shell";
import { Badge, Card, DisclaimerNote, Field, Ring, Select, Textarea } from "@/components/ui";
import { stateName, US_STATES } from "@/lib/states";
import { useApp } from "@/lib/store";
import type { PresenceBucket } from "@/lib/types";
import { cn, toISODate } from "@/lib/utils";
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const BUCKETS: { id: PresenceBucket; label: string; className: string }[] = [
  { id: "target", label: "Target domicile", className: "bg-accent text-accent-fg" },
  { id: "former", label: "Former high-tax", className: "bg-danger/80 text-white" },
  { id: "other", label: "Everywhere else", className: "bg-other/80 text-background" },
];

export default function ShieldPage() {
  const { profile, presence, upsertPresence, updateProfile } = useApp();
  const year = profile?.taxYearStart ? Number(profile.taxYearStart.slice(0, 4)) : new Date().getFullYear();
  const [viewYear, setViewYear] = useState(year);
  const [cursor, setCursor] = useState(new Date(year, new Date().getMonth(), 1));
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [didJump, setDidJump] = useState(false);

  useEffect(() => {
    if (didJump) return;
    const inYear = presence.filter((p) => p.date.startsWith(String(viewYear)));
    if (!inYear.length) return;
    const thisMonth = `${viewYear}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
    if (inYear.some((p) => p.date.startsWith(thisMonth))) {
      setDidJump(true);
      return;
    }
    const last = [...inYear].sort((a, b) => b.date.localeCompare(a.date))[0];
    if (last) setCursor(new Date(`${last.date}T00:00:00`));
    setDidJump(true);
  }, [presence, viewYear, didJump]);

  const yearDays = presence.filter((p) => p.date.startsWith(String(viewYear)));
  const byDate = useMemo(() => Object.fromEntries(yearDays.map((p) => [p.date, p])), [yearDays]);
  const counts = {
    target: yearDays.filter((p) => p.bucket === "target").length,
    former: yearDays.filter((p) => p.bucket === "former").length,
    other: yearDays.filter((p) => p.bucket === "other").length,
  };
  const unlabeled =
    (viewYear % 4 === 0 ? 366 : 365) - counts.target - counts.former - counts.other;

  const start = startOfMonth(cursor);
  const end = endOfMonth(cursor);
  const days = eachDayOfInterval({ start, end });
  const pad = getDay(start);
  const selectedRow = selected ? byDate[selected] : null;

  const formerWarn = counts.former >= 183 ? "danger" : counts.former >= 150 ? "warning" : null;

  return (
    <PlanGate need="shield">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted">Audit Shield</p>
            <h1 className="text-2xl font-semibold">183-day presence log</h1>
            <p className="mt-1 text-sm text-muted">
              Three buckets. Click a day. 183 days is a common rule of thumb, not the only domicile test.
            </p>
          </div>
          <Field label="Tax year">
            <Select
              value={String(viewYear)}
              onChange={(e) => {
                const y = Number(e.target.value);
                setViewYear(y);
                setCursor(new Date(y, 0, 1));
              }}
            >
              {[year - 1, year, year + 1].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </Select>
          </Field>
        </div>

        {formerWarn && (
          <div
            className={cn(
              "mt-4 rounded-xl border px-4 py-3 text-sm",
              formerWarn === "danger"
                ? "border-danger/40 bg-danger/10 text-danger"
                : "border-warning/40 bg-warning/10 text-warning",
            )}
          >
            {counts.former} days logged in former high-tax state(s) in {viewYear}.{" "}
            {formerWarn === "danger"
              ? "You are at or over the common 183-day rule of thumb."
              : "You are approaching 183 days."}{" "}
            That is not the only test, but it is a loud one.
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <button onClick={() => setCursor(addMonths(cursor, -1))} className="rounded-lg p-2 hover:bg-muted-bg">
                <ChevronLeft className="size-4" />
              </button>
              <p className="text-sm font-medium">{format(cursor, "MMMM yyyy")}</p>
              <button onClick={() => setCursor(addMonths(cursor, 1))} className="rounded-lg p-2 hover:bg-muted-bg">
                <ChevronRight className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase text-muted">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: pad }).map((_, i) => (
                <div key={`p${i}`} />
              ))}
              {days.map((d) => {
                const iso = toISODate(d);
                const row = byDate[iso];
                const color =
                  row?.bucket === "target"
                    ? "bg-accent/80 text-accent-fg"
                    : row?.bucket === "former"
                      ? "bg-danger/70 text-white"
                      : row?.bucket === "other"
                        ? "bg-other/50"
                        : "hover:bg-muted-bg";
                return (
                  <button
                    key={iso}
                    onClick={() => {
                      setSelected(iso);
                      setNote(row?.note ?? "");
                    }}
                    className={cn(
                      "aspect-square rounded-md text-xs",
                      color,
                      selected === iso && "ring-2 ring-accent",
                    )}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
            {selected && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm font-medium">{selected}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {BUCKETS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => upsertPresence(selected, b.id, { note, formerState: profile?.fromState })}
                      className={cn("rounded-full px-3 py-1 text-xs", b.className)}
                    >
                      {b.label}
                    </button>
                  ))}
                  <button
                    onClick={() => upsertPresence(selected, null)}
                    className="rounded-full border border-border px-3 py-1 text-xs"
                  >
                    Clear
                  </button>
                </div>
                {selectedRow?.bucket === "former" && (
                  <Field label="Which former / watch state?" className="mt-3 max-w-xs">
                    <Select
                      value={selectedRow.formerState ?? profile?.fromState ?? ""}
                      onChange={(e) =>
                        upsertPresence(selected, "former", { note, formerState: e.target.value })
                      }
                    >
                      <option value={profile?.fromState}>{stateName(profile?.fromState ?? "")}</option>
                      {profile?.watchState && (
                        <option value={profile.watchState}>{stateName(profile.watchState)}</option>
                      )}
                    </Select>
                  </Field>
                )}
                <Field label="Note" className="mt-3">
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onBlur={() => selectedRow && upsertPresence(selected, selectedRow.bucket, { note, formerState: selectedRow.formerState ?? undefined })}
                    placeholder="Hotel, flight, coworking…"
                  />
                </Field>
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <Card>
              <p className="text-xs text-muted">Running totals · {viewYear}</p>
              <div className="mt-3 flex justify-between">
                <Ring value={counts.target} max={183} label={profile?.targetState ?? "Target"} />
                <Ring value={counts.former} max={183} label="Former" color="var(--danger)" />
                <Ring value={counts.other} max={90} label="Other" color="var(--other)" />
              </div>
              <p className="mt-3 text-[11px] text-muted">{unlabeled} days unlabeled</p>
            </Card>
            <Card>
              <h3 className="text-sm font-medium">Second watch state</h3>
              <p className="mt-1 text-xs text-muted">
                If you also lived in another high-tax state, track it separately on former-bucket days.
              </p>
              <Select
                className="mt-3"
                value={profile?.watchState ?? ""}
                onChange={(e) => updateProfile({ watchState: e.target.value })}
              >
                <option value="">None</option>
                {US_STATES.filter((s) => s.abbr !== profile?.fromState && s.abbr !== profile?.targetState).map((s) => (
                  <option key={s.abbr} value={s.abbr}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Card>
            <div className="flex flex-wrap gap-2 text-[11px] text-muted">
              <Badge tone="accent">Target</Badge>
              <Badge tone="danger">Former</Badge>
              <Badge tone="muted">Other / unlabeled</Badge>
            </div>
          </div>
        </div>
        <DisclaimerNote className="mt-6" />
      </div>
    </PlanGate>
  );
}
