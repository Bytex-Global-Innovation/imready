"use client";

import type { FoundationStepMissionConfig } from "@/lib/api";

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

export default function MissionSectionFields({ draft, onDraftChange }: MissionSectionFieldsProps) {
  const fields = FIELDS_BY_MISSION[draft.missionId] ?? [];
  if (fields.length === 0) {
    return (
      <p className="text-xs text-gray-500">
        Missions 1–3 have no file or video upload. Evidence upload and video links are configured
        on Mission 5 only.
      </p>
    );
  }

  const evidenceConfig = draft.evidenceConfig ?? {};

  function patchEvidence(key: string, value: string) {
    onDraftChange({
      ...draft,
      evidenceConfig: { ...evidenceConfig, [key]: value },
    });
  }

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Section titles &amp; descriptions</h3>
        <p className="text-xs text-gray-500">
          Headings and intro copy students see on the mission page.
        </p>
      </div>
      <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/60 p-4">
        {fields.map((field) => {
          const value = evidenceConfig[field.key] ?? "";
          return (
            <label key={field.key} className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">{field.label}</span>
              {field.multiline ? (
                <textarea
                  className="admin-input min-h-[72px] w-full resize-y"
                  value={value}
                  onChange={(e) => patchEvidence(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              ) : (
                <input
                  className="admin-input w-full"
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
