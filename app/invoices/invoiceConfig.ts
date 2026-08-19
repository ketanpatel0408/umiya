/**
 * Static template-level configuration for the printed invoice document.
 *
 * These values are NOT part of the Prisma schema (no per-invoice bank
 * details exist in the database yet). They are centralized here so the
 * invoice document components don't hardcode them inline.
 */
export const invoiceConfig = {
  /**
   * Default seller snapshot used to prefill the invoice creation form.
   * There is no Seller table yet, so these values are editable per-invoice
   * and simply act as sensible defaults for the current single-seller setup.
   */
  seller: {
    sellerName: "UMIYA ELECTRICALS & MOTERS",
    sellerAddress:
      "Ratnapar Fatak pase, ground floor, 3, Taramani Complex, Lati Bazar Road, Ratnapar, wadhwan, Surendranagar, Gujarat, 363020",
    sellerPhone: "9429051469",
    sellerGSTIN: "24DWPMP6186A1ZE",
    sellerPAN: "DWPMP6186A",
    sellerState: "Gujarat",
    sellerStateCode: "24",
  },
  bank: {
    bankName: "Central Bank of India",
    branchName: "Joravarnagar Branch",
    accountNumber: "5389346177",
    ifscCode: "CBIN0280988",
  },
  defaultTerms: [
    "This invoice is electronically generated.",
    "All disputes shall be subject to jurisdiction in SURENDRANAGAR.",
    "Goods sold are non-returnable.",
    "We are not liable for any damage during carriage.",
  ],
};
