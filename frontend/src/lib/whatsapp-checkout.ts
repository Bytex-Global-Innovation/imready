export function openWhatsAppCheckout(
  deviceName: string,
  price: number,
  phone: string,
): void {
  const messageText = `Hello ByteX Edu! I would like to bypass the admission task and unlock my full IMReady journey by purchasing the *${deviceName}* laptop for *${price.toLocaleString("en-IN")}* through my college's campus MoU partnership. Please initiate my checkout setup.`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
