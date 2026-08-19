const ONES = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
  "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
  "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];

const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy",
  "Eighty", "Ninety",
];

function convertBelowThousand(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ONES[n];
  if (n < 100) {
    const ten = Math.floor(n / 10);
    const rest = n % 10;
    return TENS[ten] + (rest ? " " + ONES[rest] : "");
  }
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  return ONES[hundred] + " Hundred" + (rest ? " " + convertBelowThousand(rest) : "");
}

/**
 * Converts a whole number into words using the Indian numbering system
 * (Crore, Lakh, Thousand, Hundred).
 */
function convertIndianInteger(value: number): string {
  if (value === 0) return "Zero";

  const crore = Math.floor(value / 10000000);
  value %= 10000000;
  const lakh = Math.floor(value / 100000);
  value %= 100000;
  const thousand = Math.floor(value / 1000);
  value %= 1000;
  const hundred = value;

  const parts: string[] = [];
  if (crore) parts.push(convertBelowThousand(crore) + " Crore");
  if (lakh) parts.push(convertBelowThousand(lakh) + " Lakh");
  if (thousand) parts.push(convertBelowThousand(thousand) + " Thousand");
  if (hundred) parts.push(convertBelowThousand(hundred));

  return parts.join(" ");
}

/**
 * Converts a monetary amount (numeric or Prisma Decimal string) into
 * Indian currency words, matching the original Umiya template's format,
 * e.g. 111109.00 -> "One Lakh Eleven Thousand One Hundred Nine Rupees
 * Only", and 16948.98 -> "Sixteen Thousand Nine Hundred Forty Eight And
 * Ninety Eight Paise Only".
 *
 * Handles integer rupees and paise (decimal) safely, and returns a
 * sensible result for zero.
 */
export function numberToWords(value: string | number): string {
  const amount = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(amount) || amount < 0) return "Zero Rupees Only";

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  const rupeeWords = convertIndianInteger(rupees);

  if (paise > 0) {
    return `${rupeeWords} And ${convertBelowThousand(paise)} Paise Only`;
  }

  return `${rupeeWords} Rupees Only`;
}
