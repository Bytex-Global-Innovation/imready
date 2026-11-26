"use client";

import type { FoundationStepMissionConfig } from "@/lib/api";

const fieldLabel =
  "mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-[#5a7aa0]";
const fieldControl =
  "w-full rounded-xl border border-[#cfe0f5] bg-white px-3.5 py-2.5 text-sm text-[#0b1c30] shadow-sm outline-none transition-colors placeholder:text-[#9aa3b2] focus:border-[#3b6fb0] focus:ring-2 focus:ring-[#3b6fb0]/15";

type SectionField = {
  key: string;
  label: string;
  multiline?: boolean;
  placeholder?: string;
};

const FIELDS_BY_MISSION: Record<number, SectionField[]> = {
  4: [
    {
      key: "pageSubtitle",
      label: "Mission page subtitle",
      multiline: true,
      placeholder: "Shown under the mission title on the student form",
    },
    { key: "reflectionSectionTitle", label: "Step 2 — section title" },
    {
      key: "reflectionSectionDescription",
      label: "Step 2 — section description",
      multiline: true,
    },
    { key: "improvementSectionTitle", label: "Step 3 — section title" },
    {
      key: "improvementSectionDescription",
      label: "Step 3 — section description",
      multiline: true,
    },
  ],
  5: [
    { key: "sectionTitle", label: "Final proof section title" },
    {
      key: "sectionDescription",
      label: "Final proof section description",
      multiline: true,
    },
    { key: "uploadHelper", label: "Upload helper text", multiline: true },
    { key: "videoLinkHelper", label: "Video link helper text", multiline: true },
  ],
};

interface MissionSectionFieldsProps {
  draft: FoundationStepMissionConfig;
  onDraftChange: (next: FoundationStepMissionConfig) => void;
}

export default function MissionSectionFields({
  draft,
  onDraftChange,
}: MissionSectionFieldsProps) {
  const fields = FIELDS_BY_MISSION[draft.missionId] ?? [];
  if (fields.length === 0) return null;

  const evidenceConfig = draft.evidenceConfig ?? {};

  function patchEvidence(key: string, value: string) {
    onDraftChange({
      ...draft,
      evidenceConfig: { ...evidenceConfig, [key]: value },
    });
  }

  return (
    <section className="space-y-3 rounded-2xl border border-[#e8eef6] bg-[#f7faff] p-4">
      <div>
        <h3 className="text-sm font-semibold text-[#1e4f8c]">
          Section titles &amp; descriptions
        </h3>
        <p className="mt-0.5 text-xs text-[#7a94b3]">
          Headings and intro copy students see on the mission page.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => {
          const value = evidenceConfig[field.key] ?? "";
          return (
            <label
              key={field.key}
              className={`block ${field.multiline ? "sm:col-span-2" : ""}`}
            >
              <span className={fieldLabel}>{field.label}</span>
              {field.multiline ? (
                <textarea
                  className={`${fieldControl} min-h-[72px] resize-y`}
                  value={value}
                  onChange={(e) => patchEvidence(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              ) : (
                <input
                  className={fieldControl}
                  value={value}
                  onChange={(e) => patchEvidence(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              )}
            </label>
          );
        })}
      </div>
    </section>
  );
}
