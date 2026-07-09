"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Cpu,
  HardDrive,
  Info,
  Laptop,
  Map,
  Monitor,
  ShieldCheck,
  Tag,
  Truck,
} from "lucide-react";
import { DEVICE_SELECTION } from "@/constants";
import { cn } from "@/lib/utils";
import { openWhatsAppCheckout } from "@/lib/whatsapp-checkout";

const SPEC_ICONS: LucideIcon[] = [HardDrive, Monitor, Cpu, Map];

const BENEFIT_ICONS: LucideIcon[] = [ShieldCheck, Tag, Truck];

type Device = (typeof DEVICE_SELECTION.devices)[number];

function DeviceCard({ device }: { device: Device }) {
  const { whatsappPhone } = DEVICE_SELECTION;

  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border p-6 sm:p-8",
        device.highlighted
          ? "border-2 border-hero-accent/50 bg-gradient-to-br from-brand-50/70 to-white shadow-md md:-mt-1 md:mb-1"
          : "border-border bg-white",
      )}
    >
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span
            className={cn(
              "rounded-md px-2 py-1 font-mono text-[0.65rem] font-semibold uppercase tracking-wide",
              device.highlighted
                ? "bg-brand-50 text-hero-accent"
                : "bg-surface-alt text-hero-body",
            )}
          >
            {device.pathBadge}
          </span>
          <span
            className={cn(
              "text-xs font-semibold text-hero-accent",
              device.highlighted && "font-bold",
            )}
          >
            {device.tierLabel}
          </span>
        </div>

        <h3 className="font-display text-xl font-bold text-hero-heading sm:text-2xl">
          {device.name}
        </h3>
        <p
          className={cn(
            "mt-1 text-sm",
            device.highlighted ? "text-hero-accent" : "text-hero-body",
          )}
        >
          {device.subtitle}
        </p>
      </div>

      <ul className="mb-8 flex-1 space-y-0">
        {device.specs.map((spec, index) => {
          const SpecIcon = SPEC_ICONS[index] ?? Map;

          return (
            <li
              key={spec}
              className={cn(
                "flex items-center gap-3 border-b border-border py-3 text-sm last:border-b-0",
                device.highlighted ? "text-hero-heading" : "text-hero-body",
              )}
            >
              <SpecIcon
                className="h-4 w-4 shrink-0 text-hero-accent"
                strokeWidth={2}
                aria-hidden="true"
              />
              {spec}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span
          className={cn(
            "font-mono text-xl font-semibold",
            device.highlighted ? "text-hero-accent" : "text-hero-heading",
          )}
        >
          {device.priceLabel}
        </span>
        <button
          type="button"
          onClick={() =>
            openWhatsAppCheckout(device.whatsappName, device.price, whatsappPhone)
          }
          className={cn(
            "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[var(--radius-button)] px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hero-accent focus-visible:ring-offset-2",
            device.highlighted
              ? "bg-hero-accent text-white hover:bg-hero-accent/90"
              : "border border-border bg-white text-hero-heading hover:bg-white/80",
          )}
        >
          Buy via WhatsApp
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export function DeviceSelectionSection() {
  return (
    <section id="bytex-shop" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-alt px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-hero-accent">
            <Laptop size={14} strokeWidth={2.25} aria-hidden="true" />
            {DEVICE_SELECTION.eyebrow}
          </p>

          <h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-hero-heading sm:text-4xl lg:text-5xl">
            {DEVICE_SELECTION.title}
          </h2>

          <p className="mt-4 text-base leading-relaxed text-hero-body sm:text-lg">
            {DEVICE_SELECTION.description}
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-3 lg:items-stretch lg:gap-8">
          {DEVICE_SELECTION.devices.map((device) => (
            <DeviceCard key={device.name} device={device} />
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-surface-alt p-6 sm:mt-12 sm:p-8">
          <div className="grid gap-8 md:grid-cols-3 md:gap-6">
            {DEVICE_SELECTION.benefits.map((benefit, index) => {
              const BenefitIcon = BENEFIT_ICONS[index] ?? ShieldCheck;

              return (
                <div key={benefit.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-hero-accent shadow-sm">
                    <BenefitIcon size={18} strokeWidth={2} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-hero-heading">{benefit.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-hero-body">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-8 flex items-start justify-center gap-2 text-center text-sm text-hero-body sm:items-center">
          <Info className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" strokeWidth={2} aria-hidden="true" />
          <span>{DEVICE_SELECTION.disclaimer}</span>
        </p>
      </div>
    </section>
  );
}
