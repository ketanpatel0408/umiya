-- Invoices created before their owner had bank details were saved with an
-- empty bank snapshot. Fill them from the owner's current bank details.
-- Invoices that already have bank details are left unchanged.
UPDATE "Invoice" AS i
SET
  "bankName" = u."bankName",
  "bankBranchName" = u."bankBranchName",
  "bankAccountNumber" = u."bankAccountNumber",
  "bankIfscCode" = u."bankIfscCode"
FROM "User" AS u
WHERE i."ownerId" = u."id"
  AND i."bankName" IS NULL
  AND i."bankBranchName" IS NULL
  AND i."bankAccountNumber" IS NULL
  AND i."bankIfscCode" IS NULL
  AND (
    u."bankName" IS NOT NULL
    OR u."bankBranchName" IS NOT NULL
    OR u."bankAccountNumber" IS NOT NULL
    OR u."bankIfscCode" IS NOT NULL
  );
