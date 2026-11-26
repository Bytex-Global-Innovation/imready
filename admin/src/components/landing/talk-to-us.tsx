import {
  SITE,
  contactEmail,
  whatsappUrl,
} from "@/constants/founder-landing";

export default function TalkToUs({
  className = "",
  compact = false,
}: {
  className?: string;
  /** Shorter label for tight header layouts. */
  compact?: boolean;
}) {
  const whatsapp = whatsappUrl();
  const email = contactEmail();
  const href = whatsapp ?? SITE.linkedIn;
  const channel = whatsapp ? "WhatsApp" : "LinkedIn";

  return (
    <div className={className}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center whitespace-nowrap text-sm font-semibold underline underline-offset-4"
      >
        {compact ? "Talk to us" : "Have a question first? Talk to us"}
        <span className="sr-only"> on {channel} (opens in a new tab)</span>
      </a>
      {!compact && email ? (
        <a
          href={`mailto:${email}`}
          className="mt-1 block min-h-11 text-sm font-medium underline underline-offset-4 sm:mt-0 sm:ml-4 sm:inline-flex sm:items-center"
        >
          Email {email}
        </a>
      ) : null}
    </div>
  );
}
