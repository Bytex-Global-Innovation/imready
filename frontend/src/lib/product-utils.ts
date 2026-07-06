export function splitCommentPoints(comments: string): string[] {
  return comments
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function getFirstComment(comments: string): string {
  return splitCommentPoints(comments)[0] ?? "";
}

export function parsePrice(value: string): number {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export function getDisplayPrice(price: string, specialPrice: string): string {
  const specialNumeric = parsePrice(specialPrice);
  const marketNumeric = parsePrice(price);
  return specialNumeric > 0 && specialNumeric < marketNumeric ? specialPrice : price;
}

export function getSpecValue(
  value: string | number | undefined | null,
): string {
  return value != null && value !== "" ? String(value) : "-";
}
