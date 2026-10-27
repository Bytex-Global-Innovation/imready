/**
 * WhatsApp community for Foundation mission support.
 * Set NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL in production.
 */
export const WHATSAPP_COMMUNITY_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL?.trim() ||
  "https://chat.whatsapp.com/invite-placeholder-imready";
