"use client";

import { PlanGate } from "@/components/app-shell";
import { Badge, Button, Card, Empty } from "@/components/ui";
import { LETTER_TEMPLATES } from "@/lib/constants";
import { downloadLetterPdf } from "@/lib/pdf";
import { useApp } from "@/lib/store";
import { downloadText, formatDate } from "@/lib/utils";
import { useState } from "react";

export default function LettersPage() {
  const { letters, addLetter, setLetterStatus, setItemStatus } = useApp();
  const [picked, setPicked] = useState<string[]>(["voter_cancel"]);

  function toggle(key: string) {
    setPicked((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));
  }

  function generate() {
    picked.forEach((k) => addLetter(k));
    setItemStatus("letters", "select_ties", "done");
    setItemStatus("letters", "generate", "done");
  }

  return (
    <PlanGate need="kit">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold">Severing-ties letters</h1>
        <p className="mt-1 text-sm text-muted">
          Merge fields from your profile. Download .txt or PDF. Toggle sent when you actually send them. This is not legal
          advice.
        </p>

        <Card className="mt-6">
          <p className="text-sm font-medium">Select ties</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {LETTER_TEMPLATES.map((t) => (
              <label key={t.key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-emerald-400"
                  checked={picked.includes(t.key)}
                  onChange={() => toggle(t.key)}
                />
                {t.label}
              </label>
            ))}
          </div>
          <Button className="mt-4" onClick={generate} disabled={picked.length === 0}>
            Generate {picked.length} letter{picked.length === 1 ? "" : "s"}
          </Button>
        </Card>

        <div className="mt-6 space-y-3">
          {letters.length === 0 ? (
            <Empty title="No letters yet" body="Select gym, voter, HR, doctors — generate a packet you can actually send." />
          ) : (
            letters.map((l) => (
              <Card key={l.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{l.subject}</p>
                    <p className="text-xs text-muted">
                      {l.recipient} · {formatDate(l.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={l.status === "sent" ? "accent" : "muted"}>{l.status.replace("_", " ")}</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setLetterStatus(l.id, l.status === "sent" ? "not_sent" : "sent")}
                    >
                      Mark {l.status === "sent" ? "not sent" : "sent"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => downloadText(l.body, `${l.templateKey}.txt`)}>
                      .txt
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => downloadLetterPdf(l.subject, l.body)}>
                      PDF
                    </Button>
                  </div>
                </div>
                <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-muted-bg p-3 text-xs text-muted">
                  {l.body}
                </pre>
              </Card>
            ))
          )}
        </div>
      </div>
    </PlanGate>
  );
}
