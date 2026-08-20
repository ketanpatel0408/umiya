/*
  Adds the User table (login + role-based access control) and an ownerId
  relation on Invoice so data can be scoped per user.

  Existing invoices predate authentication and have no owner, so this
  migration seeds an initial Admin account and assigns every pre-existing
  invoice to it before making the column required. No rows are dropped or
  duplicated.
*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- Seed the initial Admin account. Username "admin", default password
-- "Admin@12345" (hashed with scrypt) — change this password after first
-- login via the Reset Password / Change Password flow.
INSERT INTO "User" ("username", "passwordHash", "fullName", "email", "role", "isActive", "createdAt", "updatedAt")
VALUES (
  'admin',
  'scrypt:bbe113cd82f1e684b1be6afd575ca8fb:b71fa030193401784248f43bf0e7dd2f7a7763f42c564c0a6d3cedfdd2c9ffa08d5700366e4a1ad411d186f4e43cfeaf0afc5e8533490d8be8c5fcb72d3402a1',
  'Administrator',
  'admin@umiyagstportal.local',
  'ADMIN',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- AlterTable: add ownerId as nullable first so existing rows can be backfilled.
ALTER TABLE "Invoice" ADD COLUMN     "ownerId" INTEGER;

-- Backfill: existing (pre-auth) invoices are assigned to the seeded Admin
-- account so no data is lost or arbitrarily reassigned to a normal user.
UPDATE "Invoice" SET "ownerId" = (SELECT "id" FROM "User" WHERE "username" = 'admin') WHERE "ownerId" IS NULL;

-- Now that every row has an owner, enforce the NOT NULL constraint.
ALTER TABLE "Invoice" ALTER COLUMN "ownerId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Invoice_ownerId_idx" ON "Invoice"("ownerId");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
