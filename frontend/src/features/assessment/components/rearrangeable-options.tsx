"use client";

import { useEffect, useState } from "react";
import { Grip } from "@/components/icons";
import { cn } from "@/lib/utils";

export type AssessmentOption = {
  id: string;
  label: string;
};

type RearrangeableOptionsProps = {
  options: readonly AssessmentOption[];
  order: string[];
  onChange: (nextOrder: string[]) => void;
};

const OPTION_COLORS = [
  "border-sky-300 bg-sky-50 text-sky-950",
  "border-amber-300 bg-amber-50 text-amber-950",
  "border-emerald-300 bg-emerald-50 text-emerald-950",
  "border-violet-300 bg-violet-50 text-violet-950",
] as const;

const OPTION_GRIP_COLORS = [
  "text-sky-600",
  "text-amber-600",
  "text-emerald-600",
  "text-violet-600",
] as const;

function reorder(list: string[], from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) {
    return list;
  }
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function useIsMobile(breakpointPx = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [breakpointPx]);

  return isMobile;
}

export function RearrangeableOptions({
  options,
  order,
  onChange,
}: RearrangeableOptionsProps) {
  const isMobile = useIsMobile();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const colorIndexById = new Map(
    options.map((option, index) => [option.id, index % OPTION_COLORS.length]),
  );
  const byId = new Map(options.map((option) => [option.id, option]));
  const ordered = order
    .map((id) => byId.get(id))
    .filter((option): option is AssessmentOption => Boolean(option));

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setOverId(null);
      return;
    }
    const from = order.indexOf(draggingId);
    const to = order.indexOf(targetId);
    onChange(reorder(order, from, to));
    setDraggingId(null);
    setOverId(null);
  }

  function assignPosition(optionId: string, position: number) {
    if (!Number.isFinite(position) || position < 1 || position > order.length) {
      return;
    }
    const next = [...order];
    const from = next.indexOf(optionId);
    const to = position - 1;
    if (from < 0 || from === to) return;
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  if (isMobile) {
    return (
      <div className="mt-6">
        <div className="mb-2 flex flex-col gap-1">
          <p className="text-xs font-semibold tracking-wider text-muted uppercase">
            Arrange the steps in the best order
          </p>
          <p className="text-xs text-muted">
            Tap a number to set each step&apos;s position in the sequence
          </p>
        </div>

        <ul className="space-y-2" aria-label="Number options into sequence">
          {options.map((option) => {
            const colorIndex = colorIndexById.get(option.id) ?? 0;
            const currentPosition = order.indexOf(option.id) + 1;

            return (
              <li key={option.id}>
                <div
                  className={cn(
                    "flex items-center gap-2.5 rounded-[var(--radius-card)] border px-3 py-2 shadow-sm",
                    OPTION_COLORS[colorIndex],
                  )}
                >
                  <div className="flex shrink-0 gap-1" role="group" aria-label={`Order for ${option.label}`}>
                    {options.map((_, index) => {
                      const position = index + 1;
                      const selected = currentPosition === position;
                      return (
                        <button
                          key={position}
                          type="button"
                          onClick={() => assignPosition(option.id, position)}
                          aria-pressed={selected}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-md border text-xs font-semibold transition-colors",
                            selected
                              ? "border-primary bg-primary text-white"
                              : "border-black/10 bg-white/70 text-foreground",
                          )}
                        >
                          {position}
                        </button>
                      );
                    })}
                  </div>
                  <p className="min-w-0 flex-1 text-sm leading-snug">{option.label}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-xs font-semibold tracking-wider text-muted uppercase">
          Arrange the steps in the best order
        </p>
        <p className="text-xs text-muted">Drag to rearrange</p>
      </div>

      <ul className="space-y-2" aria-label="Jumbled options to rearrange">
        {ordered.map((option) => {
          const isDragging = draggingId === option.id;
          const isOver = overId === option.id && draggingId !== option.id;
          const colorIndex = colorIndexById.get(option.id) ?? 0;

          return (
            <li key={option.id}>
              <div
                draggable
                onDragStart={() => setDraggingId(option.id)}
                onDragEnd={() => {
                  setDraggingId(null);
                  setOverId(null);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setOverId(option.id);
                }}
                onDragLeave={() => {
                  setOverId((current) => (current === option.id ? null : current));
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  handleDrop(option.id);
                }}
                className={cn(
                  "flex cursor-grab items-center gap-2.5 rounded-[var(--radius-card)] border px-3 py-2 shadow-sm transition-all active:cursor-grabbing sm:px-3.5",
                  OPTION_COLORS[colorIndex],
                  isDragging && "opacity-60",
                  isOver && "ring-2 ring-primary ring-offset-1",
                )}
              >
                <span
                  className={cn("shrink-0", OPTION_GRIP_COLORS[colorIndex])}
                  aria-hidden
                >
                  <Grip className="h-4 w-4" />
                </span>

                <p className="min-w-0 flex-1 text-sm leading-snug">
                  {option.label}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
