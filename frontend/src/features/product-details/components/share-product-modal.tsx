"use client";

import Link from "next/link";
import { X } from "@/components/icons";

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

  const encodedUrl = encodeURIComponent(url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-product-title"
        className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-8 text-foreground"
      >
        <div className="absolute right-4 top-4">
          <button
            type="button"
            className="cursor-pointer font-semibold text-foreground hover:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2 id="share-product-title" className="mb-8 text-center text-lg font-bold text-foreground">
          Share this product
        </h2>

        <div className="mb-4 flex justify-center gap-6">
          <Link
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex cursor-pointer flex-col items-center hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <span className="flex h-9 w-11 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white">
              f
            </span>
            <p className="pt-2 text-xs text-muted">Facebook</p>
          </Link>

          <Link
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex cursor-pointer flex-col items-center hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <span className="flex h-9 w-11 items-center justify-center rounded bg-black text-sm font-bold text-white">
              X
            </span>
            <p className="pt-2 text-xs text-muted">X</p>
          </Link>

          <Link
            href={`https://wa.me/?text=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex cursor-pointer flex-col items-center hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <span className="flex h-9 w-11 items-center justify-center rounded bg-green-500 text-sm font-bold text-white">
              W
            </span>
            <p className="pt-2 text-xs text-muted">WhatsApp</p>
          </Link>
        </div>

        <div className="flex justify-center gap-6">
          <Link
            href={`mailto:?subject=Check this product&body=${encodedUrl}`}
            className="flex cursor-pointer flex-col items-center hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <span className="flex h-9 w-11 items-center justify-center rounded bg-gray-600 text-sm font-bold text-white">
              @
            </span>
            <p className="pt-2 text-xs text-muted">Email</p>
          </Link>

          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy link"
            className="flex cursor-pointer flex-col items-center hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <span className="flex h-9 w-11 items-center justify-center rounded bg-gray-200 text-sm font-bold text-gray-800">
              ⧉
            </span>
            <p className="pt-2 text-xs text-muted">Copy link</p>
          </button>
        </div>
      </div>
    </div>
  );
}
