/**
 * Per-user invoice number templates.
 *
 * Tokens (case-sensitive):
 *   {FY}   financial year, short   "2026-27" -> "26-27"
 *   {FY4}  financial year, long    "2026-27" -> "2026-27"
 *   {YY}   FY start year           "2026-27" -> "26"
 *   {N}    sequence, min 2 digits  1 -> "01", 123 -> "123"
 *   {N3}   sequence, min 3 digits  1 -> "001"
 *   {N4}   sequence, min 4 digits  1 -> "0001"
 *
 * The sequence restarts every financial year, so a template must contain
 * exactly one {N..} token and at least one year token to stay unique.
 */

export const DEFAULT_INVOICE_NUMBER_FORMAT = "{FY}/{N}";

export const MAX_INVOICE_NUMBER_LENGTH = 40;

const TOKEN_PATTERN = /\{([A-Z0-9]+)\}/g;
const YEAR_TOKENS = ["FY", "FY4", "YY"];
const SEQ_TOKENS: Record<string, number> = { N: 2, N3: 3, N4: 4 };
const LITERAL_PATTERN = /^[A-Za-z0-9/\-_. ]*$/;

/** Returns an error message, or null when the template is usable. */
export function validateInvoiceNumberFormat(format: string): string | null {
  const tokens = [...format.matchAll(TOKEN_PATTERN)].map((m) => m[1]);
  const unknown = tokens.filter((t) => !YEAR_TOKENS.includes(t) && !(t in SEQ_TOKENS));
  if (unknown.length > 0) return `Unknown token {${unknown[0]}}`;
  const seqCount = tokens.filter((t) => t in SEQ_TOKENS).length;
  if (seqCount !== 1) return "Format must contain exactly one of {N}, {N3} or {N4}";
  if (!tokens.some((t) => YEAR_TOKENS.includes(t))) {
    return "Format must contain a year token: {FY}, {FY4} or {YY}";
  }
  if (!LITERAL_PATTERN.test(format.replace(TOKEN_PATTERN, ""))) {
    return "Only letters, numbers, spaces and / - _ . are allowed";
  }
  if (formatInvoiceNumber(format, "2026-27", 9999).length > MAX_INVOICE_NUMBER_LENGTH) {
    return "Format is too long";
  }
  return null;
}

/** Builds an invoice number from a template, e.g. ("KE/{FY}/{N3}", "2026-27", 5) -> "KE/26-27/005". */
export function formatInvoiceNumber(
  format: string | null | undefined,
  financialYear: string,
  sequence: number
): string {
  const [start, end] = financialYear.split("-");
  const values: Record<string, string> = {
    FY: `${start.slice(-2)}-${end}`,
    FY4: financialYear,
    YY: start.slice(-2),
  };
  return (format || DEFAULT_INVOICE_NUMBER_FORMAT).replace(TOKEN_PATTERN, (whole, token: string) => {
    if (token in SEQ_TOKENS) return String(sequence).padStart(SEQ_TOKENS[token], "0");
    return values[token] ?? whole;
  });
}

/** Validates a manually entered (historical) invoice number. */
export function isValidManualInvoiceNumber(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= MAX_INVOICE_NUMBER_LENGTH &&
    /^[A-Za-z0-9/\-_. ]+$/.test(value)
  );
}
