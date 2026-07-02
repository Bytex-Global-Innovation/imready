"use client";

import Link from "next/link";
import { X } from "lucide-react";
import {
  PRODUCT_DETAIL_COPY,
  PRODUCT_DETAIL_SHARE_CLASSES,
} from "@/constants";

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
    <div className={PRODUCT_DETAIL_SHARE_CLASSES.backdrop}>
      <div role="dialog" aria-modal="true" className={PRODUCT_DETAIL_SHARE_CLASSES.dialog}>
        <div className="absolute right-4 top-4">
          <button
            type="button"
            className={PRODUCT_DETAIL_SHARE_CLASSES.closeBtn}
            onClick={onClose}
            aria-label={PRODUCT_DETAIL_COPY.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <h2 className="mb-8 text-center text-lg font-bold">{PRODUCT_DETAIL_COPY.shareTitle}</h2>
        <div className="mb-4 flex justify-center gap-6">
          <Link
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={PRODUCT_DETAIL_SHARE_CLASSES.link}
          >
            <span className={PRODUCT_DETAIL_SHARE_CLASSES.facebook}>f</span>
            <p className={PRODUCT_DETAIL_SHARE_CLASSES.label}>{PRODUCT_DETAIL_COPY.shareFacebook}</p>
          </Link>
          <Link
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={PRODUCT_DETAIL_SHARE_CLASSES.link}
          >
            <span className={PRODUCT_DETAIL_SHARE_CLASSES.x}>X</span>
            <p className={PRODUCT_DETAIL_SHARE_CLASSES.label}>{PRODUCT_DETAIL_COPY.shareX}</p>
          </Link>
          <Link
            href={`https://wa.me/?text=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={PRODUCT_DETAIL_SHARE_CLASSES.link}
          >
            <span className={PRODUCT_DETAIL_SHARE_CLASSES.whatsapp}>W</span>
            <p className={PRODUCT_DETAIL_SHARE_CLASSES.label}>{PRODUCT_DETAIL_COPY.shareWhatsapp}</p>
          </Link>
        </div>
        <div className="flex justify-center gap-6">
          <Link
            href={`mailto:?subject=Check this product&body=${encodeURIComponent(url)}`}
            className={PRODUCT_DETAIL_SHARE_CLASSES.link}
          >
            <span className={PRODUCT_DETAIL_SHARE_CLASSES.email}>@</span>
            <p className={PRODUCT_DETAIL_SHARE_CLASSES.label}>{PRODUCT_DETAIL_COPY.shareEmail}</p>
          </Link>
          <button
            type="button"
            onClick={handleCopy}
            className={PRODUCT_DETAIL_SHARE_CLASSES.link}
          >
            <span className={PRODUCT_DETAIL_SHARE_CLASSES.copy}>⧉</span>
            <p className={PRODUCT_DETAIL_SHARE_CLASSES.label}>{PRODUCT_DETAIL_COPY.shareCopyLink}</p>
          </button>
        </div>
      </div>
    </div>
  );
}
