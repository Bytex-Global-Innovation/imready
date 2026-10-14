export const PREMIUM_PAYMENT = {
  planLabel: "Premium",
  amountInr: Number(process.env.NEXT_PUBLIC_PREMIUM_AMOUNT || "999"),
  upiId: process.env.NEXT_PUBLIC_PREMIUM_UPI_ID || "imready@upi",
  payeeName: process.env.NEXT_PUBLIC_PREMIUM_PAYEE_NAME || "ImReady",
  note: "ImReady Premium Plan",
} as const;

/** UPI deep-link used to build the QR code. */
export function buildPremiumUpiUri() {
  const params = new URLSearchParams({
    pa: PREMIUM_PAYMENT.upiId,
    pn: PREMIUM_PAYMENT.payeeName,
    am: String(PREMIUM_PAYMENT.amountInr),
    cu: "INR",
    tn: PREMIUM_PAYMENT.note,
  });
  return `upi://pay?${params.toString()}`;
}

export function premiumQrImageUrl(size = 220) {
  const data = encodeURIComponent(buildPremiumUpiUri());
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${data}`;
}
