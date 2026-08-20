-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sellerAddress" TEXT,
ADD COLUMN     "sellerGSTIN" TEXT,
ADD COLUMN     "sellerName" TEXT,
ADD COLUMN     "sellerPAN" TEXT,
ADD COLUMN     "sellerPhone" TEXT,
ADD COLUMN     "sellerState" TEXT,
ADD COLUMN     "sellerStateCode" TEXT;

-- Backfill: assign the existing UMIYA seller details (previously hardcoded in
-- app/invoices/invoiceConfig.ts) to the initial Admin account so Create New
-- Invoice continues to work without any hardcoded defaults.
UPDATE "User"
SET
  "sellerName" = 'UMIYA ELECTRICALS & MOTERS',
  "sellerAddress" = 'Ratnapar Fatak pase, ground floor, 3, Taramani Complex, Lati Bazar Road, Ratnapar, wadhwan, Surendranagar, Gujarat, 363020',
  "sellerPhone" = '9429051469',
  "sellerGSTIN" = '24DWPMP6186A1ZE',
  "sellerPAN" = 'DWPMP6186A',
  "sellerState" = 'Gujarat',
  "sellerStateCode" = '24'
WHERE "username" = 'admin';
