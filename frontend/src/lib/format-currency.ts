/** Format a positive INR amount for display (payouts, project price, etc.). */
export function formatInrAmount(amount: number | null | undefined): string | null {
  if (amount == null || !Number.isFinite(amount) || amount <= 0) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** @deprecated Use formatInrAmount */
export const formatInrPayout = formatInrAmount;
