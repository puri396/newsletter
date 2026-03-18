-- Day 4: Neon.tech DB alignment script
-- Run this in Neon SQL Editor.
-- Recommended order:
-- 1) On a safe branch (e.g. day4-db-alignment)
-- 2) After testing, on your main/production branch

-- 1) Inspect current ContentType enum values
SELECT unnest(enum_range(NULL::"ContentType"));

-- 2) Ensure all expected values exist (newsletter, blog, image, video)
ALTER TYPE "ContentType" ADD VALUE IF NOT EXISTS 'newsletter';
ALTER TYPE "ContentType" ADD VALUE IF NOT EXISTS 'blog';
ALTER TYPE "ContentType" ADD VALUE IF NOT EXISTS 'image';
ALTER TYPE "ContentType" ADD VALUE IF NOT EXISTS 'video';

-- 3) See how many newsletters have a NULL contentType
SELECT COUNT(*) FROM "Newsletter" WHERE "contentType" IS NULL;

-- 4) Backfill legacy newsletters to use explicit contentType = 'newsletter'
UPDATE "Newsletter"
SET "contentType" = 'newsletter'
WHERE "contentType" IS NULL;

-- 5) Confirm there are no remaining NULL contentType values
SELECT COUNT(*) FROM "Newsletter" WHERE "contentType" IS NULL;

-- 6) Add soft-delete columns (safe no-op if they already exist)
ALTER TABLE "Newsletter" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMPTZ;
ALTER TABLE "Schedule"  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMPTZ;
ALTER TABLE "EmailLog"  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMPTZ;

