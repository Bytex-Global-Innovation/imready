"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { Plus, X } from "@/components/icons";
import Select from "@/components/ui/select";

const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-[#5a7aa0]";
const hintClass = "mt-1.5 text-xs leading-5 text-[#7a94b3]";
const inputClass =
  "w-full rounded-xl border border-[#cfe0f5] bg-white px-3.5 py-2.5 text-sm text-[#0b1c30] shadow-sm outline-none transition-colors placeholder:text-[#9aa3b2] focus:border-[#3b6fb0] focus:ring-2 focus:ring-[#3b6fb0]/15";
const addBtnClass =
  "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-[#3b6fb0] px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2f5f99]";
const ghostBtnClass =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#cfe0f5] bg-white px-3 py-2 text-sm font-semibold text-[#1e4f8c] transition-colors hover:bg-[#eaf3ff]";

function splitItems(raw: string) {
  return raw
    .split(/[\n,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Chip-style list editor. Values still map to arrays / newline / CSV on save. */
export function TagListField({
  label,
  hint,
  values,
  onChange,
  placeholder = "Type and press Add",
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function addItems(raw: string) {
    const next = splitItems(raw);
    if (next.length === 0) return;
    const merged = [...values];
    for (const item of next) {
      if (!merged.some((v) => v.toLowerCase() === item.toLowerCase())) {
        merged.push(item);
      }
    }
    onChange(merged);
    setDraft("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addItems(draft);
    }
  }

  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div className="rounded-xl border border-[#cfe0f5] bg-[#f7faff] p-3">
        {values.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {values.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#1e4f8c] ring-1 ring-[#cfe0f5]"
              >
                {item}
                <button
                  type="button"
                  aria-label={`Remove ${item}`}
                  className="cursor-pointer rounded-full p-0.5 text-[#7a94b3] hover:bg-[#eaf3ff] hover:text-[#1e4f8c]"
                  onClick={() =>
                    onChange(values.filter((value) => value !== item))
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="mb-3 text-xs text-[#7a94b3]">No items yet.</p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className={inputClass}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
          />
          <button
            type="button"
            className={addBtnClass}
            onClick={() => addItems(draft)}
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
      {hint ? <p className={hintClass}>{hint}</p> : null}
    </div>
  );
}

export type CriterionRow = { id: string; label: string; percent: string };

export function CriteriaField({
  rows,
  onChange,
}: {
  rows: CriterionRow[];
  onChange: (next: CriterionRow[]) => void;
}) {
  function updateRow(id: string, patch: Partial<CriterionRow>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  return (
    <div>
      <span className={labelClass}>Evaluation criteria</span>
      <div className="space-y-2 rounded-xl border border-[#cfe0f5] bg-[#f7faff] p-3">
        {rows.length === 0 ? (
          <p className="text-xs text-[#7a94b3]">No criteria yet.</p>
        ) : null}
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="grid gap-2 rounded-xl border border-[#d7e0ef] bg-white p-3 sm:grid-cols-[1fr_110px_auto]"
          >
            <label className="block text-sm">
              <span className="mb-1 block text-[11px] font-medium text-[#7a94b3]">
                Criterion {index + 1}
              </span>
              <input
                className={inputClass}
                value={row.label}
                onChange={(e) => updateRow(row.id, { label: e.target.value })}
                placeholder="e.g. Insight quality"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[11px] font-medium text-[#7a94b3]">
                Percent
              </span>
              <input
                type="number"
                min={0}
                max={100}
                className={inputClass}
                value={row.percent}
                onChange={(e) => updateRow(row.id, { percent: e.target.value })}
                placeholder="40"
              />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                className={`${ghostBtnClass} w-full sm:w-auto`}
                onClick={() => onChange(rows.filter((item) => item.id !== row.id))}
              >
                <X className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className={ghostBtnClass}
          onClick={() =>
            onChange([
              ...rows,
              {
                id: `c-${Date.now()}`,
                label: "",
                percent: "",
              },
            ])
          }
        >
          <Plus className="h-4 w-4" />
          Add criterion
        </button>
      </div>
      <p className={hintClass}>
        Percents should usually add up to 100.
      </p>
    </div>
  );
}

export type ResourceRow = {
  id: string;
  label: string;
  type: "pdf" | "zip";
  href: string;
};

export function ResourcesField({
  rows,
  onChange,
  uploadSlot,
}: {
  rows: ResourceRow[];
  onChange: (next: ResourceRow[]) => void;
  uploadSlot?: ReactNode;
}) {
  function updateRow(id: string, patch: Partial<ResourceRow>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  return (
    <div>
      <span className={labelClass}>Resources</span>
      <div className="space-y-2 rounded-xl border border-[#cfe0f5] bg-[#f7faff] p-3">
        {rows.length === 0 ? (
          <p className="text-xs text-[#7a94b3]">No resources yet.</p>
        ) : null}
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="space-y-2 rounded-xl border border-[#d7e0ef] bg-white p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a94b3]">
                Resource {index + 1}
              </p>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600"
                onClick={() => onChange(rows.filter((item) => item.id !== row.id))}
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_120px]">
              <label className="block text-sm">
                <span className="mb-1 block text-[11px] font-medium text-[#7a94b3]">
                  Label
                </span>
                <input
                  className={inputClass}
                  value={row.label}
                  onChange={(e) => updateRow(row.id, { label: e.target.value })}
                  placeholder="e.g. Starter kit"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-[11px] font-medium text-[#7a94b3]">
                  Type
                </span>
                <Select
                  value={row.type}
                  onChange={(e) =>
                    updateRow(row.id, {
                      type: e.target.value === "zip" ? "zip" : "pdf",
                    })
                  }
                >
                  <option value="pdf">PDF</option>
                  <option value="zip">ZIP</option>
                </Select>
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-1 block text-[11px] font-medium text-[#7a94b3]">
                File URL
              </span>
              <input
                className={inputClass}
                value={row.href}
                onChange={(e) => updateRow(row.id, { href: e.target.value })}
                placeholder="https://... or /uploads/..."
              />
            </label>
          </div>
        ))}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            className={ghostBtnClass}
            onClick={() =>
              onChange([
                ...rows,
                {
                  id: `r-${Date.now()}`,
                  label: "",
                  type: "pdf",
                  href: "",
                },
              ])
            }
          >
            <Plus className="h-4 w-4" />
            Add resource
          </button>
          {uploadSlot}
        </div>
      </div>
      <p className={hintClass}>
        Add a link manually, or upload a file to attach it automatically.
      </p>
    </div>
  );
}
