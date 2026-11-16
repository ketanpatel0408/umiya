-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "sequenceNumber" INTEGER;

-- Backfill: existing numbers use the default "YY-YY/N" format, so the counter
-- value is the trailing number.
UPDATE "Invoice"
SET "sequenceNumber" = CAST(substring("invoiceNumber" FROM '/([0-9]+)$') AS INTEGER)
WHERE "invoiceNumber" ~ '^[0-9]{2}-[0-9]{2}/[0-9]+$';
