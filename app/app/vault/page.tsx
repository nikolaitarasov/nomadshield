"use client";

import { PlanGate } from "@/components/app-shell";
import { Badge, Button, Card, Empty, Field, Input, Select } from "@/components/ui";
import { EVIDENCE_CATEGORIES } from "@/lib/constants";
import { deleteBlob, getBlob, putBlob } from "@/lib/files";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useApp } from "@/lib/store";
import type { EvidenceCategory } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Upload } from "lucide-react";
import { useMemo, useState } from "react";

export default function VaultPage() {
  const { evidence, addEvidence, deleteEvidence, profile } = useApp();
  const [category, setCategory] = useState<EvidenceCategory | "all">("all");
  const [drag, setDrag] = useState(false);
  const [meta, setMeta] = useState({
    category: "lodging" as EvidenceCategory,
    evidenceDate: new Date().toISOString().slice(0, 10),
    jurisdiction: (profile?.targetState ?? "FL") as string,
    amount: "",
    note: "",
  });

  const filtered = useMemo(
    () => evidence.filter((e) => (category === "all" ? true : e.category === category)),
    [evidence, category],
  );

  async function ingest(files: FileList | File[]) {
    const list = Array.from(files);
    for (const file of list) {
      const rec = addEvidence({
        fileName: file.name,
        category: meta.category,
        evidenceDate: meta.evidenceDate,
        jurisdiction: meta.jurisdiction,
        amount: meta.amount ? Number(meta.amount) : null,
        note: meta.note,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
      });
      if (!rec) continue;
      const sb = getSupabaseBrowser();
      if (sb) {
        try {
          await sb.storage.from("evidence").upload(rec.storagePath, file, { upsert: true });
        } catch {
          await putBlob(rec.id, file);
        }
      } else {
        await putBlob(rec.id, file);
      }
    }
  }

  async function download(id: string, name: string) {
    const blob = await getBlob(id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PlanGate need="shield">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold">Evidence vault</h1>
        <p className="mt-1 text-sm text-muted">5 GB plan flag in production. This MVP stores files in IndexedDB (or Supabase Storage when configured).</p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            if (e.dataTransfer.files.length) void ingest(e.dataTransfer.files);
          }}
          className={`mt-6 rounded-2xl border border-dashed p-8 text-center ${drag ? "border-accent bg-accent/10" : "border-border"}`}
        >
          <Upload className="mx-auto size-6 text-accent" />
          <p className="mt-2 text-sm">Drop receipts here, or choose files</p>
          <label className="mt-3 inline-flex h-10 cursor-pointer items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg">
            Upload
            <input
              type="file"
              className="hidden"
              multiple
              onChange={(e) => e.target.files && ingest(e.target.files)}
            />
          </label>
          <div className="mx-auto mt-4 grid max-w-xl gap-3 text-left sm:grid-cols-2">
            <Field label="Category">
              <Select
                value={meta.category}
                onChange={(e) => setMeta((m) => ({ ...m, category: e.target.value as EvidenceCategory }))}
              >
                {EVIDENCE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Date">
              <Input type="date" value={meta.evidenceDate} onChange={(e) => setMeta((m) => ({ ...m, evidenceDate: e.target.value }))} />
            </Field>
            <Field label="State / country">
              <Input value={meta.jurisdiction} onChange={(e) => setMeta((m) => ({ ...m, jurisdiction: e.target.value }))} />
            </Field>
            <Field label="Amount (optional)">
              <Input value={meta.amount} onChange={(e) => setMeta((m) => ({ ...m, amount: e.target.value }))} placeholder="0.00" />
            </Field>
            <Field label="Note" className="sm:col-span-2">
              <Input value={meta.note} onChange={(e) => setMeta((m) => ({ ...m, note: e.target.value }))} />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("all")}
            className={`rounded-full border px-3 py-1 text-xs ${category === "all" ? "border-accent text-accent" : "border-border text-muted"}`}
          >
            All
          </button>
          {EVIDENCE_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`rounded-full border px-3 py-1 text-xs ${category === c.id ? "border-accent text-accent" : "border-border text-muted"}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {filtered.length === 0 ? (
            <Empty
              title="No files in this filter"
              body="Upload a lodging receipt, boarding pass, or Form 1583 scan. Demo accounts already have six stub records."
            />
          ) : (
            filtered.map((e) => (
              <Card key={e.id} pad={false} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{e.fileName}</p>
                  <p className="text-xs text-muted">
                    {formatDate(e.evidenceDate)} · {e.jurisdiction} · {e.note || "No note"}
                    {e.amount != null ? ` · $${e.amount}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{EVIDENCE_CATEGORIES.find((c) => c.id === e.category)?.label ?? e.category}</Badge>
                  <Button size="sm" variant="outline" onClick={() => download(e.id, e.fileName)}>
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await deleteBlob(e.id);
                      deleteEvidence(e.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </PlanGate>
  );
}
