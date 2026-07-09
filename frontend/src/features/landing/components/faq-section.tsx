"use client";

import { useState } from "react";
import { HelpCircle, Plus } from "lucide-react";
import { LANDING_FAQ } from "@/constants";
import { cn } from "@/lib/utils";
export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-alt px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-hero-accent">
            <HelpCircle size={14} strokeWidth={2.25} aria-hidden="true" />
            {LANDING_FAQ.eyebrow}
          </p>
          <h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-hero-heading sm:text-4xl">            {LANDING_FAQ.title}
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-3xl sm:mt-16">
          {LANDING_FAQ.items.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `landing-faq-panel-${index}`;
            const buttonId = `landing-faq-button-${index}`;

            return (
              <div
                key={item.question}
                className={cn(
                  "mb-3 overflow-hidden rounded-2xl border bg-white transition-colors duration-300 last:mb-0",
                  isOpen ? "border-hero-accent/40" : "border-border hover:border-border/80",
                )}
              >
                <button
                  id={buttonId}
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hero-accent focus-visible:ring-offset-2 sm:px-8 sm:py-6"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="font-display text-base font-semibold text-hero-heading sm:text-lg">
                    {item.question}
                  </span>
                  <Plus
                    className={cn(
                      "h-5 w-5 shrink-0 text-hero-body transition-all duration-300",
                      isOpen && "rotate-45 text-hero-accent",
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
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-hero-body sm:px-8 sm:pb-6 sm:text-base">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
