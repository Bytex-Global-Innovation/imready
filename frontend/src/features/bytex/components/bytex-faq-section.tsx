"use client";

import { useState } from "react";
import { BYTEX_FAQ } from "@/constants";
import { Button } from "@/components/ui";
import { Plus } from "@/components/icons";
import { cn } from "@/lib/utils";

export function BytexFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="flex flex-col items-center gap-6 py-8">
      <h2 className="text-center font-display text-2xl font-semibold tracking-tight text-hero-heading sm:text-[2rem] sm:leading-10 sm:tracking-[-0.01em]">
        {BYTEX_FAQ.title}
      </h2>

      <div className="w-full max-w-3xl border-t border-border">
        {BYTEX_FAQ.items.map((item, index) => {
          const isOpen = openIndex === index;
          const panelId = `bytex-faq-panel-${index}`;
          const buttonId = `bytex-faq-button-${index}`;

          return (
            <div key={item.question} className="border-b border-border">
              <button
                id={buttonId}
                type="button"
                className="flex w-full items-center justify-between gap-4 px-3 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-inset"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className="text-sm font-semibold text-hero-heading">
                  {item.question}
                </span>
                <Plus
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 text-muted transition-transform duration-200",
                    isOpen && "rotate-45",
                  )}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={cn(
                  "overflow-hidden px-3 transition-all duration-200",
                  isOpen ? "max-h-40 pb-4" : "max-h-0",
                )}
              >
                <p className="text-sm leading-5 text-foreground/80">{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-6 pb-12">
        <Button href={BYTEX_FAQ.primaryAction.href} size="lg" className="px-12 shadow-md">
          {BYTEX_FAQ.primaryAction.label}
        </Button>
      </div>
    </section>
  );
}
