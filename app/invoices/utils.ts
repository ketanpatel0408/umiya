const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a numeric amount (or a Prisma Decimal string) as Indian currency,
 * e.g. "₹2,360.00".
 */
export function formatCurrency(value: string | number): string {
  const amount = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(amount)) return currencyFormatter.format(0);
  return currencyFormatter.format(amount);
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/**
 * Formats an ISO date string as a readable date, e.g. "19 Aug 2026".
 */
export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return dateFormatter.format(date);
}
