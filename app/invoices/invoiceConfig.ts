/**
 * Static template-level configuration for the printed invoice document.
 *
 * Bank details and signatures are per-user (see the User model), so they
 * no longer live here.
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
  defaultTerms: [
    "This invoice is electronically generated.",
    "All disputes shall be subject to jurisdiction in SURENDRANAGAR.",
    "Goods sold are non-returnable.",
    "We are not liable for any damage during carriage.",
  ],
};
