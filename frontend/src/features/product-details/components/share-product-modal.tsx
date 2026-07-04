"use client";

import Link from "next/link";
import { X } from "lucide-react";

const classes = {
  backdrop: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
  dialog: "relative mx-4 w-full max-w-md rounded-[18px] bg-white p-8 text-foreground",
  closeBtn: "cursor-pointer font-semibold text-foreground hover:text-gray-600",
  link: "flex cursor-pointer flex-col items-center hover:underline",
  label: "pt-2 text-[13px]",
  facebook: "flex h-9 w-11 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white",
  x: "flex h-9 w-11 items-center justify-center rounded bg-black text-sm font-bold text-white",
  whatsapp: "flex h-9 w-11 items-center justify-center rounded bg-green-500 text-sm font-bold text-white",
  email: "flex h-9 w-11 items-center justify-center rounded bg-gray-600 text-sm font-bold text-white",
  copy: "flex h-9 w-11 items-center justify-center rounded bg-gray-200 text-sm font-bold text-gray-800",
} as const;

interface ShareProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  onCopy?: () => void;
}

export function ShareProductModal({
  isOpen,
  onClose,
  url,
  onCopy,
}: ShareProductModalProps) {
  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      onCopy?.();
    } catch {
      // ignore
    }
  };

  return (
    <div className={classes.backdrop}>
      <div role="dialog" aria-modal="true" className={classes.dialog}>
        <div className="absolute right-4 top-4">
          <button
            type="button"
            className={classes.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <h2 className="mb-8 text-center text-lg font-bold">Share this product</h2>
        <div className="mb-4 flex justify-center gap-6">
          <Link
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={classes.link}
          >
            <span className={classes.facebook}>f</span>
            <p className={classes.label}>Facebook</p>
          </Link>
          <Link
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={classes.link}
          >
            <span className={classes.x}>X</span>
            <p className={classes.label}>X</p>
          </Link>
          <Link
            href={`https://wa.me/?text=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={classes.link}
          >
            <span className={classes.whatsapp}>W</span>
            <p className={classes.label}>WhatsApp</p>
          </Link>
        </div>
        <div className="flex justify-center gap-6">
          <Link
            href={`mailto:?subject=Check this product&body=${encodeURIComponent(url)}`}
            className={classes.link}
          >
            <span className={classes.email}>@</span>
            <p className={classes.label}>Email</p>
          </Link>
          <button
            type="button"
            onClick={handleCopy}
            className={classes.link}
          >
            <span className={classes.copy}>⧉</span>
            <p className={classes.label}>Copy link</p>
          </button>
        </div>
      </div>
    </div>
  );
}
