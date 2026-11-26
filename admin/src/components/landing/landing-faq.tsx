"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "@/constants/founder-landing";

export default function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="border-t border-[var(--landing-border)] py-14 sm:py-20"
    >
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <p className="text-xs font-semibold tracking-[0.16em] text-[var(--landing-primary)] uppercase">
          Questions
        </p>
        <h2
          id="faq-title"
          className="mt-2 font-[family-name:var(--font-landing-display)] text-3xl font-medium tracking-tight sm:text-4xl"
        >
          Straight answers
        </h2>

        <div className="mt-8 border-t border-[var(--landing-border)]">
          {FAQ_ITEMS.map((item, index) => {
            const open = openIndex === index;
            return (
              <div
                key={item.question}
                className="border-b border-[var(--landing-border)]"
              >
                <button
                  type="button"
                  aria-expanded={open}
                  className="flex w-full items-start justify-between gap-4 py-4 text-left text-base font-semibold text-[var(--landing-foreground)] transition-colors hover:text-[var(--landing-primary)]"
                  onClick={() => setOpenIndex(open ? null : index)}
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`mt-0.5 size-4 shrink-0 text-[var(--landing-muted)] transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-4 text-base leading-relaxed text-[var(--landing-foreground)]">
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
