"use client";

import { memo } from "react";
import { Trash2 } from "@/components/icons";
import type { FoundationStepQuestion } from "@/lib/api";

const fieldLabel =
  "mb-1 block text-[11px] font-medium text-[#7a94b3]";
const fieldControl =
  "w-full rounded-xl border border-[#cfe0f5] bg-white px-3 py-2.5 text-sm text-[#0b1c30] shadow-sm outline-none transition-colors placeholder:text-[#9aa3b2] focus:border-[#3b6fb0] focus:ring-2 focus:ring-[#3b6fb0]/15";

interface MissionQuestionCardProps {
  index: number;
  question: FoundationStepQuestion;
  onChange: (index: number, patch: Partial<FoundationStepQuestion>) => void;
  onRemove: (index: number) => void;
}

function MissionQuestionCard({
  index,
  question,
  onChange,
  onRemove,
}: MissionQuestionCardProps) {
  const displayLabel = question.question ?? question.label ?? "";

  return (
    <div className="space-y-3 rounded-2xl border border-[#d7e0ef] bg-[linear-gradient(160deg,#ffffff_0%,#f7faff_100%)] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex rounded-full bg-[#eaf3ff] px-2.5 py-0.5 text-[11px] font-semibold text-[#3b6fb0]">
          Field {index + 1}
        </span>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={fieldLabel}>Question / label</span>
          <input
            className={fieldControl}
            value={displayLabel}
            onChange={(e) =>
              onChange(index, { question: e.target.value, label: e.target.value })
            }
            placeholder="What students see as the prompt"
          />
        </label>

        <label className="block">
          <span className={fieldLabel}>Answer key</span>
          <input
            className={`${fieldControl} font-mono text-xs`}
            value={question.answerKey}
            onChange={(e) => onChange(index, { answerKey: e.target.value })}
            placeholder="e.g. reflection"
          />
          <span className="mt-1 block text-[11px] leading-4 text-[#9aa3b2]">
            Keep stable after publish — stored in answers JSON.
          </span>
        </label>

        <label className="block">
          <span className={fieldLabel}>Helper text</span>
          <input
            className={fieldControl}
            value={question.helper ?? ""}
            onChange={(e) => onChange(index, { helper: e.target.value })}
            placeholder="Short guidance under the field"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className={fieldLabel}>Answer placeholder</span>
          <input
            className={fieldControl}
            value={question.placeholder ?? ""}
            onChange={(e) => onChange(index, { placeholder: e.target.value })}
            placeholder="Example answer shown inside the input"
          />
        </label>
      </div>
    </div>
  );
}

export default memo(MissionQuestionCard);
