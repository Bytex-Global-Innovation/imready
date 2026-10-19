"use client";

import { memo } from "react";
import { Trash2 } from "@/components/icons";
import type { FoundationStepQuestion } from "@/lib/api";

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
    <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Field {index + 1}
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>

      <div className="grid gap-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Answer key</span>
          <input
            className="admin-input w-full font-mono text-xs"
            value={question.answerKey}
            onChange={(e) => onChange(index, { answerKey: e.target.value })}
            placeholder="e.g. reflection"
          />
          <span className="mt-1 block text-xs text-gray-500">
            Stored in student answers JSON — must stay stable after publish.
          </span>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Question / label</span>
          <input
            className="admin-input w-full"
            value={displayLabel}
            onChange={(e) =>
              onChange(index, { question: e.target.value, label: e.target.value })
            }
            placeholder="What students see as the prompt"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Helper text</span>
          <input
            className="admin-input w-full"
            value={question.helper ?? ""}
            onChange={(e) => onChange(index, { helper: e.target.value })}
            placeholder="Short guidance under the field"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Answer placeholder</span>
          <input
            className="admin-input w-full"
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
