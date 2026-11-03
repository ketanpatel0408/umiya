-- Backfill Round Off for invoices saved while it was hardcoded to 0: the
-- Grand Total is rounded to the nearest rupee and Round Off holds the
-- difference, matching the API calculation. Amount columns are already
-- stored at 2 decimals, and ROUND() on numeric rounds half away from zero.
UPDATE "Invoice"
SET
  "grandTotal" = ROUND("subtotal" + "totalCGST" + "totalSGST" + "totalIGST", 0),
  "roundOff" = ROUND("subtotal" + "totalCGST" + "totalSGST" + "totalIGST", 0)
    - ("subtotal" + "totalCGST" + "totalSGST" + "totalIGST");
